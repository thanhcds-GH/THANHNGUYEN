const sql = require('mssql');

// =========================================================================
// @route   GET /api/kpi/lecturers HOẶC /api/giang-vien
// @desc    Lấy toàn bộ danh sách giảng viên kèm thông tin định mức từ bảng DINHMUC_CV
// =========================================================================
exports.getLecturers = async (req, res) => {
    try {
        const queryStr = `
            SELECT 
                gv.MA_GIANGVIEN,
                gv.MADN,
                gv.HOTEN,
                gv.Email,
                gv.BO_MON,
                gv.Role,
                gv.TRANGTHAI,
                gv.MA_CHUCDANH,
                dm.TEN_DM,
                dm.DM_GIO_GV,
                dm.DM_GIO_NCKH
            FROM dbo.GIANG_VIEN gv
            LEFT JOIN dbo.DINHMUC_CV dm ON gv.MA_CHUCDANH = dm.MA_CHUCDANH
            ORDER BY gv.MA_GIANGVIEN ASC
        `;
        
        const result = await new sql.Request().query(queryStr);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy danh sách giảng viên:", err);
        res.status(500).json({ message: "Không thể kết nối cơ sở dữ liệu để lấy danh sách giảng viên!" });
    }
};

// =========================================================================
// @route   POST /api/kpi/lecturers HOẶC /api/giang-vien
// @desc    Thêm một giảng viên mới vào bảng GIANG_VIEN
// =========================================================================
exports.createLecturer = async (req, res) => {
    const { MADN, HOTEN, Email, MA_CHUCDANH, BO_MON, Role } = req.body;

    if (!MADN || !HOTEN) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ Mã đăng nhập (MADN) và Họ tên!" });
    }

    try {
        const checkExist = await sql.query`SELECT MADN FROM dbo.GIANG_VIEN WHERE MADN = ${MADN}`;
        if (checkExist.recordset.length > 0) {
            return res.status(400).json({ message: `Mã đăng nhập (MADN) '${MADN}' đã tồn tại trên hệ thống!` });
        }

        const request = new sql.Request();
        request.input('MADN', sql.VarChar(20), MADN);
        request.input('HOTEN', sql.NVarChar(100), HOTEN);
        request.input('Email', sql.VarChar(100), Email || null);
        request.input('MA_CHUCDANH', sql.Int, MA_CHUCDANH || null);
        request.input('BO_MON', sql.NVarChar(150), BO_MON || 'Khoa Điện tử - Tin học');
        request.input('Role', sql.VarChar(20), Role || 'Teacher');

        const insertQuery = `
            INSERT INTO dbo.GIANG_VIEN (MADN, HOTEN, Email, MA_CHUCDANH, Role, TRANGTHAI, BO_MON)
            VALUES (@MADN, @HOTEN, @Email, @MA_CHUCDANH, @Role, 1, @BO_MON)
        `;

        await request.query(insertQuery);
        res.status(201).json({ message: "Thêm thông tin giảng viên thành công!" });
    } catch (err) {
        console.error("Lỗi thêm giảng viên mới:", err);
        res.status(500).json({ message: "Có lỗi xảy ra trong quá trình ghi dữ liệu vào SQL Server!" });
    }
};

// =========================================================================
// @route   GET /api/kpi/lecturers/quotas
// @desc    Lấy danh mục định mức chức danh
// =========================================================================
exports.getJobQuotas = async (req, res) => {
    try {
        const result = await sql.query`SELECT MA_CHUCDANH, TEN_DM FROM dbo.DINHMUC_CV ORDER BY MA_CHUCDANH ASC`;
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy danh mục định mức chức danh:", err);
        res.status(500).json({ message: "Không thể lấy danh mục định mức chức danh!" });
    }
};