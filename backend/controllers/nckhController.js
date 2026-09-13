const sql = require('mssql');

// 1. LẤY TOÀN BỘ DANH SÁCH ĐỀ TÀI NCKH CHO THƯ KÝ / GIẢNG VIÊN
exports.getDanhSach = async (req, res) => {
    try {
        const { namHoc, trangThai, maGiangVien } = req.query;
        const pool = await sql.connect();
        const request = new sql.Request(pool);

        let query = `
            SELECT 
                nc.MAHDNC AS ID,
                gv.MADN AS MA_GIANGVIEN,
                gv.HOTEN AS TEN_GIANGVIEN,
                nc.TEN_DETAI AS TEN_DE_TAI,
                nc.SO_GIO_QUY_DOI,
                nc.MINH_CHUNG,
                nc.TRANG_THAI,
                nc.NAM_HOC,
                gvDuyet.MADN AS MA_NGUOI_DUYET,
                gvDuyet.HOTEN AS TEN_NGUOI_DUYET,
                nc.NGAY_DUYET
            FROM dbo.NCKH_MINHCHUNG nc
            LEFT JOIN dbo.GIANG_VIEN gv ON nc.MA_GIANGVIEN = gv.MA_GIANGVIEN
            LEFT JOIN dbo.GIANG_VIEN gvDuyet ON nc.NGUOI_DUYET = gvDuyet.MA_GIANGVIEN
            WHERE 1=1
        `;

        if (namHoc && namHoc !== 'Tất cả') {
            request.input('NamHoc', sql.VarChar(15), namHoc);
            query += ` AND nc.NAM_HOC = @NamHoc`;
        }

        if (trangThai && trangThai !== 'Tất cả') {
            request.input('TrangThai', sql.NVarChar(50), trangThai);
            query += ` AND nc.TRANG_THAI = @TrangThai`;
        }

        // Lọc theo mã đăng nhập (ví dụ: 'GV012', 'GV001')
        if (maGiangVien) {
            request.input('MaDN', sql.NVarChar(50), String(maGiangVien).trim());
            query += ` AND gv.MADN = @MaDN`;
        }

        query += ` ORDER BY nc.MAHDNC DESC`;

        const result = await request.query(query);

        const danhSach = (result.recordset || []).map(row => {
            let extra = {};
            try {
                extra = JSON.parse(row.MINH_CHUNG || '{}');
            } catch {
                extra = { TAC_GIA: row.MINH_CHUNG };
            }

            return {
                ID: row.ID,
                MA_GIANGVIEN: row.MA_GIANGVIEN || '---',
                TEN_GIANGVIEN: row.TEN_GIANGVIEN || 'Chưa rõ',
                TEN_DE_TAI: row.TEN_DE_TAI,
                SO_GIO_QUY_DOI: row.SO_GIO_QUY_DOI,
                TRANG_THAI: row.TRANG_THAI || 'Chờ phê duyệt',
                NAM_HOC: row.NAM_HOC,
                TAC_GIA: extra.TAC_GIA || row.TEN_GIANGVIEN || '---',
                LOAI_DE_TAI: extra.LOAI_DE_TAI || 'Nghiên cứu khoa học',
                CAP_DE_TAI: extra.CAP_DE_TAI || 'Cấp Trường',
                VAI_TRO: extra.VAI_TRO || 'Chủ nhiệm đề tài',
                NGUOI_DUYET: row.TEN_NGUOI_DUYET || '',
                NGAY_DUYET: row.NGAY_DUYET
            };
        });

        return res.status(200).json({
            success: true,
            total: danhSach.length,
            data: danhSach
        });
    } catch (error) {
        console.error("Lỗi truy vấn danh sách NCKH:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi truy vấn danh sách đề tài NCKH.',
            error: error.message
        });
    }
};

