const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

/**
 * @route   GET /api/kpi/subjects
 * @desc    Lấy toàn bộ danh sách môn học / mô-đun trong hệ thống
 * @access  Public (Trong giai đoạn test thông luồng)
 */
router.get('/subjects', kpiController.getSubjects);

/**
 * @route   POST /api/kpi/subjects
 * @desc    Thêm mới một môn học / mô-đun vào cơ sở dữ liệu
 * @access  Public (Trong giai đoạn test thông luồng)
 */
router.post('/subjects', kpiController.createSubject);

// Xuất router để file server.js chính có thể nạp vào hệ thống định tuyến
module.exports = router;