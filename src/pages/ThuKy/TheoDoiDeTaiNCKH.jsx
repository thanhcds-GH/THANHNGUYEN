import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosClient';
import * as XLSX from 'xlsx';

const TheoDoiDeTaiNCKH = () => {
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : { 
        MADN: 'GV025', 
        HOTEN: 'Lê Đức An', 
        role: 'Thư ký' 
    };

    const currentMaGV = currentUser.MADN || currentUser.username || 'GV025';
    const danhSachTrangThai = ['Chờ phê duyệt', 'Đạt yêu cầu', 'Không đạt yêu cầu'];

    const [danhSachDeTai, setDanhSachDeTai] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterNamHoc, setFilterNamHoc] = useState('2026-2027');
    const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');

    // 1. Tải toàn bộ danh sách đề tài NCKH toàn khoa từ Backend (ĐÃ CHUẨN HÓA: /api/nckh/danh-sach)
    const fetchDanhSachToanKhoa = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/nckh/danh-sach', {
                params: {
                    namHoc: filterNamHoc,
                    trangThai: filterTrangThai
                }
            });

            if (response.data && response.data.success) {
                setDanhSachDeTai(response.data.data || []);
            }
        } catch (err) {
            console.error('Lỗi khi nạp danh sách NCKH toàn khoa:', err);
        } finally {
            setLoading(false);
        }
    }, [filterNamHoc, filterTrangThai]);

    useEffect(() => {
        fetchDanhSachToanKhoa();
    }, [fetchDanhSachToanKhoa]);

    // 2. Cập nhật kết quả thẩm định trực tiếp vào CSDL (ĐÃ CHUẨN HÓA: /api/nckh/cap-nhat-trang-thai/${id})
    const handleCapNhatTrangThai = async (id, newStatus) => {
        try {
            const response = await api.put(`/api/nckh/cap-nhat-trang-thai/${id}`, {
                TRANG_THAI: newStatus,
                NGUOI_DUYET: currentMaGV
            });

            if (response.data && response.data.success) {
                setDanhSachDeTai(prev => prev.map(item => 
                    item.ID === id ? { ...item, TRANG_THAI: newStatus } : item
                ));
            } else {
                alert(`Lỗi cập nhật: ${response.data.message || 'Thao tác không thành công'}`);
            }
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái thẩm định:', err);
            const msg = err.response?.data?.message || err.message;
            alert(`Không thể kết nối máy chủ: ${msg}`);
        }
    };

    // 3. Tính năng Xuất File Excel
    const handleExportExcel = () => {
        if (danhSachDeTai.length === 0) {
            alert('Không có dữ liệu để xuất file Excel!');
            return;
        }

        const dataToExport = danhSachDeTai.map((item, index) => ({
            'STT': index + 1,
            'Tên Đề Tài / Công Trình': item.TEN_DE_TAI,
            'Tác Giả / Nhóm Tác Giả': item.TAC_GIA,
            'Giảng Viên Khai Báo': `${item.TEN_GIANGVIEN} (${item.MA_GIANGVIEN})`,
            'Loại Đề Tài': item.LOAI_DE_TAI,
            'Cấp Đề Tài': item.CAP_DE_TAI,
            'Vai Trò': item.VAI_TRO,
            'Số Giờ Quy Đổi': item.SO_GIO_QUY_DOI,
            'Năm Học': item.NAM_HOC,
            'Kết Quả Thẩm Định': item.TRANG_THAI
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_DeTai_NCKH');

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 45 },
            { wch: 35 },
            { wch: 25 },
            { wch: 22 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 },
            { wch: 12 },
            { wch: 20 }
        ];

        XLSX.writeFile(workbook, `Bao_Cao_NCKH_${filterNamHoc}_KhoaDienTuTinHoc.xlsx`);
    };

    // 4. In Báo Cáo Thẩm Định
    const handlePrintPDF = () => {
        window.print();
    };

    const renderBadgeTrangThai = (trangThai) => {
        switch (trangThai) {
            case 'Đạt yêu cầu':
                return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
            case 'Không đạt yêu cầu':
                return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Đồng bộ */}
                <div className="bg-[#3B82F6] rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between border-b border-blue-400 gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-[#FFD700] tracking-wide uppercase">
                            THEO DÕI & PHÊ DUYỆT ĐỀ TÀI NGHIÊN CỨU KHOA HỌC TOÀN KHOA
                        </h2>
                        <p className="text-xs text-blue-100 font-semibold mt-1">
                            Người thẩm định: <span className="text-white font-bold">{currentUser.HOTEN || currentUser.name}</span> ({currentMaGV}) 
                            <span className="ml-2 px-2.5 py-0.5 rounded bg-blue-700 text-[#FFD700] font-bold border border-blue-400">
                                Vai trò: Thư ký khoa
                            </span>
                        </p>
                    </div>

                    {/* Nút Xuất Báo Cáo Excel & PDF */}
                    <div className="flex items-center gap-2 print:hidden">
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>📊</span>
                            <span>Xuất File Excel</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrintPDF}
                            className="bg-slate-800 hover:bg-slate-900 text-[#FFD700] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>🖨️</span>
                            <span>In / Xuất PDF</span>
                        </button>
                    </div>
                </div>

                {/* Bảng Quản lý và Thẩm định */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                                DANH SÁCH ĐỀ TÀI NCKH CẦN PHÊ DUYỆT
                            </span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                Tổng: {danhSachDeTai.length} đề tài
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                            <select
                                value={filterNamHoc}
                                onChange={(e) => setFilterNamHoc(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                            >
                                <option value="2026-2027">Năm học 2026-2027</option>
                                <option value="2025-2026">Năm học 2025-2026</option>
                                <option value="2024-2025">Năm học 2024-2025</option>
                            </select>

                            <select
                                value={filterTrangThai}
                                onChange={(e) => setFilterTrangThai(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                            >
                                <option value="Tất cả">-- Tất cả trạng thái --</option>
                                {danhSachTrangThai.map((st, idx) => (
                                    <option key={idx} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4 text-center">STT</th>
                                    <th className="py-3 px-4">TÊN ĐỀ TÀI / CÔNG TRÌNH</th>
                                    <th className="py-3 px-4">TÁC GIẢ / NHÓM TÁC GIẢ</th>
                                    <th className="py-3 px-4">GIẢNG VIÊN ĐĂNG KÝ</th>
                                    <th className="py-3 px-4">LOẠI ĐỀ TÀI</th>
                                    <th className="py-3 px-4 text-center">CẤP ĐỀ TÀI</th>
                                    <th className="py-3 px-4 text-center">VAI TRÒ</th>
                                    <th className="py-3 px-4 text-center">GIỜ QUY ĐỔI</th>
                                    <th className="py-3 px-4 text-center">NĂM HỌC</th>
                                    <th className="py-3 px-4 text-center min-w-44">HỘI ĐỒNG THẨM ĐỊNH</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="py-8 text-center text-slate-400">
                                            Đang đồng bộ danh sách đề tài toàn khoa từ SQL Server...
                                        </td>
                                    </tr>
                                ) : danhSachDeTai.length > 0 ? (
                                    danhSachDeTai.map((row, index) => (
                                        <tr key={row.ID || index} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3.5 px-4 text-slate-500 font-bold text-center">{index + 1}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{row.TEN_DE_TAI}</td>
                                            <td className="py-3.5 px-4 font-semibold text-blue-700">{row.TAC_GIA || '---'}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-800">{row.TEN_GIANGVIEN}</span>
                                                <span className="text-[10px] text-slate-500 block">({row.MA_GIANGVIEN})</span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                                    {row.LOAI_DE_TAI}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">{row.CAP_DE_TAI}</td>
                                            <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{row.VAI_TRO}</td>
                                            <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{row.SO_GIO_QUY_DOI} giờ</td>
                                            <td className="py-3.5 px-4 text-center">{row.NAM_HOC}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <select
                                                    value={row.TRANG_THAI || 'Chờ phê duyệt'}
                                                    onChange={(e) => handleCapNhatTrangThai(row.ID, e.target.value)}
                                                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none shadow-sm cursor-pointer ${renderBadgeTrangThai(row.TRANG_THAI)}`}
                                                >
                                                    {danhSachTrangThai.map((st, sIdx) => (
                                                        <option key={sIdx} value={st} className="bg-white text-slate-800 font-semibold">
                                                            {st === 'Đạt yêu cầu' ? '★ Đạt yêu cầu' : 
                                                             st === 'Không đạt yêu cầu' ? '✕ Không đạt yêu cầu' : '⏳ Chờ phê duyệt'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                                            Không có đề tài NCKH nào phù hợp với bộ lọc hiện tại.
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

export default TheoDoiDeTaiNCKH;