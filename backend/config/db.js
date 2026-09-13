const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: false, // Để false khi kết nối Localhost hoặc mạng nội bộ
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise = null;

const connectDB = async () => {
    try {
        if (!poolPromise) {
            poolPromise = await sql.connect(config);
            console.log('=== KẾT NỐI SQL SERVER THÀNH CÔNG ===');
        }
        return poolPromise;
    } catch (err) {
        console.error('❌ Lỗi kết nối SQL Server:', err.message);
        throw err;
    }
};

// Hàm tiện ích lấy pool kết nối nhanh cho các controller
const getPool = () => {
    if (!poolPromise) {
        throw new Error('Cơ sở dữ liệu chưa được khởi tạo kết nối!');
    }
    return poolPromise;
};

module.exports = { connectDB, getPool, sql };