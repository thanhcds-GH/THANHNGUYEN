const sql = require('mssql');

const khoiTaoLichTrieuTap = async (req, res) => {
    const { 
        MA_CONGVAN, 
        TEN_HOAT_DONG, 
        NGAY_TO_CHUC, 
        BUOI_TRIEU_TAP, 
        NAM_HOC 
    } = req.body;

    // Kiểm tra tính đầy đủ của dữ liệu đầu vào theo Schema
    if (!MA_CONGVAN || !TEN_HOAT_DONG || !NGAY_TO_CHUC || !BUOI_TRIEU_TAP || !NAM_HOC) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các thông tin bắt buộc (*)' });
    }

    try {
        const pool = await sql.connect();
        
        // Khởi tạo Transaction để bảo vệ toàn vẹn dữ liệu đa bảng
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Chèn dữ liệu vào bảng dbo.HOAT_DONG_TRIEU_TAP và lấy MA_HOAT_DONG vừa sinh
            const requestAct = new sql.Request(transaction);
            requestAct.input('MA_CONGVAN', sql.Int, MA_CONGVAN);
            requestAct.input('TEN_HOAT_DONG', sql.NVarChar(255), TEN_HOAT_DONG);
            requestAct.input('NGAY_TO_CHUC', sql.Date, NGAY_TO_CHUC);
            requestAct.input('BUOI_TRIEU_TAP', sql.NVarChar(20), BUOI_TRIEU_TAP);
            requestAct.input('NAM_HOC', sql.VarChar(15), NAM_HOC);

            const queryAct = `
                INSERT INTO dbo.HOAT_DONG_TRIEU_TAP (MA_CONGVAN, TEN_HOAT_DONG, NGAY_TO_CHUC, BUOI_TRIEU_TAP, NAM_HOC)
                OUTPUT INSERTED.MA_HOAT_DONG
                VALUES (@MA_CONGVAN, @TEN_HOAT_DONG, @NGAY_TO_CHUC, @BUOI_TRIEU_TAP, @NAM_HOC);
            `;
            const resultAct = await requestAct.query(queryAct);
            const maHoatDongVuaTao = resultAct.recordset[0].MA_HOAT_DONG;

            // 2. Cập nhật trạng thái công văn mục tiêu sang 'Đã triệu tập'
            const requestDoc = new sql.Request(transaction);
            requestDoc.input('maCV', sql.Int, MA_CONGVAN);
            await requestDoc.query(`
                UPDATE dbo.CONG_VAN 
                SET TRANG_THAI_CV = N'Đã triệu tập'
                WHERE MA_CONGVAN = @maCV
            `);

            // 3. Tự động chuyển toàn bộ danh sách giảng viên khoa vào bảng điểm danh
            const requestAtt = new sql.Request(transaction);
            requestAtt.input('maHD', sql.Int, maHoatDongVuaTao);
            
            const queryAtt = `
                INSERT INTO dbo.DIEM_DANH_TRIEU_TAP (MA_HOAT_DONG, MA_GIANGVIEN)
                SELECT @maHD, MA_GIANGVIEN
                FROM dbo.GIANG_VIEN;
            `;
            await requestAtt.query(queryAtt);

            // Xác nhận hoàn tất chuỗi tiến trình thành công
            await transaction.commit();
            res.status(201).json({ message: 'Khởi tạo hoạt động triệu tập thành công!' });

        } catch (innerErr) {
            await transaction.rollback(); // Hoàn tác dữ liệu nếu xảy ra bất kỳ lỗi nhỏ nào
            throw innerErr;
        }

    } catch (err) {
        console.error('Lỗi nghiệp vụ triệu tập:', err);
        res.status(500).json({ message: 'Lỗi đồng bộ dữ liệu lên máy chủ SQL Server!' });
    }
};

module.exports = {
    khoiTaoLichTrieuTap
};