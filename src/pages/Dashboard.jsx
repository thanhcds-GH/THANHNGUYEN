import React from 'react';
import { Link } from 'react-router-dom';
import TeacherNavbar from '../components/TeacherNavbar';
import { getUserRole, SPECIAL_ACCOUNTS } from '../utils/authRoles';

const Dashboard = () => {
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : {
        MADN: 'GV001',
        HOTEN: 'Nguyễn Lê Ngọc Thành',
        role: 'Giáo viên'
    };

    const userRole = getUserRole(currentUser);
    const userTitle = SPECIAL_ACCOUNTS[currentUser?.MADN]?.title || 'Giảng viên';

    return (
        <div className="min-h-screen bg-slate-50">
            <TeacherNavbar />

            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                
                {/* Banner Chào mừng */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <span className="bg-blue-800/80 text-[#FFD700] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-400">
                            {userTitle}
                        </span>
                        <h1 className="text-xl md:text-2xl font-black mt-2">
                            Xin chào, {currentUser?.HOTEN || currentUser?.name}!
                        </h1>
                        <p className="text-xs md:text-sm text-blue-100 mt-1">
                            Hệ thống Quản lý Phân công Giảng dạy, Giám sát Định mức & Theo dõi NCKH - Khoa Điện tử Tin học
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-right">
                        <div className="text-[11px] text-blue-200">Năm học hiện tại</div>
                        <div className="text-sm font-black text-[#FFD700]">2026 - 2027 (HK1)</div>
                    </div>
                </div>

                {/* Khối chức năng theo quyền hạn */}
                <div>
                    <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                        PHÂN HỆ CHỨC NĂNG DÀNH CHO BẠN
                    </h2>

                    {/* Bố trí dạng lưới 2 cột cân đối */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. Menu Quản lý Công văn (Dành cho Thư ký & Trưởng khoa) */}
                        {(userRole === 'THU_KY' || userRole === 'TRUONG_KHOA') && (
                            <Link 
                                to="/quan-ly-cong-van"
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-2xl">📁</span>
                                    <h3 className="font-bold text-slate-800 text-sm mt-2">Quản lý Công văn</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Tiếp nhận, lưu trữ và theo dõi tiến độ xử lý công văn đến, công văn đi của Khoa.
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
                                    Truy cập &rarr;
                                </span>
                            </Link>
                        )}

                        {/* 2. Menu Khai báo NCKH (Dành cho tất cả Giảng viên) */}
                        <Link 
                            to="/nhap-de-tai-nckh"
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-2xl">📝</span>
                                <h3 className="font-bold text-slate-800 text-sm mt-2">Khai báo Đề tài NCKH</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Đăng ký đề tài NCKH, sáng kiến kinh nghiệm và theo dõi giờ quy đổi.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
                                Truy cập &rarr;
                            </span>
                        </Link>

                        {/* 3. Menu Định mức Giờ giảng Cá nhân (Dành cho tất cả Giảng viên) */}
                        <Link 
                            to="/xem-dinh-muc-gio-giang"
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-2xl">⏱️</span>
                                <h3 className="font-bold text-slate-800 text-sm mt-2">Định mức Giờ giảng Cá nhân</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Xem tiến độ thực hiện định mức giờ dạy và chỉ tiêu NCKH trong kỳ.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
                                Truy cập &rarr;
                            </span>
                        </Link>

                        {/* 4. Menu Theo dõi NCKH toàn khoa (Dành cho Thư ký & Trưởng khoa) */}
                        {(userRole === 'THU_KY' || userRole === 'TRUONG_KHOA') && (
                            <Link 
                                to="/theo-doi-de-tai-nckh"
                                className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-2xl">⚖️</span>
                                    <h3 className="font-bold text-indigo-900 text-sm mt-2">
                                        Theo dõi, giám sát Đề tài NCKH toàn khoa
                                    </h3>
                                    <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                                        Phê duyệt kết quả Hội đồng thẩm định và xuất báo cáo Excel/PDF.
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-indigo-600 mt-4 flex items-center gap-1">
                                    Truy cập &rarr;
                                </span>
                            </Link>
                        )}

                        {/* 5. Menu Phân công Giảng dạy (Dành cho Trưởng Bộ môn & Trưởng khoa) */}
                        {(userRole === 'TO_TRUONG_BM' || userRole === 'TRUONG_KHOA') && (
                            <Link 
                                to="/phan-cong-giang-day"
                                className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-2xl">📋</span>
                                    <h3 className="font-bold text-emerald-900 text-sm mt-2">Phân công Giảng dạy</h3>
                                    <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                                        Xếp lịch và phân công giảng viên phụ trách các lớp môn học.
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">
                                    Truy cập &rarr;
                                </span>
                            </Link>
                        )}

                        {/* 6. Menu Giám sát Định mức Toàn khoa (Đặc thù riêng cho Trưởng khoa) */}
                        {userRole === 'TRUONG_KHOA' && (
                            <Link 
                                to="/giam-sat-dinh-muc-toan-khoa"
                                className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-2xl">📊</span>
                                    <h3 className="font-bold text-amber-900 text-sm mt-2">Giám sát Định mức Toàn khoa</h3>
                                    <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                                        Kiểm tra chi tiết giờ thực dạy của toàn bộ 18 giảng viên trong khoa.
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
                                    Truy cập &rarr;
                                </span>
                            </Link>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;