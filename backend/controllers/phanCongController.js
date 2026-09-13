const sql = require('mssql');

// 1. LẤY DANH SÁCH GIẢNG VIÊN ĐỦ ĐIỀU KIỆN THEO BỘ MÔN (BAO GỒM NGOẠI LỆ TIẾNG ANH)
exports.getGiangVienTheoBoMon = async (req, res) => {
    try {
        const { boMon } = req.query;
        const pool = await sql.connect();
        const request = new sql.Request(pool);

        let query = `
            SELECT 
                MA_GIANGVIEN,
                MADN,
                HOTEN,
                BO_MON,
                Email
            FROM dbo.GIANG_VIEN
            WHERE (TRANGTHAI = 1 OR TRANGTHAI = 'True')
        `;

        if (boMon && boMon !== 'Tất cả') {
            request.input('BoMon', sql.NVarChar(100), `%${boMon.trim()}%`);
            query += ` AND (BO_MON LIKE @BoMon OR BO_MON LIKE N'%Tiếng Anh%')`;
        } else {
            query += ` AND BO_MON NOT IN (N'Thư ký', N'Giáo vụ')`;
        }

        query += ` ORDER BY BO_MON DESC, MA_GIANGVIEN ASC`;

        const result = await request.query(query);
        return res.status(200).json({ success: true, total: result.recordset.length, data: result.recordset });
    } catch (error) {
        console.error('Lỗi lấy danh sách giảng viên:', error);
        return res.status(500).json({ success: false, message: 'Không thể lấy danh sách giảng viên từ cơ sở dữ liệu.', error: error.message });
    }
};

// 2. LẤY DANH SÁCH MÔN ĐÃ PHÂN CÔNG THEO LỚP (DÙNG TENLOP VÀ TIỀN TỐ N CHUẨN UNICODE)
exports.getPhanCongTheoLop = async (req, res) => {
    try {
        const { maLop, hocKy, namHoc } = req.query;
        if (!maLop) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên lớp cần tra cứu!' });
        }

        const pool = await sql.connect();
        const request = new sql.Request(pool);

        const cleanLop = String(maLop).replace(/\s*\(Sĩ số:.*\)/i, '').trim();

        let hocKyNum = 1;
        const hkStr = String(hocKy).toLowerCase();
        if (hkStr.includes('2') || hkStr.includes('hai')) hocKyNum = 2;

        const cleanNH = String(namHoc || '2026-2027').replace('Năm học ', '').trim();

        request.input('TenLop', sql.NVarChar(100), `%${cleanLop}%`);
        request.input('HocKy', sql.Int, hocKyNum);
        request.input('NamHoc', sql.NVarChar(50), cleanNH);

        const query = `
            SELECT
                pc.ID_PHAN_CONG AS ID,
                LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(50)))) AS MA_MH_MD,
                ISNULL(dm.TEN_MH_MD, LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(100))))) AS TEN_MH_MD,
                ISNULL(dm.SO_TIN_CHI, 3) AS STC,
                pc.GIO_DAY_THEO_PHAN_CONG AS SO_GIO,
                ISNULL(dm.SO_GIO_LT, 0) AS LT,
                ISNULL(dm.SO_GIO_TH, 0) AS TH,
                gv.MA_GIANGVIEN AS MA_GIANGVIEN,
                gv.MADN AS MA_GIANGVIEN_DN,
                gv.HOTEN AS TEN_GIANGVIEN,
                gv.BO_MON,
                LTRIM(RTRIM(pc.TENLOP)) AS TEN_LOP,
                pc.HOCKY AS HOC_KY,
                LTRIM(RTRIM(pc.NAMHOC)) AS NAM_HOC,
                pc.SISO_HSSV AS SI_SO,
                pc.TRANG_THAI,
                pc.NGUOI_PHAN_CONG,
                pc.NGAY_PHAN_CONG
            FROM dbo.PHAN_CONG_GIANG_DAY pc
            LEFT JOIN dbo.GIANG_VIEN gv ON pc.MA_GIANGVIEN = gv.MA_GIANGVIEN
            OUTER APPLY (
                SELECT TOP 1 TEN_MH_MD, SO_TIN_CHI, SO_GIO_LT, SO_GIO_TH
                FROM dbo.DANH_MUC_MH_MODUN
                WHERE LTRIM(RTRIM(MA_MH_MD)) = LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(50))))
            ) dm
            WHERE REPLACE(CAST(pc.TENLOP AS NVARCHAR(100)), N' ', N'') LIKE REPLACE(@TenLop, N' ', N'')
              AND pc.HOCKY = @HocKy
              AND pc.NAMHOC LIKE @NamHoc
            ORDER BY pc.ID_PHAN_CONG ASC
        `;

        const result = await request.query(query);
        return res.status(200).json({ success: true, total: result.recordset.length, data: result.recordset });
    } catch (error) {
        console.error('Lỗi khi truy xuất danh sách phân công theo lớp:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách phân công.', error: error.message });
    }
};

