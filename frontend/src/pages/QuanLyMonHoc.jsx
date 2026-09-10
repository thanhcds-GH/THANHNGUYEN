import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Nạp thư viện SweetAlert2 vào component

function QuanLyMonHoc() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE QUẢN LÝ THÊM MỚI (MODAL FORM) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    MA_MH_MD: '',
    TEN_MH_MD: '',
    LOAIGA: 'Lý thuyết',
    TIENG_NN: 'Tiếng Việt' // Chuẩn hóa chuỗi văn bản mặc định ban đầu
  });

  useEffect(() => {
    fetchDanhMucMonHoc();
  }, []);

  // Hàm tải danh sách môn học từ Backend
  const fetchDanhMucMonHoc = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/kpi/subjects');
      setDanhSachMonHoc(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi gọi API danh mục môn học:", err);
      setError("Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối API!");
      setLoading(false);
    }
  };

  // Hàm xử lý thay đổi dữ liệu ô nhập liệu trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Hàm xử lý gửi dữ liệu Form lên Backend SQL Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/kpi/subjects', formData);
      
      setIsModalOpen(false);
      setFormData({ MA_MH_MD: '', TEN_MH_MD: '', LOAIGA: 'Lý thuyết', TIENG_NN: 'Tiếng Việt' });
      fetchDanhMucMonHoc();

      // THAY THẾ ALERT CŨ BẰNG SWEETALERT2 CAO CẤP
      Swal.fire({
        title: 'Thông báo',
        text: 'Thêm mới môn học vào hệ thống thành công!',
        icon: 'success',
        confirmButtonText: 'Xác nhận',
        confirmButtonColor: '#2563eb', // Màu xanh đồng bộ với hệ thống của chị
        customClass: {
          popup: 'rounded-2xl', // Bo góc hộp thoại chuẩn hiện đại
          confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm'
        }
      });

    } catch (err) {
      console.error(err);
      
      // THÔNG BÁO LỖI HỆ THỐNG CAO CẤP
      Swal.fire({
        title: 'Cảnh báo lỗi',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu lên hệ thống!',
        icon: 'error',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* KHUNG TIÊU ĐỀ HỆ THỐNG */}
      <div className="max-w-5xl mx-auto bg-linear-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-md p-6 mb-6 text-white">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase">
          HỆ THỐNG QUẢN LÝ KPI GIẢNG VIÊN
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1.5 font-medium opacity-90">
          Phân hệ chuyên môn: Quản lý Danh mục Môn học & Mô-đun (`DANH_MUC_MH_MODUN`)
        </p>
      </div>

      {/* KHU VỰC BẢNG DỮ LIỆU TƯƠNG TÁC */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl shadow-slate-100 border border-slate-200/80 p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Danh sách môn học hiện hành</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu kết xuất đồng bộ từ cơ sở dữ liệu SQL Server</p>
          </div>
          
          {/* SỰ KIỆN CLICK MỞ MODAL FORM */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out"
          >
            + Thêm Môn Học Mới
          </button>
        </div>

        {/* BẢNG HIỂN THỊ DỮ LIỆU ĐỘNG */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-center w-20">Mã DM</th>
                <th className="px-6 py-3.5 w-40">Mã Môn/Mô-đun</th>
                <th className="px-6 py-3.5">Tên Môn Học / Mô-Đun</th>
                <th className="px-6 py-3.5 text-center w-32">Loại Hình</th>
                <th className="px-6 py-3.5 text-center w-32">Ngôn Ngữ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">
                    <span className="inline-block animate-pulse">Đang tải dữ liệu từ SQL Server...</span>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-red-500 font-medium bg-red-50/50">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && danhSachMonHoc.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                    Bảng hiện chưa có dữ liệu môn học. Vui lòng thêm môn học mới!
                  </td>
                </tr>
              )}

              {!loading && !error && danhSachMonHoc.map((monHoc) => (
                <tr key={monHoc.MA_DM_MHMD} className="hover:bg-blue-50/40 transition duration-150">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-center bg-slate-50/50">
                    {monHoc.MA_DM_MHMD}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                    {monHoc.MA_MH_MD}
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-700">
                    {monHoc.TEN_MH_MD}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      monHoc.LOAIGA === 'Tích hợp' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {monHoc.LOAIGA || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-medium">
                    {monHoc.TIENG_NN === '1' || !monHoc.TIENG_NN ? 'Tiếng Việt' : monHoc.TIENG_NN}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CỬA SỔ POPUP MODAL NHẬP LIỆU --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all duration-300">
            
            {/* Modal Header: Thiết kế căn giữa, chữ in đậm, màu vàng ánh kim chuẩn thẩm mỹ */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 relative">
              <h3 className="text-center text-base font-extrabold uppercase tracking-wide text-amber-500">
                Thêm Danh Mục Môn Học Mới
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-4 text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form nhập liệu */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mã Môn học / Mô-đun</label>
                <input 
                  type="text" 
                  name="MA_MH_MD" 
                  required
                  placeholder="Ví dụ: MH_NET_04"
                  value={formData.MA_MH_MD}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên Môn học / Mô-đun</label>
                <input 
                  type="text" 
                  name="TEN_MH_MD" 
                  required
                  placeholder="Nhập tên môn học chuyên ngành"
                  value={formData.TEN_MH_MD}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Loại hình</label>
                  <select 
                    name="LOAIGA"
                    value={formData.LOAIGA}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="Lý thuyết">Lý thuyết</option>
                    <option value="Thực hành">Thực hành</option>
                    <option value="Tích hợp">Tích hợp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ngôn ngữ</label>
                  <select 
                    name="TIENG_NN"
                    value={formData.TIENG_NN}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    {/* CHUẨN HÓA: Thuộc tính value được gán trực tiếp bằng chuỗi văn bản tự nhiên */}
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Song ngữ">Song ngữ</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer / Các nút điều hướng thao tác */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
                >
                  Lưu CSDL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default QuanLyMonHoc;