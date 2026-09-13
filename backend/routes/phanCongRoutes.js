const express = require('express');
const router = express.Router();
const phanCongController = require('../controllers/phanCongController');

// 1. Lấy danh sách giảng viên đủ điều kiện theo tổ (có kèm GV Tiếng Anh, lọc TRANGTHAI = True)
router.get('/giang-vien', phanCongController.getGiangVienTheoBoMon);

// 2. Lấy danh sách các môn đã phân công của một lớp theo học kỳ / năm học
router.get('/theo-lop', phanCongController.getPhanCongTheoLop);

// 3. Lấy toàn bộ kế hoạch phân công toàn khoa (cho Trưởng khoa xem / xuất Excel)
router.get('/toan-khoa', phanCongController.getPhanCongToanKhoa);

// 4. Lưu / cập nhật phân công giảng dạy (Ghi vào CSDL)
router.post('/luu', phanCongController.luuPhanCong);

// 5. Xóa một môn đã phân công theo ID
router.delete('/xoa/:id', phanCongController.xoaPhanCong);

module.exports = router;