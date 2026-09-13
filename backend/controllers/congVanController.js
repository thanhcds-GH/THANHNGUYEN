const { sql } = require('../config/db');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// =========================================================================
// 1. Lấy danh sách công văn & Tìm kiếm (Hỗ trợ tìm nhanh và tìm sâu toàn văn)
// =========================================================================
const getDanhSachCongVan = async (req, res) => {
    try {
        const { keyword, loaiCv, searchInContent } = req.query;
        const request = new sql.Request();

        let queryStr = `
            SELECT 
                cv.MA_CONGVAN,
                cv.SO_KIEU_HIEU,
                cv.LOAI_CV,
                cv.TEN_CONGVAN,
                cv.NOI_GURI_NHAN,
                CONVERT(varchar, cv.NGAY_TIEP_NHAN, 23) AS NGAY_TIEP_NHAN,
                CONVERT(varchar, cv.HAN_GIAI_QUYET, 23) AS HAN_GIAI_QUYET,
                cv.NGUOI_KY_DUYET,
                cv.TRANG_THAI_CV,
                cv.FILE_PATH,
                CASE 
                    WHEN hd.MA_HOAT_DONG IS NOT NULL THEN 1 
                    ELSE 0 
                END AS DA_LEN_LICH_TRIEU_TAP
            FROM dbo.CONG_VAN cv
            LEFT JOIN dbo.HOAT_DONG_TRIEU_TAP hd ON cv.MA_CONGVAN = hd.MA_CONGVAN
            WHERE 1 = 1
        `;

        // 1. Lọc theo Loại công văn (Den / Di / ALL)
        if (loaiCv && loaiCv !== 'ALL') {
            request.input('loaiCv', sql.NVarChar(50), loaiCv);
            queryStr += ` AND cv.LOAI_CV = @loaiCv`;
        }

        // 2. Lọc theo Từ khóa tìm kiếm
        if (keyword && keyword.trim() !== '') {
            request.input('keyword', sql.NVarChar(255), `%${keyword.trim()}%`);

            if (searchInContent === 'true' || searchInContent === true) {
                queryStr += ` AND (
                    cv.SO_KIEU_HIEU LIKE @keyword 
                    OR cv.TEN_CONGVAN LIKE @keyword 
                    OR cv.NOI_GURI_NHAN LIKE @keyword 
                    OR cv.NGUOI_KY_DUYET LIKE @keyword
                    OR cv.NOI_DUNG_TOAN_VAN LIKE @keyword
                )`;
            } else {
                queryStr += ` AND (
                    cv.SO_KIEU_HIEU LIKE @keyword 
                    OR cv.TEN_CONGVAN LIKE @keyword 
                    OR cv.NOI_GURI_NHAN LIKE @keyword 
                    OR cv.NGUOI_KY_DUYET LIKE @keyword
                )`;
            }
        }

        queryStr += ` ORDER BY cv.NGAY_TIEP_NHAN DESC`;

        const result = await request.query(queryStr);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Lỗi tại getDanhSachCongVan:', err);
        res.status(500).json({ message: 'Lỗi hệ thống khi tải danh sách công văn!' });
    }
};

