const express = require('express');
const router = express.Router();
const giangVienController = require('../controllers/giangVienController');

// Tuyến đường xử lý danh sách và thêm mới giảng viên
router.get('/', giangVienController.getLecturers);
router.post('/', giangVienController.createLecturer);

// Tuyến đường bổ trợ lấy danh sách chức danh phục vụ biểu mẫu (Dropdown Form)
router.get('/quotas', giangVienController.getJobQuotas);

module.exports = router;