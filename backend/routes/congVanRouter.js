const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const congVanController = require('../controllers/congVanController');

// 1. Khởi tạo thư mục upload
const uploadDir = path.join(__dirname, '../uploads/congvan');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình Multer diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `CV-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// ==========================================
// KHAI BÁO ROUTE
// ==========================================

// 1. Lấy danh sách công văn
router.get('/documents', congVanController.getDanhSachCongVan);

// 2. Tiếp nhận và lưu trữ công văn mới (Dùng trực tiếp upload.single)
router.post('/documents', upload.single('filePdf'), congVanController.themCongVanMoi);

// 3. Cập nhật trạng thái xử lý công văn
router.put('/documents/:id/status', congVanController.capNhatTrangThaiCongVan);

module.exports = router;