// =========================================================================
// 2. Tiếp nhận, trích xuất text từ file PDF và lưu trữ công văn mới
// =========================================================================
const themCongVanMoi = async (req, res) => {
    // 1. Gán fallback an toàn nếu req.body bị undefined
    const body = req.body || {};
    
    const { 
        SO_KIEU_HIEU, 
        LOAI_CV, 
        TEN_CONGVAN, 
        NOI_GURI_NHAN, 
        NGAY_TIEP_NHAN, 
        HAN_GIAI_QUYET, 
        NGUOI_KY_DUYET 
    } = body;

    // 2. Bắt lỗi thiếu thông tin bắt buộc đầu vào
    if (!SO_KIEU_HIEU || !LOAI_CV || !TEN_CONGVAN || !NOI_GURI_NHAN || !NGAY_TIEP_NHAN || !NGUOI_KY_DUYET) {
        return res.status(400).json({ 
            message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)' 
        });
    }

    try {
        let filePath = null;
        let noiDungToanVan = '';

        // Đọc và trích xuất nội dung từ tệp PDF nếu có đính kèm
        if (req.file) {
            filePath = `/uploads/congvan/${req.file.filename}`;
            try {
                if (fs.existsSync(req.file.path)) {
                    const dataBuffer = fs.readFileSync(req.file.path);
                    const parsedPdf = await pdfParse(dataBuffer);
                    noiDungToanVan = parsedPdf.text || '';
                }
            } catch (parseErr) {
                console.warn('Cảnh báo đọc text PDF:', parseErr.message);
                noiDungToanVan = '';
            }
        }

        // Tạo request từ kết nối CSDL đã thiết lập sẵn
        const request = new sql.Request();
        
        request.input('SO_KIEU_HIEU', sql.NVarChar(50), SO_KIEU_HIEU);
        request.input('LOAI_CV', sql.NVarChar(20), LOAI_CV);
        request.input('TEN_CONGVAN', sql.NVarChar(sql.MAX), TEN_CONGVAN);
        request.input('NOI_GURI_NHAN', sql.NVarChar(255), NOI_GURI_NHAN);
        request.input('NGAY_TIEP_NHAN', sql.Date, NGAY_TIEP_NHAN);
        request.input('HAN_GIAI_QUYET', sql.Date, (HAN_GIAI_QUYET && HAN_GIAI_QUYET.trim() !== '') ? HAN_GIAI_QUYET : null);
        request.input('NGUOI_KY_DUYET', sql.NVarChar(100), NGUOI_KY_DUYET);
        request.input('FILE_PATH', sql.NVarChar(500), filePath);
        request.input('NOI_DUNG_TOAN_VAN', sql.NVarChar(sql.MAX), noiDungToanVan);

        const queryStr = `
            INSERT INTO dbo.CONG_VAN (
                SO_KIEU_HIEU, LOAI_CV, TEN_CONGVAN, NOI_GURI_NHAN, 
                NGAY_TIEP_NHAN, HAN_GIAI_QUYET, NGUOI_KY_DUYET,
                FILE_PATH, NOI_DUNG_TOAN_VAN, TRANG_THAI_CV
            )
            VALUES (
                @SO_KIEU_HIEU, @LOAI_CV, @TEN_CONGVAN, @NOI_GURI_NHAN, 
                @NGAY_TIEP_NHAN, @HAN_GIAI_QUYET, @NGUOI_KY_DUYET,
                @FILE_PATH, @NOI_DUNG_TOAN_VAN, N'Chờ xử lý'
            )
        `;

        await request.query(queryStr);
        return res.status(201).json({ 
            message: 'Tiếp nhận và lưu trữ công văn thành công!' 
        });

    } catch (err) {
        console.error('Lỗi SQL khi lưu công văn:', err);
        return res.status(500).json({ 
            message: err.message || 'Lỗi lưu trữ dữ liệu vào CSDL!' 
        });
    }
};

// =========================================================================
// 3. Cập nhật trạng thái nghiệp vụ xử lý công văn (Triển khai / Triệu tập)
// =========================================================================
const capNhatTrangThaiCongVan = async (req, res) => {
    const maCongVan = parseInt(req.params.id, 10);
    const { actionType } = req.body;

    if (isNaN(maCongVan) || !actionType) {
        return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ!' });
    }

    try {
        const request = new sql.Request();

        if (actionType === 'TRIEN_KHAI') {
            await request
                .input('maCV', sql.Int, maCongVan)
                .query(`
                    UPDATE dbo.CONG_VAN 
                    SET TRANG_THAI_CV = N'Đã triển khai'
                    WHERE MA_CONGVAN = @maCV
                `);
                
            return res.status(200).json({ 
                message: 'Hệ thống đã lưu trạng thái triển khai văn bản thành công.' 
            });

        } else if (actionType === 'TRIEU_TAP') {
            await request
                .input('maCV', sql.Int, maCongVan)
                .query(`
                    UPDATE dbo.CONG_VAN 
                    SET TRANG_THAI_CV = N'Đã triệu tập'
                    WHERE MA_CONGVAN = @maCV
                `);

            return res.status(200).json({ 
                message: 'Hệ thống đã chuyển luồng sang triệu tập theo kế hoạch.' 
            });
        } else {
            return res.status(400).json({ message: 'Hành động nghiệp vụ không hợp lệ!' });
        }

    } catch (error) {
        console.error('Lỗi chi tiết tại hệ thống Backend:', error);
        return res.status(500).json({ 
            message: 'Không thể thực thi câu lệnh UPDATE trên cơ sở dữ liệu SQL Server.' 
        });
    }
};

module.exports = {
    getDanhSachCongVan,
    themCongVanMoi,
    capNhatTrangThaiCongVan
};