// 3. LƯU HOẶC CẬP NHẬT PHÂN CÔNG GIẢNG DẠY
exports.luuPhanCong = async (req, res) => {
    try {
        const {
            MA_GIANGVIEN,
            MA_MH_MD,
            TENLOP,
            MALOP,
            HOCKY,
            NAMHOC,
            GIO_DAY_THEO_PHAN_CONG,
            SISO_HSSV,
            NGUOI_PHAN_CONG
        } = req.body;

        const tenLopInput = TENLOP || MALOP;

        if (!MA_GIANGVIEN || !MA_MH_MD || !tenLopInput) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin phân công không đầy đủ (thiếu Giảng viên, Môn học hoặc Lớp)!'
            });
        }

        const pool = await sql.connect();

        const checkGvReq = new sql.Request(pool);
        checkGvReq.input('MaDN', sql.NVarChar(50), String(MA_GIANGVIEN).trim());
        const gvRes = await checkGvReq.query(`
            SELECT TOP 1 MA_GIANGVIEN, HOTEN, TRANGTHAI 
            FROM dbo.GIANG_VIEN 
            WHERE (MADN = @MaDN OR CAST(MA_GIANGVIEN AS VARCHAR) = @MaDN)
              AND (TRANGTHAI = 1 OR TRANGTHAI = 'True')
        `);

        if (!gvRes.recordset || gvRes.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy thông tin giảng viên hợp lệ hoặc giảng viên [${MA_GIANGVIEN}] đã ngừng công tác!`
            });
        }

        const gvInfo = gvRes.recordset[0];
        const realMaGVInt = gvInfo.MA_GIANGVIEN;

        const hocKyInt = (String(HOCKY).toLowerCase().includes('2') || String(HOCKY) === '2') ? 2 : 1;
        const namHocStr = String(NAMHOC || '2026-2027').replace('Năm học ', '').trim();
        const maLopStr = String(tenLopInput).trim();
        const maMhStr = String(MA_MH_MD).trim();
        const soGioInt = parseInt(GIO_DAY_THEO_PHAN_CONG, 10) || 0;
        const siSoInt = parseInt(SISO_HSSV, 10) || 0;
        const nguoiPcStr = String(NGUOI_PHAN_CONG || 'Tổ trưởng').trim();

        const checkMhReq = new sql.Request(pool);
        checkMhReq.input('MaMH', sql.NVarChar(50), maMhStr);
        const mhRes = await checkMhReq.query(`
            SELECT TOP 1 TEN_MH_MD 
            FROM dbo.DANH_MUC_MH_MODUN 
            WHERE LTRIM(RTRIM(MA_MH_MD)) = @MaMH
        `);
        const tenMhChuan = mhRes.recordset?.[0]?.TEN_MH_MD || maMhStr;

        const checkExistReq = new sql.Request(pool);
        checkExistReq.input('MaMH', sql.NVarChar(50), maMhStr);
        checkExistReq.input('MaLop', sql.NVarChar(50), maLopStr);
        checkExistReq.input('HocKy', sql.Int, hocKyInt);
        checkExistReq.input('NamHoc', sql.NVarChar(20), namHocStr);

        const existRes = await checkExistReq.query(`
            SELECT TOP 1 ID_PHAN_CONG FROM dbo.PHAN_CONG_GIANG_DAY 
            WHERE LTRIM(RTRIM(CAST(MA_MH_MD AS NVARCHAR(50)))) = @MaMH 
              AND LTRIM(RTRIM(TENLOP)) = @MaLop 
              AND HOCKY = @HocKy 
              AND REPLACE(LTRIM(RTRIM(NAMHOC)), N' ', N'') = REPLACE(@NamHoc, N' ', N'')
        `);

        if (existRes.recordset && existRes.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Môn học này đã được phân công cho lớp ${maLopStr}!`
            });
        }

        const saveReq = new sql.Request(pool);
        saveReq.input('MaGV', sql.Int, realMaGVInt);
        saveReq.input('MaMH', sql.NVarChar(50), maMhStr);
        saveReq.input('MaLop', sql.NVarChar(50), maLopStr);
        saveReq.input('HocKy', sql.Int, hocKyInt);
        saveReq.input('NamHoc', sql.NVarChar(20), namHocStr);
        saveReq.input('GioDay', sql.Int, soGioInt);
        saveReq.input('SiSo', sql.Int, siSoInt);
        saveReq.input('NguoiPC', sql.NVarChar(100), nguoiPcStr);

        await saveReq.query(`
            INSERT INTO dbo.PHAN_CONG_GIANG_DAY 
                (MA_GIANGVIEN, MA_MH_MD, TENLOP, HOCKY, NAMHOC, GIO_DAY_THEO_PHAN_CONG, SISO_HSSV, TIENG_NN, NHATKY_DULIEU, NGUOI_PHAN_CONG, TRANG_THAI, NGAY_PHAN_CONG)
            VALUES 
                (@MaGV, @MaMH, @MaLop, @HocKy, @NamHoc, @GioDay, @SiSo, 0, GETDATE(), @NguoiPC, N'Đã phân công', GETDATE())
        `);

        return res.status(200).json({
            success: true,
            message: `Đã lưu phân công môn [${tenMhChuan}] cho giảng viên [${gvInfo.HOTEN}] vào cơ sở dữ liệu!`
        });
    } catch (error) {
        console.error('Lỗi khi ghi nhận phân công:', error);
        return res.status(500).json({
            success: false,
            message: `Lỗi CSDL: ${error.message || 'Không thể ghi nhận dữ liệu phân công.'}`,
            error: error.message
        });
    }
};

