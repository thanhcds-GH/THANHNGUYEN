const express = require('express');
const router = express.Router();
const trieuTapController = require('../controllers/trieuTapController');

// Khai báo đường dẫn API xử lý
router.post('/trieu-tap', trieuTapController.khoiTaoLichTrieuTap);

module.exports = router;