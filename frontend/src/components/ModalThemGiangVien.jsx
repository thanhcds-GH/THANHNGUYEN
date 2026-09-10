import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axiosClient';
import Swal from 'sweetalert2';

function ModalThemGiangVien({ isOpen, onClose, danhSachChucDanh, onSaveSuccess }) {
  // Trạng thái cục bộ quản lý dữ liệu nhập vào Form
  const [formData, setFormData] = useState({
    MADN: '',
    HOTEN: '',
    Email: '',
    MA_CHUCDANH: '',
    BO_MON: 'Công Nghệ Thông Tin',
    Role: 'Teacher',
    TRANGTHAI: 'Đang giảng dạy' // ĐÃ BỔ SUNG: Khớp với cấu trúc trường TRANGTHAI trong SQL Server
  });

  // Đồng bộ lại MA_CHUCDANH mặc định khi danh mục từ Cha tải xong
  useEffect(() => {
    if (danhSachChucDanh && danhSachChucDanh.length > 0) {
      setFormData(prev => ({ ...prev, MA_CHUCDANH: danhSachChucDanh[0].MA_CHUCDANH }));
    }
  }, [danhSachChucDanh]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Đẩy dữ liệu đồng bộ cấu trúc xuống API Backend
      //const response = await axios.post('http://localhost:5000/api/lecturers', formData);
      const response = await api.post('/api/lecturers', formData);
      // Kích hoạt hàm gọi lại từ Cha để cập nhật lưới hiển thị bảng
      onSaveSuccess();
      
      // Đóng cửa sổ và thiết lập lại dữ liệu ban đầu
      onClose();
      setFormData({
        MADN: '',
        HOTEN: '',
        Email: '',
        MA_CHUCDANH: danhSachChucDanh[0]?.MA_CHUCDANH || '',
        BO_MON: 'Công Nghệ Thông Tin',
        Role: 'Teacher',
        TRANGTHAI: 'Đang giảng dạy'
      });

      Swal.fire({
        title: 'Thành công!',
        text: response.data?.message || 'Thêm thông tin giảng viên thành công!',
        icon: 'success',
        confirmButtonText: 'Xác nhận',
        confirmButtonColor: '#2563eb',
        customClass: { popup: 'rounded-2xl' }
      });

    } catch (err) {
      console.error("Lỗi chi tiết từ hệ thống Backend:", err);
      Swal.fire({
        title: 'Cảnh báo lỗi',
        text: err.response?.data?.message || 'Có lỗi xảy ra trong quá trình ghi nhận dữ liệu vào SQL Server!',
        icon: 'error',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden transform transition-all duration-300">
        
        {/* Tiêu đề Form màu vàng ánh kim */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 relative">
          <h3 
            className="text-center text-base font-extrabold uppercase tracking-wide"
            style={{ color: '#D4AF37' }}
          >
            Khai báo hồ sơ Giảng viên mới
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute right-6 top-4 text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mã số đăng nhập (MADN)*</label>
              <input type="text" name="MADN" required placeholder="Ví dụ: gv_anhnv" value={formData.MADN} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Họ và tên giảng viên*</label>
              <input type="text" name="HOTEN" required placeholder="Nhập đầy đủ họ tên" value={formData.HOTEN} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Hộp thư điện tử (Email)</label>
            <input type="email" name="Email" placeholder="username@nhatruong.edu.vn" value={formData.Email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bộ Môn*</label>
            <select 
              name="BO_MON" 
              value={formData.BO_MON} 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
            >
              <option value="Công Nghệ Thông Tin">Công Nghệ Thông Tin</option>
              <option value="Điện tử">Điện tử</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cấu hình định mức gốc (Chức danh)*</label>
              <select name="MA_CHUCDANH" value={formData.MA_CHUCDANH} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white">
                {danhSachChucDanh.map(cd => (
                  <option key={cd.MA_CHUCDANH} value={cd.MA_CHUCDANH}>{cd.TEN_DM}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vai trò hệ thống (Role)</label>
              <select name="Role" value={formData.Role} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white">
                <option value="Teacher">Teacher (Giảng viên chính thức)</option>
                <option value="Secretary">Secretary (Thư ký khoa)</option>
                <option value="Dean">Dean (Trưởng khoa / Ban giám hiệu)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Hủy bỏ</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition">Lưu CSDL</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalThemGiangVien;