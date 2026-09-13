const express = require('express');
const router = express.Router();
const nckhController = require('../controllers/nckhController');

// Định nghĩa các endpoint
router.get('/danh-sach', nckhController.getDanhSach);
router.post('/luu', nckhController.luuDeTai);
router.put('/cap-nhat-trang-thai/:id', nckhController.capNhatTrangThai);

module.exports = router;