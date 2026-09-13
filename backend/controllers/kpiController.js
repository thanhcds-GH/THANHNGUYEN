const { sql } = require('../config/db');

/**
 * @desc    Lấy toàn bộ danh sách môn học / mô-đun
 * @route   GET /api/kpi/subjects
 */
const getSubjects = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT MA_DM_MHMD, MA_MH_MD, TEN_MH_MD, LOAIGA, TIENG_NN 
            FROM DANH_MUC_MH_MODUN 
            ORDER BY MA_DM_MHMD DESC
        `;
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            message: "Lỗi cấu trúc khi truy vấn danh mục môn học", 
            error: error.message 
        });
    }
};

/**
 * @desc    Thêm mới một môn học / mô-đun
 * @route   POST /api/kpi/subjects
 */
const createSubject = async (req, res) => {
    try {
        // Bóc tách dữ liệu từ phần thân yêu cầu (req.body) gửi từ Axios Frontend
        const { MA_MH_MD, TEN_MH_MD, LOAIGA, TIENG_NN } = req.body;

        // Ràng buộc kiểm tra dữ liệu bắt buộc nhằm đảm bảo toàn vẹn thực thể
        if (!MA_MH_MD || !TEN_MH_MD) {
            return res.status(400).json({ 
                message: "Mã môn học và tên môn học không được để trống!" 
            });
        }

        // Chuẩn hóa dữ liệu - Đồng bộ TIENG_NN sang dạng chuỗi text theo chuẩn NVARCHAR(50)
        const values = {
            ma_mhmd: MA_MH_MD.trim(),
            ten_mhmd: TEN_MH_MD.trim(),
            loaiga: LOAIGA || 'Lý thuyết',
            tieng_nn: TIENG_NN || 'Tiếng Việt' // Thay đổi từ số 0 thành chuỗi chữ mặc định
        };

        // Thực thi câu lệnh sử dụng cơ chế input parameter an toàn, chỉ định rõ kích thước dữ liệu
        const pool = await sql.connect();
        await pool.request()
            .input('MA_MH_MD', sql.VarChar(20), values.ma_mhmd)
            .input('TEN_MH_MD', sql.NVarChar(150), values.ten_mhmd) // Khai báo NVarChar giúp nhận diện ký tự tiếng Việt Unicode
            .input('LOAIGA', sql.NVarChar(50), values.loaiga)
            .input('TIENG_NN', sql.NVarChar(50), values.tieng_nn)   // Khai báo kích thước chuẩn cho cột mới điều chỉnh
            .query(`
                INSERT INTO DANH_MUC_MH_MODUN (MA_MH_MD, TEN_MH_MD, LOAIGA, TIENG_NN)
                VALUES (@MA_MH_MD, @TEN_MH_MD, @LOAIGA, @TIENG_NN)
            `);

        res.status(201).json({ 
            message: "Thêm mới môn học/mô-đun vào hệ thống thành công!" 
        });
    } catch (error) {
        console.error("Lỗi thực thi tại Controller:", error);
        res.status(500).json({ 
            message: "Lỗi khi thêm mới dữ liệu môn học vào SQL Server", 
            error: error.message 
        });
    }
};

module.exports = {
    getSubjects,
    createSubject
};