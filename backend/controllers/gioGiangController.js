const { sql, dbConfig } = require('../config/db');

// Lấy danh sách phân công giảng dạy và định mức riêng từng giảng viên theo mã định danh (madn), năm học và học kỳ
const getPhanCongTheoGiangVien = async (req, res) => {
    try {
        const { madn } = req.params;
        const { namHoc, hocKy } = req.query;

        // Kết nối SQL Server và truy vấn dữ liệu
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('madn', sql.VarChar, madn)
            .input('namHoc', sql.VarChar, namHoc || '2026-2027')
            .input('hocKy', sql.VarChar, hocKy || '1')
            .query(`
                SELECT DISTINCT
                    pc.ID_PHAN_CONG,
                    pc.MA_MH_MD AS MA_MH_PC,
                    ISNULL(mh.TEN_MH_MD, pc.MA_MH_MD) AS TEN_MH,
                    pc.TENLOP AS LOP,
                    ISNULL(pc.SISO_HSSV, 30) AS SI_SO,
                    ISNULL(mh.SO_TIN_CHI, 3) AS STC,
                    pc.GIO_DAY_THEO_PHAN_CONG AS SO_GIO,
                    N'P.303-P.306' AS PHONG
                FROM PHAN_CONG_GIANG_DAY pc
                JOIN GIANG_VIEN gv ON pc.MA_GIANGVIEN = gv.MA_GIANGVIEN
                LEFT JOIN DANH_MUC_MH_MODUN mh ON pc.MA_MH_MD = mh.MA_MH_MD
                WHERE gv.MADN = @madn
                  AND pc.NAMHOC = @namHoc
                  AND pc.HOCKY = @hocKy
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy phân công giảng dạy:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu phân công' });
    }
};

module.exports = {
    getPhanCongTheoGiangVien
};