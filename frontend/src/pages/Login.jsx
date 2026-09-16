import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// DANH SÁCH 19 TÀI KHOẢN CHUẨN XÁC KÈM MẬT KHẨU BẢO MẬT TỪ CƠ SỞ DỮ LIỆU SQL
const STRICT_WHITELIST = {
    'GV001': { password: '123', name: 'Nguyễn Lê Ngọc Thành', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV002': { password: '123', name: 'Lê Thị Kim Oanh', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV003': { password: '123', name: 'Nguyễn Văn Đại', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV004': { password: '123', name: 'Đinh Thị Thu', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV005': { password: '123', name: 'Nguyễn Giang Long', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV006': { password: '123', name: 'Lương Thanh Long', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV007': { password: '123', name: 'Lê Thị Hòa', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV008': { password: '123', name: 'Lê Tấn Hòa', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV010': { password: '123', name: 'Nguyễn Bích Hà', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV012': { password: '123', name: 'Nguyễn Thị Thanh Thắng', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV014': { password: '123', name: 'Huỳnh Thị Hồng Sinh', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV018': { password: '123', name: 'Trần Hiếu Nghĩa', role: 'TRUONG_KHOA', title: 'Trưởng khoa' },
    'GV019': { password: '123', name: 'Dư Vĩ Bằng', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV020': { password: '123', name: 'Đào Thị Thúy Dung', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV021': { password: '123', name: 'Thái Thiên Ân', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV022': { password: '123', name: 'Bùi Thị Thu Hà', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV023': { password: '123', name: 'Trì Thị Kim Hồng', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV024': { password: '123', name: 'Trần Ngọc Hoài Thương', role: 'GIANG_VIEN', title: 'Giảng viên' },
    'GV025': { password: '123', name: 'Lê Đức An', role: 'THU_KY', title: 'Thư ký' }
};

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
        const passKey = password.trim();

        if (!userKey || !passKey) {
            setErrorMessage('Vui lòng nhập đầy đủ Mã GV và Mật khẩu!');
            return;
        }

        const upperKey = userKey.toUpperCase();
        const userFound = STRICT_WHITELIST[userKey] || STRICT_WHITELIST[upperKey];

        // 🛑 CHỐT CHẶN BẢO MẬT 1: Kiểm tra tài khoản có tồn tại không
        if (!userFound) {
            setErrorMessage('Mã đăng nhập không hợp lệ!');
            return;
        }

        // 🛑 CHỐT CHẶN BẢO MẬT 2: Kiểm tra mật khẩu có khớp chính xác không
        if (userFound.password !== passKey) {
            setErrorMessage('Mật khẩu không chính xác! Vui lòng thử lại.');
            return;
        }

        // Nếu vượt qua mọi chốt chặn, tạo phiên làm việc an toàn
        const userInfo = {
            MADN: upperKey,
            HOTEN: userFound.name,
            name: userFound.name,
            role: userFound.role,
            title: userFound.title
        };

        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        navigate('/dashboard');
    };

    const handleQuickLogin = (demoKey) => {
        const userFound = STRICT_WHITELIST[demoKey];
        if (!userFound) {
            setErrorMessage('Tài khoản demo không hợp lệ');
            return;
        }

        const userInfo = {
            MADN: demoKey,
            HOTEN: userFound.name,
            name: userFound.name,
            role: userFound.role,
            title: userFound.title
        };

        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="bg-[#3B82F6] p-6 text-center text-white">
                    <h1 className="text-xl font-black text-[#FFD700] uppercase tracking-wider">
                        HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG KHOA ĐIỆN TỬ - TIN HỌC
                    </h1>
                    <p className="text-xs font-semibold text-blue-100 mt-1 uppercase tracking-wide">
                        Đăng nhập hệ thống bảo mật
                    </p>
                </div>

                <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5">
                    {errorMessage && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black text-center shadow-sm">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            VAI TRÒ TRUY CẬP (*)
                        </label>
                        <select
                            value={vaiTro}
                            onChange={(e) => setVaiTro(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        >
                            <option value="Giáo viên">🎓 Giáo viên (Khai báo & Tra cứu)</option>
                            <option value="Thư ký">📝 Thư ký (Theo dõi NCKH & Công văn)</option>
                            <option value="Trưởng khoa">🏛️ Trưởng khoa / Trưởng BM (Phân công & Giám sát)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            TÊN ĐĂNG NHẬP / MÃ GV (*)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Nhập mã GV (GV001, GV018...)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>

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

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition transform active:scale-98 uppercase tracking-wider"
                    >
                        ĐĂNG NHẬP
                    </button>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 block">
                            Tài khoản demo nhanh (bấm để vào trực tiếp):
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('GV018')}
                                className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-extrabold border border-amber-200 transition text-center"
                            >
                                🏛️ Trưởng khoa
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('GV025')}
                                className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-[11px] font-extrabold border border-indigo-200 transition text-center"
                            >
                                📝 Thư ký
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('GV001')}
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