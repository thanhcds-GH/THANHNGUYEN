const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB, sql, dbConfig } = require('./config/db');

const app = express();

// 1. Cấu hình các Middleware hệ thống
app.use(cors());
app.use(express.json());
// Bổ sung urlencoded để hỗ trợ phân giải dữ liệu biểu mẫu
app.use(express.urlencoded({ extended: true }));

// Cấu hình mở quyền truy cập tĩnh cho thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Khai báo các tuyến API của các phân hệ chức năng
app.use('/api/kpi', require('./routes/kpiRoutes'));
app.use('/api/lecturers', require('./routes/giangVienRoutes')); 
app.use('/api/lich-day', require('./controllers/lichDayController'));

// --- PHÂN HỆ PHÂN CÔNG GIẢNG DẠY ---
app.use('/api/phan-cong', require('./routes/phanCongRoutes'));

// --- PHÂN HỆ QUẢN LÝ CÔNG VĂN ---
// Khớp với route '/documents' trong congVanRouter -> URL: /api/documents
app.use('/api', require('./routes/congVanRouter'));

// --- PHÂN HỆ TRIỆU TẬP HOẠT ĐỘNG ---
app.use('/api', require('./routes/hoatDongTrieuTapRoutes'));

// --- PHÂN HỆ ĐỀ TÀI NGHIÊN CỨU KHOA HỌC (NCKH) ---
const nckhRouter = require('./routes/nckhRouter');
app.use('/api/nckh', nckhRouter);

// --- PHÂN HỆ PHÂN CÔNG GIẢNG DẠY (Bổ sung dự phòng đường dẫn) ---
const phanCongRoutes = require('./routes/phanCongRoutes');
app.use('/api/phan-cong', phanCongRoutes);
app.use('/phan-cong', phanCongRoutes);
//--- PHÂN HỆ GIỜ GIẢNG ĐƯỢC PHÂN CÔNG CỦA TỪNG GIẢNG VIÊN THEO HỌC KỲ VÀ NĂM HỌC
// =========================================================================
// API BỔ SUNG: Lấy danh sách phân công giảng dạy và định mức riêng từng giảng viên
// =========================================================================
// --- PHÂN HỆ ĐỊNH MỨC GIỜ GIẢNG & PHÂN CÔNG GIANG DẠY ---
const gioGiangRoutes = require('./routes/gioGiangRoutes');
app.use('/api', gioGiangRoutes);
app.use('/', gioGiangRoutes);

// 3. Khởi chạy kết nối CSDL và lắng nghe máy chủ Node.js
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Kết nối vào SQL Server trước
        await connectDB();

        // Sau khi kết nối thành công, bắt đầu mở cổng lắng nghe
        app.listen(PORT, () => {
            console.log(`=== SERVER ĐANG CHẠY MƯỢT MÀ TẠI CỔNG: ${PORT} ===`);
        });
    } catch (err) {
        console.error('❌ Lỗi khởi động máy chủ:', err);
    }
};

startServer();