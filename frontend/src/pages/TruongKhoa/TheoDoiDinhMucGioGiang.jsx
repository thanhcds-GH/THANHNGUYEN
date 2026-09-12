import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TheoDoiDinhMucGioGiang = () => {
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : {
        MADN: 'GV018',
        HOTEN: 'Trần Hiếu Nghĩa',
        role: 'Trưởng khoa'
    };

    // Danh sách giảng viên chuẩn của Khoa Điện tử - Tin học
    const danhSachGiangVien = [
        { MADN: 'GV001', HOTEN: 'Nguyễn Lê Ngọc Thành', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV002', HOTEN: 'Lê Thị Kim Oanh', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV003', HOTEN: 'Nguyễn Văn Đại', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV004', HOTEN: 'Đinh Thị Thu', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV005', HOTEN: 'Nguyễn Giang Long', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV006', HOTEN: 'Lương Thanh Long', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV007', HOTEN: 'Lê Thị Hòa', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV008', HOTEN: 'Lê Tấn Hòa', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV009', HOTEN: 'Dương Văn Vinh', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV010', HOTEN: 'Nguyễn Bích Hà', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV012', HOTEN: 'Nguyễn Thị Thanh Thắng', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV014', HOTEN: 'Huỳnh Thị Hồng Sinh', CHUYENNGANH: 'Công Nghệ Thông Tin' },
        { MADN: 'GV018', HOTEN: 'Trần Hiếu Nghĩa', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV019', HOTEN: 'Dư Vĩ Bằng', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV020', HOTEN: 'Đào Thị Thúy Dung', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV021', HOTEN: 'Thái Thiên Ân', CHUYENNGANH: 'Điện tử' },
        { MADN: 'GV022', HOTEN: 'Bùi Thị Thu Hà', CHUYENNGANH: 'Tiếng Anh' },
        { MADN: 'GV023', HOTEN: 'Trì Thị Kim Hồng', CHUYENNGANH: 'Tiếng Anh' }
    ];

    const [selectedMaGV, setSelectedMaGV] = useState('GV001');
    const [namHoc, setNamHoc] = useState('2026-2027');
    const [hocKy, setHocKy] = useState('Học kỳ 1');
    
    // State lưu dữ liệu phân công thực tế từ CSDL qua API
    const [dsLopPhanCong, setDsLopPhanCong] = useState([]);
    const [loading, setLoading] = useState(false);

    const dinhMucHocKy = 224;
    const dinhMucNCKH = 84;

    // Gọi API lấy dữ liệu phân công giảng dạy thực tế của giảng viên được chọn
    useEffect(() => {
        if (!selectedMaGV) return;

        const fetchPhanCongTheoGV = async () => {
            setLoading(true);
            try {
                const kyValue = hocKy.includes('2') ? '2' : '1';
                const response = await axios.get(`http://localhost:5000/api/phan-cong-giang-day/${selectedMaGV}`, {
                    params: {
                        namHoc: namHoc,
                        hocKy: kyValue
                    }
                });

                if (response.data && response.data.success) {
                    setDsLopPhanCong(response.data.data);
                } else {
                    setDsLopPhanCong([]);
                }
            } catch (error) {
                console.error('Lỗi tải dữ liệu phân công:', error);
                setDsLopPhanCong([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPhanCongTheoGV();
    }, [selectedMaGV, namHoc, hocKy]);

    // Lấy thông tin giảng viên đang chọn
    const currentGVInfo = danhSachGiangVien.find(g => g.MADN === selectedMaGV) || danhSachGiangVien[0];

    // Tính toán số liệu thống kê động từ CSDL
    const tongGioDay = dsLopPhanCong.reduce((sum, item) => sum + (Number(item.SO_GIO) || 0), 0);
    const phanTramDat = dinhMucHocKy > 0 ? Math.round((tongGioDay / dinhMucHocKy) * 100) : 0;
    const gioNCKH = dinhMucNCKH;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Ban Chủ Nhiệm Khoa */}
                <div className="bg-[#3B82F6] rounded-2xl p-5 shadow-md flex flex-col lg:flex-row items-center justify-between border-b border-blue-400 gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-[#FFD700] tracking-wide uppercase">
                            GIÁM SÁT ĐỊNH MỨC GIỜ GIẢNG TOÀN KHOA
                        </h2>
                        <div className="text-xs text-blue-100 font-semibold mt-1">
                            Người thao tác: <span className="text-white font-bold">{currentUser.HOTEN}</span> ({currentUser.MADN}) 
                            <span className="ml-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                                Vai trò: Trưởng Khoa
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Bộ chọn Giảng viên */}
                        <select
                            value={selectedMaGV}
                            onChange={(e) => setSelectedMaGV(e.target.value)}
                            className="px-3.5 py-2 bg-amber-300 text-slate-900 border-2 border-amber-400 rounded-xl text-xs font-black focus:outline-none shadow-sm cursor-pointer"
                        >
                            {danhSachGiangVien.map((gv) => (
                                <option key={gv.MADN} value={gv.MADN}>
                                    👨‍🏫 {gv.MADN} - {gv.HOTEN} ({gv.CHUYENNGANH})
                                </option>
                            ))}
                        </select>

                        <select
                            value={namHoc}
                            onChange={(e) => setNamHoc(e.target.value)}
                            className="px-3.5 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold focus:outline-none shadow-sm"
                        >
                            <option value="2026-2027">Năm học 2026-2027</option>
                            <option value="2025-2026">Năm học 2025-2026</option>
                        </select>

                        <select
                            value={hocKy}
                            onChange={(e) => setHocKy(e.target.value)}
                            className="px-3.5 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold focus:outline-none shadow-sm"
                        >
                            <option value="Học kỳ 1">Học kỳ 1</option>
                            <option value="Học kỳ 2">Học kỳ 2</option>
                        </select>
                    </div>
                </div>

                {/* 3 Thẻ KPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">ĐỊNH MỨC HỌC KỲ</span>
                        <div className="my-3">
                            <span className="text-3xl font-black text-slate-900">{dinhMucHocKy}</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">giờ</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">GIỜ THỰC DẠY PHÂN CÔNG</span>
                        <div className="my-3">
                            <span className="text-3xl font-black text-blue-600">{tongGioDay}</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">giờ</span>
                        </div>
                        <div className="space-y-1">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-300 ${tongGioDay >= dinhMucHocKy ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${Math.min(phanTramDat, 100)}%` }}
                                ></div>
                            </div>
                            <span className={`text-[11px] font-bold ${tongGioDay >= dinhMucHocKy ? 'text-emerald-600' : 'text-amber-600'}`}>
                                Đạt {phanTramDat}% chỉ tiêu ({tongGioDay >= dinhMucHocKy ? `Vượt ${tongGioDay - dinhMucHocKy} giờ` : `Thiếu ${dinhMucHocKy - tongGioDay} giờ`})
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">GIỜ NCKH TÍCH LŨY</span>
                        <div className="my-3">
                            <span className="text-3xl font-black text-indigo-600">{gioNCKH}</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">/ 84 giờ</span>
                        </div>
                        <div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block bg-purple-50 text-purple-700 border-purple-200">
                                Đã hoàn thành chỉ tiêu NCKH
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bảng Chi tiết */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                            CHI TIẾT PHÂN CÔNG - {currentGVInfo.HOTEN.toUpperCase()} ({selectedMaGV}) - [{hocKy} - {namHoc}]
                        </span>
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                            Tổng: {tongGioDay} giờ
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-10 text-xs font-bold text-slate-500">Đang tải dữ liệu phân công thực tế từ CSDL...</div>
                        ) : (
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4 text-center">STT</th>
                                        <th className="py-3 px-4">MÃ MH</th>
                                        <th className="py-3 px-4">TÊN MÔN HỌC / MÔ-ĐUN</th>
                                        <th className="py-3 px-4">LỚP HỌC</th>
                                        <th className="py-3 px-4 text-center">SĨ SỐ</th>
                                        <th className="py-3 px-4 text-center">STC</th>
                                        <th className="py-3 px-4 text-center">SỐ GIỜ</th>
                                        <th className="py-3 px-4 text-center">PHÒNG / XƯỞNG</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium bg-white">
                                    {dsLopPhanCong.length > 0 ? (
                                        dsLopPhanCong.map((row, index) => (
                                            <tr key={row.ID_PHAN_CONG || index} className="hover:bg-blue-50/40 transition">
                                                <td className="py-3.5 px-4 text-slate-500 font-bold text-center">{index + 1}</td>
                                                <td className="py-3.5 px-4 font-black text-slate-900">{row.MA_MH}</td>
                                                <td className="py-3.5 px-4 font-bold text-blue-700">{row.TEN_MH}</td>
                                                <td className="py-3.5 px-4 font-bold text-slate-800">{row.LOP}</td>
                                                <td className="py-3.5 px-4 text-center">{row.SI_SO}</td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700">{row.STC}</td>
                                                <td className="py-3.5 px-4 text-center font-black text-blue-600">{row.SO_GIO} giờ</td>
                                                <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{row.PHONG || 'P.303'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-10 text-center text-slate-400 italic font-semibold">
                                                Giảng viên chưa được phân công môn học trong học kỳ này.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TheoDoiDinhMucGioGiang;