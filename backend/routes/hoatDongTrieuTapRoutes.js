// backend/routes/hoatDongTrieuTapRoutes.js
const express = require('express');
const router = express.Router();

// Import chính xác controller xử lý nghiệp vụ hoạt động triệu tập
const hoatDongTrieuTapController = require('../controllers/hoatDongTrieuTapController');

/**
 * Trường hợp 1: Nếu Frontend gọi trực tiếp không có tiền tố trieu-tap
 * Khớp với: /api/luu-va-dong-bo và /api/diem-danh/:maHoatDong
 */
router.use('/', hoatDongTrieuTapController);

/**
 * Trường hợp 2: BỌC LÓT AN TOÀN (Fallback Route)
 * Nếu Frontend gọi có tiền tố /api/trieu-tap/diem-danh/:maHoatDong
 * Hệ thống sẽ tự động bóc tách và chuyển tiếp chính xác vào controller xử lý.
 */
router.use('/trieu-tap', hoatDongTrieuTapController);

module.exports = router;