// 2. GIẢNG VIÊN LƯU ĐỀ TÀI MỚI (TỰ ĐỘNG TÌM ĐÚNG MA_GIANGVIEN THEO MADN)
exports.luuDeTai = async (req, res) => {
    try {
        const {
            MA_GIANGVIEN, // Nhận vào MADN (ví dụ: 'GV012')
            TEN_DE_TAI,
            SO_GIO_QUY_DOI,
            NAM_HOC,
            TAC_GIA,
            LOAI_DE_TAI,
            CAP_DE_TAI,
            VAI_TRO
        } = req.body;

        if (!TEN_DE_TAI || !TEN_DE_TAI.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Tên đề tài / sáng kiến kinh nghiệm không được để trống!'
            });
        }

        const pool = await sql.connect();

        // Bước A: Tìm chính xác khóa chính MA_GIANGVIEN dựa vào MADN truyền lên
        const checkUserReq = new sql.Request(pool);
        checkUserReq.input('MaDN', sql.NVarChar(50), String(MA_GIANGVIEN).trim());
        const userRes = await checkUserReq.query(`
            SELECT TOP 1 MA_GIANGVIEN, HOTEN 
            FROM dbo.GIANG_VIEN 
            WHERE MADN = @MaDN OR CAST(MA_GIANGVIEN AS VARCHAR) = @MaDN
        `);

        if (!userRes.recordset || userRes.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy giảng viên có mã [${MA_GIANGVIEN}] trong CSDL!`
            });
        }

        const realMaGVInt = userRes.recordset[0].MA_GIANGVIEN; // Lấy đúng khóa chính INT (ví dụ: 18 cho GV012)
        const soGio = parseFloat(SO_GIO_QUY_DOI) || 84;
        const namHocStr = (NAM_HOC || '2026-2027').trim();

        const minhChungJson = JSON.stringify({
            TAC_GIA: (TAC_GIA || '').trim(),
            LOAI_DE_TAI: LOAI_DE_TAI || 'Nghiên cứu khoa học',
            CAP_DE_TAI: CAP_DE_TAI || 'Cấp Trường',
            VAI_TRO: VAI_TRO || 'Chủ nhiệm đề tài'
        });

        // Bước B: Lưu vào CSDL với đúng MA_GIANGVIEN
        const insertReq = new sql.Request(pool);
        insertReq.input('MaGV', sql.Int, realMaGVInt);
        insertReq.input('TenDeTai', sql.NVarChar(255), TEN_DE_TAI.trim());
        insertReq.input('SoGioQuyDoi', sql.Float, soGio);
        insertReq.input('MinhChung', sql.NVarChar(500), minhChungJson);
        insertReq.input('TrangThai', sql.NVarChar(50), 'Chờ phê duyệt');
        insertReq.input('NamHoc', sql.VarChar(15), namHocStr);

        const insertQuery = `
            INSERT INTO dbo.NCKH_MINHCHUNG 
                (MA_GIANGVIEN, TEN_DETAI, SO_GIO_QUY_DOI, MINH_CHUNG, TRANG_THAI, NAM_HOC)
            VALUES 
                (@MaGV, @TenDeTai, @SoGioQuyDoi, @MinhChung, @TrangThai, @NamHoc);
            
            SELECT SCOPE_IDENTITY() AS NewID;
        `;

        const result = await insertReq.query(insertQuery);
        const newId = result.recordset && result.recordset[0]?.NewID;

        return res.status(200).json({
            success: true,
            message: `Lưu đề tài [${TEN_DE_TAI.trim()}] thành công!`,
            newId: newId
        });
    } catch (error) {
        console.error("Lỗi khi lưu đề tài NCKH:", error);
        return res.status(500).json({
            success: false,
            message: 'Hệ thống từ chối lưu dữ liệu vào bảng NCKH_MINHCHUNG.',
            error: error.message
        });
    }
};

// 3. THẨM ĐỊNH TRẠNG THÁI (TỰ ĐỘNG TÌM ĐÚNG MA_GIANGVIEN CHO NGUOI_DUYET)
exports.capNhatTrangThai = async (req, res) => {
    try {
        const { id } = req.params;
        const { TRANG_THAI, NGUOI_DUYET } = req.body;

        if (!id || !TRANG_THAI) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã đề tài hoặc trạng thái cần cập nhật!'
            });
        }

        const pool = await sql.connect();

        // Tìm MA_GIANGVIEN của người duyệt dựa vào MADN (mặc định GV025 -> MA_GIANGVIEN = 37)
        const checkDuyetReq = new sql.Request(pool);
        checkDuyetReq.input('MaDN', sql.NVarChar(50), String(NGUOI_DUYET || 'GV025').trim());
        const duyetRes = await checkDuyetReq.query(`
            SELECT TOP 1 MA_GIANGVIEN 
            FROM dbo.GIANG_VIEN 
            WHERE MADN = @MaDN OR CAST(MA_GIANGVIEN AS VARCHAR) = @MaDN
        `);

        const realNguoiDuyetInt = duyetRes.recordset && duyetRes.recordset.length > 0 
            ? duyetRes.recordset[0].MA_GIANGVIEN 
            : 37;

        const updateReq = new sql.Request(pool);
        updateReq.input('Id', sql.Int, parseInt(id, 10));
        updateReq.input('TrangThai', sql.NVarChar(50), TRANG_THAI.trim());
        updateReq.input('NguoiDuyet', sql.Int, realNguoiDuyetInt);

        await updateReq.query(`
            UPDATE dbo.NCKH_MINHCHUNG
            SET 
                TRANG_THAI = @TrangThai,
                NGUOI_DUYET = @NguoiDuyet,
                NGAY_DUYET = GETDATE()
            WHERE MAHDNC = @Id
        `);

        return res.status(200).json({
            success: true,
            message: `Cập nhật trạng thái thẩm định thành [${TRANG_THAI}] thành công!`
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái thẩm định NCKH:", error);
        return res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái trong cơ sở dữ liệu.',
            error: error.message
        });
    }
};