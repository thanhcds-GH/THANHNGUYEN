import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIAL_ACCOUNTS, getUserRole } from '../utils/authRoles';

const Login = () => {
    const navigate = useNavigate();
    const [vaiTro, setVaiTro] = useState('Giáo viên');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage('');

        const userKey = username.trim();

        if (!userKey) {
            setErrorMessage('Vui lòng nhập Tên đăng nhập hoặc Mã GV!');
            return;
        }

        // 1. Kiểm tra tài khoản trong danh mục SPECIAL_ACCOUNTS
        const userFound = SPECIAL_ACCOUNTS[userKey] || SPECIAL_ACCOUNTS[userKey.toUpperCase()] || SPECIAL_ACCOUNTS[userKey.toLowerCase()];

        let userInfo = null;

        if (userFound) {
            userInfo = {
                MADN: userKey.startsWith('GV') ? userKey.toUpperCase() : (userKey === 'truongkhoa' ? 'GV018' : userKey === 'thuky' ? 'GV025' : 'GV001'),
                HOTEN: userFound.name,
                name: userFound.name,
                role: userFound.role,
                title: userFound.title,
                chuyenNganh: userFound.chuyenNganh
            };
        } else {
            // Trường hợp tài khoản tự do nhập
            userInfo = {
                MADN: userKey,
                HOTEN: userKey,
                name: userKey,
                role: vaiTro === 'Trưởng khoa' ? 'TRUONG_KHOA' : vaiTro === 'Thư ký' ? 'THU_KY' : 'GIANG_VIEN',
                title: vaiTro
            };
        }

        // 2. Lưu phiên đăng nhập vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(userInfo));

        // 3. Điều hướng ngay lập tức vào Dashboard
        navigate('/dashboard');
    };

    // Hàm tiện ích: Bấm vào tài khoản demo để điền nhanh và đăng nhập
    const handleQuickLogin = (demoUser, roleName) => {
        setUsername(demoUser);
        setPassword('123');
        setVaiTro(roleName);

        const userFound = SPECIAL_ACCOUNTS[demoUser];
        const userInfo = {
            MADN: demoUser === 'truongkhoa' ? 'GV018' : demoUser === 'thuky' ? 'GV025' : 'GV001',
            HOTEN: userFound?.name || demoUser,
            name: userFound?.name || demoUser,
            role: userFound?.role || 'GIANG_VIEN',
            title: userFound?.title || roleName
        };

        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                
                {/* Header Form */}
                <div className="bg-[#3B82F6] p-6 text-center text-white">
                    <h1 className="text-xl font-black text-[#FFD700] uppercase tracking-wider">
                        HỆ THỐNG QUẢN LÝ KHOA
                    </h1>
                    <p className="text-xs font-semibold text-blue-100 mt-1 uppercase tracking-wide">
                        Đăng nhập hệ thống
                    </p>
                </div>

                {/* Body Form */}
                <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5">
                    
                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* Chọn vai trò */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            VAI TRÒ TRUY CẬP (*)
                        </label>
                        <select
                            value={vaiTro}
                            onChange={(e) => setVaiTro(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        >
                            <option value="Giáo viên">🎓 Giáo viên (Tra cứu & Điểm danh)</option>
                            <option value="Thư ký">📝 Thư ký (Thẩm định NCKH & Công văn)</option>
                            <option value="Trưởng khoa">🏛️ Trưởng khoa / Trưởng BM (Phân công & Giám sát)</option>
                        </select>
                    </div>

                    {/* Tên đăng nhập */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            TÊN ĐĂNG NHẬP / MÃ GV (*)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Nhập mã GV (GV018, GV001...) hoặc username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            MẬT KHẨU (*)
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Nút đăng nhập */}
                    <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition transform active:scale-98 uppercase tracking-wider"
                    >
                        ĐĂNG NHẬP
                    </button>

                    {/* Khối tài khoản demo nhanh */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 block">
                            Tài khoản demo nhanh (bấm để vào trực tiếp):
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('truongkhoa', 'Trưởng khoa')}
                                className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-extrabold border border-amber-200 transition text-center"
                            >
                                🏛️ Trưởng khoa
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('thuky', 'Thư ký')}
                                className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-[11px] font-extrabold border border-indigo-200 transition text-center"
                            >
                                📝 Thư ký
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('giaovien', 'Giáo viên')}
                                className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-extrabold border border-emerald-200 transition text-center"
                            >
                                🎓 Giáo viên
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Login;