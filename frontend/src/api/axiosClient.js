import axios from 'axios';

// Vite đọc biến môi trường qua import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Tự động ngắt sau 10 giây nếu server hoặc ngrok phản hồi chậm/treo
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Tránh trang cảnh báo HTML của ngrok
  }
});

// Tự động nhận diện FormData để giải phóng header, giúp trình duyệt tự tạo boundary cho file đính kèm
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;