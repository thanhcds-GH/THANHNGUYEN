import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// Nhập Component Con vừa được chị khởi tạo
//import ModalThemGiangVien from './ModalThemGiangVien';
import ModalThemGiangVien from '../components/ModalThemGiangVien';
function QuanLyGiangVien() {
  // 1. Quản lý các trạng thái dữ liệu (States)
  const [danhSachGV, setDanhSachGV] = useState([]);
  const [danhSachChucDanh, setDanhSachChucDanh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Tự động tải dữ liệu từ API khi giao diện được gắn (Mount)
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (isMounted) {
        await fetchChucDanhQuotas();
        await fetchGiangVien();
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  // 3. Hàm gọi API lấy danh sách giảng viên (Đã kết nối table SQL Server)
  const fetchGiangVien = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/lecturers');
      const data = response.data?.recordset || response.data;
      setDanhSachGV(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách giảng viên:", err);
      Swal.fire({
        title: 'Cảnh báo',
        text: 'Không thể tải danh sách giảng viên từ hệ thống!',
        icon: 'error',
        confirmButtonText: 'Xác nhận',
        confirmButtonColor: '#dc2626'
      });
      setLoading(false);
    }
  };

  // 4. Hàm gọi API lấy định mức chức danh phục vụ danh mục ComboBox
  const fetchChucDanhQuotas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/lecturers/quotas');
      const data = response.data?.recordset || response.data;
      if (data && Array.isArray(data)) {
        setDanhSachChucDanh(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh mục chức danh:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Khối Banner Tiêu đề Phân hệ */}
      <div className="max-w-6xl mx-auto bg-linear-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-md p-6 mb-6 text-white">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase">
          HỆ THỐNG QUẢN LÝ KPI GIẢNG VIÊN
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1.5 font-medium opacity-90">
          Phân hệ chuyên môn: Hồ sơ Nhân sự & Định mức nghĩa vụ chuyên ngành (`GIANG_VIEN`)
        </p>
      </div>

      {/* Khu vực Bảng hiển thị danh sách nhân sự */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl shadow-slate-100 border border-slate-200/80 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Danh sách nhân sự & Định mức chuẩn</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu hồ sơ kết xuất đồng bộ từ cơ sở dữ liệu SQL Server</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            + Tiếp Nhận Giảng Viên Mới
          </button>
        </div>

        {/* Cấu trúc Bảng dữ liệu chuẩn hóa */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 text-center w-16">ID</th>
                <th className="px-4 py-3.5 w-28">Mã Đăng Nhập</th>
                <th className="px-5 py-3.5 w-48">Họ và Tên</th>
                <th className="px-5 py-3.5">Bộ Môn</th>
                <th className="px-5 py-3.5 w-52">Chức danh / Định mức</th>
                <th className="px-4 py-3.5 text-center w-24">Giờ dạy gốc</th>
                <th className="px-4 py-3.5 text-center w-24">Giờ NCKH</th>
                <th className="px-4 py-3.5 text-center w-28">Hệ thống Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-medium">Đang tải dữ liệu giảng viên...</td>
                </tr>
              ) : danhSachGV.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-medium">Chưa có dữ liệu giảng viên.</td>
                </tr>
              ) : (
                danhSachGV.map((gv, index) => (
                  <tr key={gv.MA_GIANGVIEN || index} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-4 text-center font-semibold text-slate-400 bg-slate-50/30">{gv.MA_GIANGVIEN || '-'}</td>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">{gv.MADN || '-'}</td>
                    <td className="px-5 py-4 font-bold text-blue-900">
                      <div>{gv.HOTEN || 'N/A'}</div>
                      <div className="text-xs font-normal text-slate-400 mt-0.5">{gv.Email || 'Chưa cập nhật email'}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{gv.BO_MON || 'Công Nghệ Thông Tin'}</td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-semibold border border-slate-200">
                        {gv.TEN_DM || 'Chưa cấu hình định mức'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-indigo-600 bg-indigo-50/20">{gv.DM_GIO_GV !== undefined ? gv.DM_GIO_GV : 0} giờ</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600 bg-emerald-50/20">{gv.DM_GIO_NCKH !== undefined ? gv.DM_GIO_NCKH : 0} giờ</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                        gv.Role === 'Admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {gv.Role || 'Teacher'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRUYỀN DỮ LIỆU XUỐNG COMPONENT CON QUA PROPS */}
      <ModalThemGiangVien 
        isOpen={isModalOpen}                                // Trạng thái đóng/mở
        onClose={() => setIsModalOpen(false)}               // Hàm đóng modal
        danhSachChucDanh={danhSachChucDanh}                 // Dữ liệu danh mục định mức
        onSaveSuccess={fetchGiangVien}                      // Callback làm mới danh sách khi lưu thành công
      />

    </div>
  );
}

export default QuanLyGiangVien;