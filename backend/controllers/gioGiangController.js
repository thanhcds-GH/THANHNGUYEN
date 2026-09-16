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
                    SELECT 
    pc.ID_PHAN_CONG AS ID_PHAN_CONG,
    pc.MA_MH_MD AS MA_MH_PC,
    ISNULL(LTRIM(RTRIM(CAST(dm.TEN_MH_MD AS NVARCHAR(200)))), LTRIM(RTRIM(CAST(pc.MA_MH_MD AS NVARCHAR(200))))) AS TEN_MH,
    ISNULL(dm.SO_TIN_CHI, 3) AS STC,
    pc.GIO_DAY_THEO_PHAN_CONG AS SO_GIO,
    LTRIM(RTRIM(pc.TENLOP)) AS LOP,
    ISNULL(pc.SISO_HSSV, 30) AS SI_SO,
    N'P.303-P.306' AS PHONG
FROM dbo.PHAN_CONG_GIANG_DAY pc
LEFT JOIN dbo.GIANG_VIEN gv ON pc.MA_GIANGVIEN = gv.MA_GIANGVIEN
OUTER APPLY (
    SELECT TOP 1 TEN_MH_MD, SO_TIN_CHI 
    FROM dbo.DANH_MUC_MH_MODUN m 
    WHERE REPLACE(REPLACE(CAST(m.MA_MH_MD AS NVARCHAR(50)), N'Đ', N'D'), N'đ', N'd') COLLATE Latin1_General_CI_AI 
        = REPLACE(REPLACE(CAST(pc.MA_MH_MD AS NVARCHAR(50)), N'Đ', N'D'), N'đ', N'd') COLLATE Latin1_General_CI_AI
) dm
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