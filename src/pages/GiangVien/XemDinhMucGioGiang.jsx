import React, { useState } from 'react';

const XemDinhMucGioGiang = () => {
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : { MADN: 'GV001', HOTEN: 'Nguyễn Lê Ngọc Thành' };

    const [selectedNamHoc, setSelectedNamHoc] = useState('2026-2027');
    const [selectedHocKy, setSelectedHocKy] = useState('Học kỳ 1');

    // Dữ liệu định mức theo quy chế đào tạo
    const dinhMucChuan = {
        GIO_DAY_DINH_MUC_NAM: 448,
        GIO_DAY_DINH_MUC_KY: 224,
        GIO_NCKH_DINH_MUC_NAM: 84,
        GIO_NCKH_DINH_MUC_KY: 42
    };

    // Danh sách lớp phân công thực tế của Giảng viên này
    const dsLopPhanCong = [
        { MA_MH: 'CNTT5D2508', TEN_MH: 'Lập trình C', LOP: 'CĐK20 CNTT A', SI_SO: 27, STC: 3, SO_GIO: 75, PHONG: 'P.303-P.306' },
        { MA_MH: 'CNTT5H2511', TEN_MH: 'Cơ sở dữ liệu', LOP: 'CĐK20 CNTT B', SI_SO: 21, STC: 3, SO_GIO: 45, PHONG: 'P.303-P.306' },
        { MA_MH: '5H05', TEN_MH: 'Tin học', LOP: 'CĐK20 ĐTCN C', SI_SO: 28, STC: 3, SO_GIO: 75, PHONG: 'P.303-P.306' },
        { MA_MH: 'CNTT4D2516', TEN_MH: 'Quản trị cơ sở dữ liệu với SQL Server', LOP: 'TCK19 CNTT A', SI_SO: 19, STC: 3, SO_GIO: 75, PHONG: 'P.303-P.306' }
    ];

    const tongGioThucDay = dsLopPhanCong.reduce((sum, item) => sum + item.SO_GIO, 0);
    const tongGioNCKH = 84;
    const phanTramGioDay = Math.round((tongGioThucDay / dinhMucChuan.GIO_DAY_DINH_MUC_KY) * 100);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-[#3B82F6] rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between border-b border-blue-400 gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-[#FFD700] tracking-wide uppercase">
                        TRA CỨU ĐỊNH MỨC GIỜ GIẢNG & KPI
                    </h2>
                    <p className="text-xs text-blue-100 font-semibold mt-1">
                        Nhà giáo: <span className="text-white font-bold">{currentUser.HOTEN || currentUser.name}</span> - Mã GV: {currentUser.MADN || currentUser.username}
                    </p>
                </div>

                {/* Bộ lọc học kỳ */}
                <div className="flex gap-2">
                    <select
                        value={selectedNamHoc}
                        onChange={(e) => setSelectedNamHoc(e.target.value)}
                        className="px-3 py-1.5 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm focus:outline-none"
                    >
                        <option value="2026-2027">Năm học 2026-2027</option>
                        <option value="2025-2026">Năm học 2025-2026</option>
                    </select>

                    <select
                        value={selectedHocKy}
                        onChange={(e) => setSelectedHocKy(e.target.value)}
                        className="px-3 py-1.5 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm focus:outline-none"
                    >
                        <option value="Học kỳ 1">Học kỳ 1</option>
                        <option value="Học kỳ 2">Học kỳ 2</option>
                    </select>
                </div>
            </div>

            {/* Thẻ Thống Kê KPI Định Mức */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Định mức giờ giảng học kỳ</span>
                    <div className="text-2xl font-black text-slate-800">{dinhMucChuan.GIO_DAY_DINH_MUC_KY} <span className="text-sm font-medium text-slate-500">giờ</span></div>
                    <p className="text-[11px] text-slate-400 font-medium">Định mức cả năm: {dinhMucChuan.GIO_DAY_DINH_MUC_NAM} giờ</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Giờ thực dạy theo phân công</span>
                    <div className="text-2xl font-black text-blue-600">{tongGioThucDay} <span className="text-sm font-medium text-slate-500">giờ</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(phanTramGioDay, 100)}%` }}></div>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-bold">Đạt {phanTramGioDay}% chỉ tiêu học kỳ</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Giờ NCKH tích lũy</span>
                    <div className="text-2xl font-black text-purple-600">{tongGioNCKH} <span className="text-sm font-medium text-slate-500">/ {dinhMucChuan.GIO_NCKH_DINH_MUC_NAM} giờ</span></div>
                    <span className="inline-block bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                        Đã hoàn thành chỉ tiêu NCKH năm
                    </span>
                </div>
            </div>

            {/* Bảng Chi Tiết Môn Giảng Dạy Trong Kỳ */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                        CHI TIẾT CÁC LỚP & MÔN ĐƯỢC PHÂN CÔNG ({selectedHocKy} - {selectedNamHoc})
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                        Tổng giờ: {tongGioThucDay} giờ
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4">STT</th>
                                <th className="py-3 px-4">MÃ MH</th>
                                <th className="py-3 px-4">TÊN MÔN HỌC / MÔ-ĐUN</th>
                                <th className="py-3 px-4">LỚP HỌC</th>
                                <th className="py-3 px-4 text-center">SĨ SỐ</th>
                                <th className="py-3 px-4 text-center">STC</th>
                                <th className="py-3 px-4 text-center">SỐ GIỜ</th>
                                <th className="py-3 px-4">PHÒNG / XƯỞNG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {dsLopPhanCong.map((row, index) => (
                                <tr key={index} className="hover:bg-blue-50/40 transition">
                                    <td className="py-3.5 px-4 text-slate-500 font-bold">{index + 1}</td>
                                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.MA_MH}</td>
                                    <td className="py-3.5 px-4 font-bold text-blue-700">{row.TEN_MH}</td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.LOP}</td>
                                    <td className="py-3.5 px-4 text-center">{row.SI_SO}</td>
                                    <td className="py-3.5 px-4 text-center">{row.STC}</td>
                                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{row.SO_GIO} giờ</td>
                                    <td className="py-3.5 px-4 font-medium text-slate-600">{row.PHONG}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default XemDinhMucGioGiang;