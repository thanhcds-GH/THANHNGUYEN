import React, { useState } from 'react';

const TheoDoiDinhMucGioGiang = () => {
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : {
        MADN: 'GV018',
        HOTEN: 'Trần Hiếu Nghĩa',
        role: 'Trưởng khoa'
    };

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

    // Dữ liệu mô phỏng chuẩn
    const databasePhanCong = {
        'GV001': {
            hoten: 'Nguyễn Lê Ngọc Thành',
            gioNCKH: 84,
            monHoc: [
                { id: 1, maMH: 'CNTT5D2508', tenMH: 'Lập trình C', lop: 'CĐK20 CNTT A', siSo: 27, stc: 3, soGio: 75, phong: 'P.303' },
                { id: 2, maMH: 'CNTT5H2511', tenMH: 'Cơ sở dữ liệu', lop: 'CĐK20 CNTT B', siSo: 21, stc: 3, soGio: 45, phong: 'P.306' },
                { id: 3, maMH: '5H05', tenMH: 'Tin học', lop: 'CĐK20 ĐTCN C', siSo: 28, stc: 3, soGio: 75, phong: 'P.303' },
                { id: 4, maMH: 'CNTT4D2516', tenMH: 'Quản trị cơ sở dữ liệu với SQL Server', lop: 'TCK19 CNTT A', siSo: 19, stc: 3, soGio: 75, phong: 'P.306' }
            ]
        },
        'GV003': {
            hoten: 'Nguyễn Văn Đại',
            gioNCKH: 84,
            monHoc: [
                { id: 1, maMH: 'CNTT5D2501', tenMH: 'Kiến trúc máy tính & Vi xử lý', lop: 'CĐK20 CNTT A', siSo: 25, stc: 3, soGio: 60, phong: 'P.301' },
                { id: 2, maMH: 'CNTT5D2502', tenMH: 'Thiết kế Vi mạch số', lop: 'CĐK20 CNTT B', siSo: 24, stc: 4, soGio: 90, phong: 'P.Lab 02' }
            ]
        },
        'GV004': {
            hoten: 'Đinh Thị Thu',
            gioNCKH: 84,
            monHoc: [
                { id: 1, maMH: 'CNTT5D2521', tenMH: 'Xử lý ngôn ngữ tự nhiên với AI', lop: 'CĐK19 CNTT A', siSo: 35, stc: 2, soGio: 45, phong: 'P.Lab 01' },
                { id: 2, maMH: 'CNTT5D2518', tenMH: 'Thiết kế và lập trình website', lop: 'CĐK19 CNTT B', siSo: 31, stc: 3, soGio: 75, phong: 'P.Lab 01' },
                { id: 3, maMH: 'CNTT5D2521', tenMH: 'Xử lý ngôn ngữ tự nhiên với AI', lop: 'CĐK19 CNTT B', siSo: 31, stc: 2, soGio: 45, phong: 'P.Lab 01' },
                { id: 4, maMH: 'CNTT5D2513', tenMH: 'Thiết kế đồ họa', lop: 'CĐK20 CNTT A', siSo: 27, stc: 2, soGio: 45, phong: 'P.304' },
                { id: 5, maMH: 'MĐ 10', tenMH: 'Quản trị cơ sở dữ liệu với SQL Server', lop: 'CĐLT K20 CNTT', siSo: 25, stc: 2, soGio: 45, phong: 'P.306' },
                { id: 6, maMH: 'CNTT5D2513', tenMH: 'Thiết kế đồ họa', lop: 'CĐK20 CNTT B', siSo: 21, stc: 2, soGio: 45, phong: 'P.304' }
            ]
        },
        'GV014': {
            hoten: 'Huỳnh Thị Hồng Sinh',
            gioNCKH: 84,
            monHoc: [
                { id: 1, maMH: 'CNTT5D2517', tenMH: 'Lập trình C#.NET', lop: 'CĐK19 CNTT B', siSo: 31, stc: 3, soGio: 75, phong: 'P.305' },
                { id: 2, maMH: 'CNTT5D2505', tenMH: 'Tin học', lop: 'CĐK20 CNTT B', siSo: 24, stc: 3, soGio: 75, phong: 'P.305' }
            ]
        },
        'GV018': {
            hoten: 'Trần Hiếu Nghĩa',
            gioNCKH: 84,
            monHoc: [
                { id: 1, maMH: 'MĐ 22', tenMH: 'Lắp đặt mạng truyền thông công nghiệp', lop: 'CĐK18 ĐTCN A', siSo: 22, stc: 2, soGio: 45, phong: 'Xưởng ĐTCN' },
                { id: 2, maMH: 'ĐTCN5D2516', tenMH: 'Lắp đặt, bảo trì hệ thống điều khiển', lop: 'CĐK19 ĐTCN A', siSo: 29, stc: 3, soGio: 75, phong: 'Xưởng ĐTCN' },
                { id: 3, maMH: 'ĐTCN5D2516', tenMH: 'Lắp đặt, bảo trì hệ thống điều khiển', lop: 'CĐK19 ĐTCN B', siSo: 31, stc: 3, soGio: 75, phong: 'Xưởng ĐTCN' },
                { id: 4, maMH: 'ĐTCNCLC5D2518', tenMH: 'Lắp đặt, bảo trì hệ thống điều khiển', lop: 'CĐK19 ĐTCN CLC', siSo: 27, stc: 3, soGio: 75, phong: 'Xưởng ĐTCN' },
                { id: 5, maMH: 'ĐTCN4D2518', tenMH: 'Lắp đặt, bảo trì hệ thống điều khiển', lop: 'TCK19 ĐTCN A', siSo: 12, stc: 3, soGio: 75, phong: 'Xưởng ĐTCN' }
            ]
        }
    };

    const gvData = databasePhanCong[selectedMaGV] || {
        hoten: danhSachGiangVien.find(g => g.MADN === selectedMaGV)?.HOTEN || 'Giảng viên',
        gioNCKH: 0,
        monHoc: []
    };

    const dinhMucHocKy = 224;
    const tongGioDay = gvData.monHoc.reduce((sum, item) => sum + item.soGio, 0);
    const phanTramDat = Math.round((tongGioDay / dinhMucHocKy) * 100);

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
                            <span className="text-3xl font-black text-indigo-600">{gvData.gioNCKH}</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">/ 84 giờ</span>
                        </div>
                        <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                                gvData.gioNCKH >= 84 ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {gvData.gioNCKH >= 84 ? 'Đã hoàn thành chỉ tiêu NCKH' : 'Chưa đủ chỉ tiêu NCKH'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bảng Chi tiết */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                            CHI TIẾT PHÂN CÔNG - {gvData.hoten.toUpperCase()} ({selectedMaGV})
                        </span>
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                            Tổng: {tongGioDay} giờ
                        </span>
                    </div>

                    <div className="overflow-x-auto">
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
                                {gvData.monHoc.length > 0 ? (
                                    gvData.monHoc.map((row, index) => (
                                        <tr key={row.id || index} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3.5 px-4 text-slate-500 font-bold text-center">{index + 1}</td>
                                            <td className="py-3.5 px-4 font-black text-slate-900">{row.maMH}</td>
                                            <td className="py-3.5 px-4 font-bold text-blue-700">{row.tenMH}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-800">{row.lop}</td>
                                            <td className="py-3.5 px-4 text-center">{row.siSo}</td>
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">{row.stc}</td>
                                            <td className="py-3.5 px-4 text-center font-black text-blue-600">{row.soGio} giờ</td>
                                            <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{row.phong || 'Chưa xếp'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                                            Giảng viên chưa được phân công môn học trong học kỳ này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TheoDoiDinhMucGioGiang;