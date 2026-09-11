import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Component bảo vệ phân quyền
import ProtectedRoute from './components/ProtectedRoute';

// 2. Các trang nằm trực tiếp trong src/pages/
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuanLyCongVan from './pages/QuanLyCongVan';
import QuanLyDiemDanhTrieuTap from './pages/QuanLyDiemDanhTrieuTap';
import QuanLyGiangVien from './pages/QuanLyGiangVien';
import QuanLyMonHoc from './pages/QuanLyMonHoc';
import QuanLyPhanCong from './pages/QuanLyPhanCong';

// 3. Các trang nằm trong thư mục con
import NhapDeTaiNCKH from './pages/GiangVien/NhapDeTaiNCKH';
import XemDinhMucGioGiang from './pages/GiangVien/XemDinhMucGioGiang';
import ImportLichDay from './pages/LichDay/ImportLichDay';
import TheoDoiDeTaiNCKH from './pages/ThuKy/TheoDoiDeTaiNCKH';
import TheoDoiDinhMucGioGiang from './pages/TruongKhoa/TheoDoiDinhMucGioGiang';

function App() {
    return (
        <Router>
            <Routes>
                {/* Đăng nhập */}
                <Route path="/login" element={<Login />} />

                {/* Dashboard */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================================= */}
                {/* 1. DÀNH CHO TRƯỞNG KHOA (GV018) */}
                {/* ========================================================= */}
                <Route 
                    path="/giam-sat-dinh-muc-toan-khoa" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA']}>
                            <TheoDoiDinhMucGioGiang />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/quan-ly-giang-vien" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA']}>
                            <QuanLyGiangVien />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================================= */}
                {/* 2. DÀNH CHO TRƯỞNG KHOA & TRƯỞNG BỘ MÔN (GV004, GV008) */}
                {/* ========================================================= */}
                <Route 
                    path="/quan-ly-mon-hoc" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'TO_TRUONG_BM']}>
                            <QuanLyMonHoc />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/phan-cong-giang-day" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'TO_TRUONG_BM']}>
                            <QuanLyPhanCong />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================================= */}
                {/* 3. DÀNH CHO THƯ KÝ KHOA (GV025) & TRƯỞNG KHOA (GV018) */}
                {/* ========================================================= */}
                <Route 
                    path="/theo-doi-de-tai-nckh" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'THU_KY']}>
                            <TheoDoiDeTaiNCKH />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/quan-ly-cong-van" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'THU_KY']}>
                            <QuanLyCongVan />
                        </ProtectedRoute>
                    } 
                />

                {/* Tuyến đường điểm danh triệu tập (Nhận lệnh từ nút bấm trang Quản lý công văn) */}
                <Route 
                    path="/diem-danh-trieu-tap/:maHoatDong" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'THU_KY']}>
                            <QuanLyDiemDanhTrieuTap />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/quan-ly-diem-danh/:maHoatDong" 
                    element={
                        <ProtectedRoute allowedRoles={['TRUONG_KHOA', 'THU_KY']}>
                            <QuanLyDiemDanhTrieuTap />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================================= */}
                {/* 4. DÀNH CHO TOÀN THỂ GIẢNG VIÊN */}
                {/* ========================================================= */}
                <Route 
                    path="/nhap-de-tai-nckh" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <NhapDeTaiNCKH />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/xem-dinh-muc-gio-giang" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <XemDinhMucGioGiang />
                        </ProtectedRoute>
                    } 
                />
                {/* Tuyến đường tra cứu điểm danh (Có tham số mã hoạt động) */}
                <Route 
                    path="/tra-cuu-diem-danh/:maHoatDong" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <QuanLyDiemDanhTrieuTap />
                        </ProtectedRoute>
                    } 
                />
                {/* Tuyến đường tra cứu điểm danh dự phòng nếu không kèm tham số */}
                <Route 
                    path="/tra-cuu-diem-danh" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <QuanLyDiemDanhTrieuTap />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/import-lich-day" 
                    element={
                        <ProtectedRoute allowedRoles={['GIANG_VIEN', 'TO_TRUONG_BM', 'TRUONG_KHOA', 'THU_KY']}>
                            <ImportLichDay />
                        </ProtectedRoute>
                    } 
                />

                {/* Điều hướng mặc định an toàn */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}
 
export default App;