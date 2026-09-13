const express = require('express');
const router = express.Router();
const sql = require('mssql');
const ExcelJS = require('exceljs');

/**
 * API 1: LƯU FORM TRIỆU TẬP VÀ ĐỒNG BỘ ĐIỂM DANH QUA STORED PROCEDURE
 * POST: /api/trieu-tap/luu-va-dong-bo
 */
router.post('/luu-va-dong-bo', async (req, res) => {
    let pool;
    try {
        const { 
            MA_CONGVAN, 
            TEN_HOAT_DONG, 
            NGAY_TO_CHUC, 
            BUOI_TRIEU_TAP, 
            GIO_BAT_DAU,
            NAM_HOC, 
            DIA_DIEM, 
            NGUOI_CHU_TRI
        } = req.body;

        if (!MA_CONGVAN || !TEN_HOAT_DONG || !NGAY_TO_CHUC || !BUOI_TRIEU_TAP || !NAM_HOC || !NGUOI_CHU_TRI) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: Công văn, Tên hoạt động, Ngày, Buổi, Năm học và Người chủ trì!' 
            });
        }

        pool = await sql.connect();
        const spRequest = new sql.Request(pool);
        const formattedDate = new Date(NGAY_TO_CHUC).toISOString().slice(0, 10);

        spRequest.input('MaCongVan', sql.Int, parseInt(MA_CONGVAN, 10));
        spRequest.input('TenHoatDong', sql.NVarChar(255), TEN_HOAT_DONG.trim());
        spRequest.input('NgayToChuc', sql.VarChar(10), formattedDate);
        spRequest.input('Buoi', sql.NVarChar(20), BUOI_TRIEU_TAP.trim());
        spRequest.input('GioBatDau', sql.NVarChar(20), (GIO_BAT_DAU || '08h00').trim());
        spRequest.input('NamHoc', sql.VarChar(15), NAM_HOC.trim());
        spRequest.input('NguoiChuTri', sql.NVarChar(100), NGUOI_CHU_TRI.trim());
        spRequest.input('DiaDiem', sql.NVarChar(255), (DIA_DIEM || 'Hội trường 350 chỗ').trim());

        const result = await spRequest.execute('dbo.sp_TrieuTapHoatDong');
        const procedureResult = result.recordset && result.recordset[0];

        if (procedureResult) {
            if (procedureResult.Success === 1) {
                return res.status(200).json({
                    success: true,
                    message: procedureResult.Message || 'Khởi tạo hoạt động và đồng bộ lịch điểm danh thành công!',
                    maHoatDong: procedureResult.MaHoatDong
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Lỗi từ CSDL: ${procedureResult.Message}`
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Stored Procedure không trả về kết quả trạng thái (Recordset trống).'
        });
    } catch (error) {
        console.error("Lỗi quy trình lưu và đồng bộ triệu tập tại Backend:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Hệ thống SQL Server từ chối thực thi do xung đột dữ liệu cấu trúc.',
            error: error.message 
        });
    }
});

/**
 * API 2: LẤY CHI TIẾT DANH SÁCH GIẢNG VIÊN VÀ TÊN PHIÊN TRIỆU TẬP
 * GET: /api/diem-danh/:maHoatDong
 */
router.get('/diem-danh/:maHoatDong', async (req, res) => {
    try {
        const { maHoatDong } = req.params;
        if (!maHoatDong || isNaN(maHoatDong)) {
            return res.status(400).json({
                success: false,
                message: 'Mã hoạt động triệu tập không hợp lệ hoặc không tồn tại.'
            });
        }

        const pool = await sql.connect();
        const inputId = parseInt(maHoatDong, 10);

        // Tự động phân giải ID thực tế: Tra cứu xem inputId là MA_HOAT_DONG hay MA_CONGVAN
        let resolvedMaHoatDong = inputId;
        let detectedActivityName = '';

        const checkRequest = new sql.Request(pool);
        checkRequest.input('InputId', sql.Int, inputId);
        const checkResult = await checkRequest.query(`
            SELECT TOP 1 MA_HOAT_DONG, TEN_HOAT_DONG 
            FROM dbo.HOAT_DONG_TRIEU_TAP 
            WHERE MA_HOAT_DONG = @InputId OR MA_CONGVAN = @InputId
            ORDER BY MA_HOAT_DONG DESC
        `);

        if (checkResult.recordset && checkResult.recordset.length > 0) {
            resolvedMaHoatDong = checkResult.recordset[0].MA_HOAT_DONG;
            detectedActivityName = checkResult.recordset[0].TEN_HOAT_DONG || '';
        }

        // Nếu chưa có tên hoạt động, tra cứu từ bảng CONG_VAN
        if (!detectedActivityName) {
            try {
                const cvRequest = new sql.Request(pool);
                cvRequest.input('IdCV', sql.Int, inputId);
                const cvResult = await cvRequest.query(`
                    SELECT TOP 1 TEN_CONGVAN FROM dbo.CONG_VAN WHERE MA_CONGVAN = @IdCV
                `);
                if (cvResult.recordset && cvResult.recordset.length > 0) {
                    detectedActivityName = cvResult.recordset[0].TEN_CONGVAN;
                }
            } catch (err) {
                console.warn("Không tìm thấy tên công văn:", err.message);
            }
        }

        if (detectedActivityName) {
            detectedActivityName = detectedActivityName
                .replace(/^Hội nghị triển khai văn bản\s*:\s*/i, '')
                .trim();
        }

        // Gọi Stored Procedure lấy danh sách điểm danh
        const spRequest = new sql.Request(pool);
        spRequest.input('MaHoatDong', sql.Int, resolvedMaHoatDong);
        const result = await spRequest.execute('dbo.sp_GetDanhSachDiemDanhTrieuTap');

        return res.status(200).json({
            maHoatDong: resolvedMaHoatDong,
            tenHoatDong: detectedActivityName || `Hoạt động triệu tập số ${resolvedMaHoatDong}`,
            danhSach: (result.recordset || []).map(row => ({
                MA_GIANGVIEN: row.MA_GIANGVIEN,
                HOTEN: row.HOTEN || row.TEN_GIANGVIEN,
                CO_GIO_LEN_LOP: row.CO_GIO_LEN_LOP,
                TRANG_THAI_DI_HOP: row.TRANG_THAI_DI_HOP,
                XIN_PHEP_TRUONG_KHOA: row.XIN_PHEP_TRUONG_KHOA,
                LY_DO_XIN_PHEP: row.LY_DO_XIN_PHEP
            }))
        });
    } catch (error) {
        console.error("Lỗi khi truy vấn danh sách điểm danh triệu tập tại Backend:", error);
        return res.status(500).json({
            success: false,
            message: 'Hệ thống Backend không thể đọc dữ liệu phiên điểm danh triệu tập trong CSDL.',
            error: error.message
        });
    }
});

/**
 * API 3: LƯU KẾT QUẢ ĐIỂM DANH TRIỆU TẬP (HÀM UPSERT - MERGE TRONG SQL SERVER)
 * POST: /api/diem-danh/luu
 */
router.post('/diem-danh/luu', async (req, res) => {
    let transaction;
    try {
        const { maHoatDong, danhSachDiemDanh } = req.body;

        if (!maHoatDong || !Array.isArray(danhSachDiemDanh)) {
            return res.status(400).json({
                success: false,
                message: 'Cấu trúc yêu cầu không hợp lệ hoặc dữ liệu danh sách điểm danh bị trống.'
            });
        }

        const pool = await sql.connect();
        const inputId = parseInt(maHoatDong, 10);

        // ĐẢM BẢO KHÓA NGOẠI: Phân giải chính xác MA_HOAT_DONG hợp lệ trong CSDL
        let targetMaHoatDong = inputId;
        const checkHD = new sql.Request(pool);
        checkHD.input('InputId', sql.Int, inputId);
        const hdRecord = await checkHD.query(`
            SELECT TOP 1 MA_HOAT_DONG 
            FROM dbo.HOAT_DONG_TRIEU_TAP 
            WHERE MA_HOAT_DONG = @InputId OR MA_CONGVAN = @InputId
            ORDER BY MA_HOAT_DONG DESC
        `);

        if (hdRecord.recordset && hdRecord.recordset.length > 0) {
            targetMaHoatDong = hdRecord.recordset[0].MA_HOAT_DONG;
        }

        // Bắt đầu Transaction bảo toàn dữ liệu
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        for (const gv of danhSachDiemDanh) {
            const request = new sql.Request(transaction);
            
            request.input('MaHoatDong', sql.Int, targetMaHoatDong);
            request.input('MaGiangVien', sql.Int, parseInt(gv.MA_GIANGVIEN, 10));
            request.input('CoGioLenLop', sql.Bit, gv.CO_GIO_LEN_LOP ? 1 : 0);
            request.input('TrangThaiDiHop', sql.NVarChar(50), gv.TRANG_THAI_DI_HOP || 'Chưa điểm danh');
            request.input('XinPhepTruongKhoa', sql.Bit, gv.XIN_PHEP_TRUONG_KHOA ? 1 : 0);
            request.input('LyDoXinPhep', sql.NVarChar(255), gv.LY_DO_XIN_PHEP ? String(gv.LY_DO_XIN_PHEP).trim() : null);

            const upsertQuery = `
                MERGE INTO dbo.DIEM_DANH_TRIEU_TAP AS Target
                USING (SELECT @MaHoatDong AS MaHD, @MaGiangVien AS MaGV) AS Source
                ON (Target.MA_HOAT_DONG = Source.MaHD AND Target.MA_GIANGVIEN = Source.MaGV)
                WHEN MATCHED THEN
                    UPDATE SET 
                        TRANG_THAI_DI_HOP = @TrangThaiDiHop,
                        XIN_PHEP_TRUONG_KHOA = @XinPhepTruongKhoa,
                        LY_DO_XIN_PHEP = @LyDoXinPhep,
                        NHAT_KY_CAP_NHAT = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (MA_HOAT_DONG, MA_GIANGVIEN, CO_GIO_LEN_LOP, TRANG_THAI_DI_HOP, XIN_PHEP_TRUONG_KHOA, LY_DO_XIN_PHEP, NHAT_KY_CAP_NHAT)
                    VALUES (Source.MaHD, Source.MaGV, @CoGioLenLop, @TrangThaiDiHop, @XinPhepTruongKhoa, @LyDoXinPhep, GETDATE());
            `;
            await request.query(upsertQuery);
        }

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Đã lưu và đồng bộ toàn bộ kết quả điểm danh giảng viên thành công vào hệ thống!'
        });
    } catch (error) {
        if (transaction) {
            try { await transaction.rollback(); } catch (_) {}
        }
        console.error("Lỗi hệ thống quy trình lưu kết quả điểm danh tại Backend:", error);
        return res.status(500).json({
            success: false,
            message: 'Hệ thống Backend không thể hoàn tất lưu điểm danh do xung đột thực thi CSDL.',
            error: error.message
        });
    }
});

/**
 * API 4: KẾT XUẤT BÁO CÁO EXCEL DANH SÁCH ĐIỂM DANH THEO PHIÊN TRIỆU TẬP
 * GET: /api/diem-danh/xuat-excel/:maHoatDong
 */
/**
 * API 4: KẾT XUẤT BÁO CÁO EXCEL DANH SÁCH ĐIỂM DANH THEO PHIÊN TRIỆU TẬP
 * GET: /api/diem-danh/xuat-excel/:maHoatDong
 * ĐÃ ĐIỀU CHỈNH: CHỈ LẤY GIẢNG VIÊN ĐANG CÔNG TÁC (TRANGTHAI = 1)
 */
router.get('/diem-danh/xuat-excel/:maHoatDong', async (req, res) => {
    try {
        const { maHoatDong } = req.params;
        const pool = await sql.connect();
        const inputId = parseInt(maHoatDong, 10);

        let targetMaHoatDong = inputId;
        let tenHoatDong = 'DANH SÁCH ĐIỂM DANH TRIỆU TẬP';

        // 1. Phân giải chính xác MA_HOAT_DONG và lấy tên hoạt động
        const infoRequest = new sql.Request(pool);
        infoRequest.input('InputId', sql.Int, inputId);
        const infoResult = await infoRequest.query(`
            SELECT TOP 1 MA_HOAT_DONG, TEN_HOAT_DONG 
            FROM dbo.HOAT_DONG_TRIEU_TAP 
            WHERE MA_HOAT_DONG = @InputId OR MA_CONGVAN = @InputId
            ORDER BY MA_HOAT_DONG DESC
        `);

        if (infoResult.recordset && infoResult.recordset.length > 0) {
            targetMaHoatDong = infoResult.recordset[0].MA_HOAT_DONG;
            tenHoatDong = (infoResult.recordset[0].TEN_HOAT_DONG || '')
                .replace(/^Hội nghị triển khai văn bản\s*:\s*/i, '')
                .trim();
        }

        // 2. Lấy danh sách điểm danh và CHỈ LẤY GIẢNG VIÊN CÓ TRANGTHAI = 1
        // (Truy vấn kết hợp INNER JOIN với bảng GIANG_VIEN để loại bỏ hoàn toàn TRANGTHAI = 0)
        const dataRequest = new sql.Request(pool);
        dataRequest.input('MaHD', sql.Int, targetMaHoatDong);
        
        const dataResult = await dataRequest.query(`
            SELECT 
                dd.MA_GIANGVIEN,
                gv.HOTEN,
                dd.CO_GIO_LEN_LOP,
                dd.TRANG_THAI_DI_HOP,
                dd.LY_DO_XIN_PHEP
            FROM dbo.DIEM_DANH_TRIEU_TAP dd
            INNER JOIN dbo.GIANG_VIEN gv ON dd.MA_GIANGVIEN = gv.MA_GIANGVIEN
            WHERE dd.MA_HOAT_DONG = @MaHD AND gv.TRANGTHAI = 1
            ORDER BY gv.MA_GIANGVIEN ASC
        `);

        // 3. Khởi tạo bảng tính ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DiemDanhTrieuTap');

        // Định nghĩa cột trước để định vị layout
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'Mã Giảng Viên', key: 'maGV', width: 16 },
            { header: 'Họ và Tên Giảng Viên', key: 'hoTen', width: 30 },
            { header: 'Lịch Giảng Dạy', key: 'lichTrung', width: 18 },
            { header: 'Trạng Thái Điểm Danh', key: 'trangThai', width: 25 },
            { header: 'Lý Do / Ghi Chú Minh Chứng', key: 'ghiChu', width: 35 }
        ];

        // Dòng 1: Banner Tiêu đề lớn
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `BẢNG ĐIỂM DANH: ${tenHoatDong.toUpperCase()}`;
        titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        worksheet.getRow(1).height = 40;

        // Dòng 2: Tiêu đề các cột
        const headerRow = worksheet.getRow(2);
        headerRow.values = [
            'STT',
            'Mã Giảng Viên',
            'Họ và Tên Giảng Viên',
            'Lịch Giảng Dạy',
            'Trạng Thái Điểm Danh',
            'Lý Do / Ghi Chú Minh Chứng'
        ];
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E293B' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        });

        // 4. Đổ dữ liệu các giảng viên có TRANGTHAI = 1 (Đánh lại STT chuẩn từ 1..19)
        if (dataResult.recordset && dataResult.recordset.length > 0) {
            dataResult.recordset.forEach((row, index) => {
                const addedRow = worksheet.addRow({
                    stt: index + 1,
                    maGV: row.MA_GIANGVIEN,
                    hoTen: row.HOTEN,
                    lichTrung: row.CO_GIO_LEN_LOP ? 'Có giờ lên lớp' : 'Trống lịch',
                    trangThai: row.TRANG_THAI_DI_HOP || 'Chưa điểm danh',
                    ghiChu: row.LY_DO_XIN_PHEP || '-'
                });

                addedRow.height = 22;
                addedRow.getCell('stt').alignment = { horizontal: 'center', vertical: 'middle' };
                addedRow.getCell('maGV').alignment = { horizontal: 'center', vertical: 'middle' };
                addedRow.getCell('lichTrung').alignment = { horizontal: 'center', vertical: 'middle' };
                addedRow.getCell('trangThai').alignment = { vertical: 'middle' };
                addedRow.getCell('hoTen').alignment = { vertical: 'middle' };
                addedRow.getCell('ghiChu').alignment = { vertical: 'middle' };
                
                addedRow.eachCell((cell) => {
                    cell.font = { name: 'Arial', size: 10 };
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };
                });
            });
        }

        // 5. Cấu hình gửi luồng file về trình duyệt
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=DiemDanh_TrieuTap_HD_${targetMaHoatDong}.xlsx`
        );

        await workbook.xlsx.write(res);
        return res.end();
    } catch (error) {
        console.error("Lỗi quy trình xuất Excel:", error);
        return res.status(500).json({
            success: false,
            message: 'Hệ thống không thể kết xuất tệp tin Excel.',
            error: error.message
        });
    }
});

module.exports = router;