// 4. XÓA MỘT MÔN ĐÃ PHÂN CÔNG THEO ID
exports.xoaPhanCong = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã ID phân công cần xóa!' });
        }

        const pool = await sql.connect();
        const request = new sql.Request(pool);
        request.input('IdPC', sql.Int, parseInt(id, 10));

        await request.query(`DELETE FROM dbo.PHAN_CONG_GIANG_DAY WHERE ID_PHAN_CONG = @IdPC`);

        return res.status(200).json({ success: true, message: 'Đã xóa phân công môn học thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa phân công:', error);
        return res.status(500).json({ success: false, message: 'Không thể xóa bản ghi phân công.', error: error.message });
    }
};

// 5. TRUY XUẤT TOÀN BỘ PHÂN CÔNG TOÀN KHOA
exports.getPhanCongToanKhoa = async (req, res) => {
    try {
        const { hocKy, namHoc } = req.query;
        const pool = await sql.connect();
        const request = new sql.Request(pool);

        let hocKyNum = 1;
        const hkStr = String(hocKy).toLowerCase();
        if (hkStr.includes('2') || hkStr.includes('hai')) {
            hocKyNum = 2;
        }

        const cleanNH = String(namHoc || '2026-2027').replace('Năm học ', '').trim();

        request.input('HocKy', sql.Int, hocKyNum);
        request.input('NamHoc', sql.NVarChar(20), cleanNH);

        const query = `
            SELECT 
                pc.ID_PHAN_CONG AS ID,
                LTRIM(RTRIM(pc.TENLOP)) AS TEN_LOP,
                LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(50)))) AS MA_MH_MD,
                ISNULL(dm.TEN_MH_MD, LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(100))))) AS TEN_MH_MD,
                ISNULL(dm.SO_TIN_CHI, 3) AS STC,
                pc.GIO_DAY_THEO_PHAN_CONG AS SO_GIO,
                ISNULL(dm.SO_GIO_LT, 0) AS LT,
                ISNULL(dm.SO_GIO_TH, 0) AS TH,
                pc.SISO_HSSV AS SI_SO,
                gv.MADN AS MA_GIANGVIEN_DN,
                gv.HOTEN AS TEN_GIANGVIEN,
                gv.BO_MON,
                pc.HOCKY AS HOC_KY,
                LTRIM(RTRIM(pc.NAMHOC)) AS NAM_HOC,
                pc.TRANG_THAI,
                pc.NGUOI_PHAN_CONG
            FROM dbo.PHAN_CONG_GIANG_DAY pc
            LEFT JOIN dbo.GIANG_VIEN gv 
                ON pc.MA_GIANGVIEN = gv.MA_GIANGVIEN
            OUTER APPLY (
                SELECT TOP 1 TEN_MH_MD, SO_TIN_CHI, SO_GIO_LT, SO_GIO_TH 
                FROM dbo.DANH_MUC_MH_MODUN 
                WHERE LTRIM(RTRIM(MA_MH_MD)) = LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(50))))
            ) dm
            WHERE pc.HOCKY = @HocKy
              AND REPLACE(LTRIM(RTRIM(pc.NAMHOC)), N' ', N'') = REPLACE(@NamHoc, N' ', N'')
            ORDER BY gv.BO_MON ASC, pc.TENLOP ASC
        `;

        const result = await request.query(query);

        return res.status(200).json({
            success: true,
            total: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi khi truy xuất phân công toàn khoa:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy kế hoạch phân công toàn khoa.',
            error: error.message
        });
    }
};