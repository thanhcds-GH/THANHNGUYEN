const express = require('express');
const router = express.Router();
const { getPhanCongTheoGiangVien } = require('../controllers/gioGiangController');

// Định nghĩa tuyến đường API
router.get('/phan-cong-giang-day/:madn', getPhanCongTheoGiangVien);

module.exports = router;