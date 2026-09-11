import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole, SPECIAL_ACCOUNTS } from '../utils/authRoles';

const TeacherNavbar = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userRole = getUserRole(currentUser);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    return (
        <nav className="bg-[#1E40AF] text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
                
                {/* Brand / Logo */}
                <Link to="/dashboard" className="font-black text-[#FFD700] text-sm md:text-base uppercase tracking-wider">
                    HỆ THỐNG KPI & QUẢN LÝ KHOA
                </Link>

                {/* Danh mục menu theo quyền */}
                <div className="hidden md:flex items-center space-x-1 text-xs font-bold">
                    
                    {/* Mục chung cho mọi Giảng viên */}
                    <Link to="/nhap-de-tai-nckh" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                        Khai báo NCKH
                    </Link>
                    <Link to="/xem-dinh-muc-gio-giang" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                        Định mức cá nhân
                    </Link>
                    <Link to="/import-lich-day" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                        Import lịch dạy
                    </Link>
                    <Link to="/tra-cuu-diem-danh" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                        Điểm danh
                    </Link>

                    {/* Menu riêng cho Thư ký khoa & Trưởng khoa */}
                    {(userRole === 'THU_KY' || userRole === 'TRUONG_KHOA') && (
                        <>
                            <span className="text-blue-400 font-normal">|</span>
                            <Link to="/theo-doi-de-tai-nckh" className="px-3 py-2 rounded-lg bg-indigo-700 text-[#FFD700] hover:bg-indigo-800 transition">
                                Thẩm định NCKH
                            </Link>
                            <Link to="/quan-ly-cong-van" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                                Công văn
                            </Link>
                        </>
                    )}

                    {/* Menu riêng cho Trưởng Bộ môn & Trưởng khoa */}
                    {(userRole === 'TO_TRUONG_BM' || userRole === 'TRUONG_KHOA') && (
                        <>
                            <span className="text-blue-400 font-normal">|</span>
                            <Link to="/phan-cong-giang-day" className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
                                Phân công giảng dạy
                            </Link>
                            <Link to="/quan-ly-mon-hoc" className="px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                                Môn học
                            </Link>
                        </>
                    )}

                    {/* Menu đặc thù chỉ Trưởng khoa (GV018) có */}
                    {userRole === 'TRUONG_KHOA' && (
                        <>
                            <span className="text-blue-400 font-normal">|</span>
                            <Link to="/giam-sat-dinh-muc-toan-khoa" className="px-3 py-2 rounded-lg bg-amber-500 text-slate-900 font-black hover:bg-amber-400 transition">
                                Giám sát toàn khoa
                            </Link>
                        </>
                    )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-blue-100 hidden sm:inline">
                        <strong className="text-white">{currentUser?.HOTEN || currentUser?.name}</strong> 
                        <span className="text-[10px] ml-1 bg-blue-900 px-1.5 py-0.5 rounded text-amber-300">
                            {SPECIAL_ACCOUNTS[currentUser?.MADN]?.title || 'Giảng viên'}
                        </span>
                    </span>
                    <button 
                        onClick={handleLogout}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                        Đăng xuất
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default TeacherNavbar;