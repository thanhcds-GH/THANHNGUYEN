import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosClient';

const NhapDeTaiNCKH = () => {
    // 1. Lấy thông tin tài khoản đăng nhập hiện tại
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : { 
        MADN: 'GV001', 
        HOTEN: 'Nguyễn Lê Ngọc Thành',
        role: 'GIANG_VIEN'
    };

    const currentMaGV = currentUser.MADN || currentUser.username || currentUser.MA_GIANGVIEN || 'GV001';
    const currentTenGV = currentUser.HOTEN || currentUser.name || 'Giảng viên';

    // Bảng quy đổi giờ chuẩn theo Loại đề tài
    const bangQuyDoiGio = {
        'Nghiên cứu khoa học': 84,
        'Sáng kiến kinh nghiệm': 84,
        'Thực tế Doanh nghiệp': 56
    };

    const danhSachTrangThai = [
        'Chờ phê duyệt',
        'Đạt yêu cầu',
        'Không đạt yêu cầu'
    ];

    const [danhSachDeTai, setDanhSachDeTai] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        TEN_DE_TAI: '',
        TAC_GIA: currentTenGV,
        LOAI_DE_TAI: 'Nghiên cứu khoa học',
        CAP_DE_TAI: 'Cấp Trường',
        VAI_TRO: 'Chủ nhiệm đề tài',
        SO_GIO_QUY_DOI: 84,
        NAM_HOC: '2026-2027',
        GHI_CHU: ''
    });

    const [filterNamHoc, setFilterNamHoc] = useState('2026-2027');
    const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');

    // 2. Nạp dữ liệu trực tiếp từ Backend CSDL SQL Server (ĐÃ CHUẨN HÓA /api/nckh/danh-sach)
    const fetchDanhSachDeTai = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/nckh/danh-sach', {
                params: {
                    maGiangVien: currentMaGV,
                    namHoc: filterNamHoc,
                    trangThai: filterTrangThai
                }
            });

            if (response.data && response.data.success) {
                setDanhSachDeTai(response.data.data || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đề tài NCKH:', err);
        } finally {
            setLoading(false);
        }
    }, [currentMaGV, filterNamHoc, filterTrangThai]);

    useEffect(() => {
        fetchDanhSachDeTai();
    }, [fetchDanhSachDeTai]);

    // Tự động nhảy giờ khi thay đổi Loại đề tài
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'LOAI_DE_TAI') {
            const gioTuDong = bangQuyDoiGio[value] || 84;
            setFormData(prev => ({
                ...prev,
                LOAI_DE_TAI: value,
                SO_GIO_QUY_DOI: gioTuDong
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // 3. Lưu dữ liệu trực tiếp vào SQL Server qua API Backend (ĐÃ CHUẨN HÓA /api/nckh/luu)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.TEN_DE_TAI.trim()) {
            alert('Vui lòng nhập tên đề tài / sáng kiến kinh nghiệm!');
            return;
        }
        if (!formData.TAC_GIA.trim()) {
            alert('Vui lòng nhập họ tên tác giả hoặc nhóm tác giả!');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                MA_GIANGVIEN: currentMaGV,
                TEN_DE_TAI: formData.TEN_DE_TAI.trim(),
                SO_GIO_QUY_DOI: formData.SO_GIO_QUY_DOI,
                NAM_HOC: formData.NAM_HOC,
                TAC_GIA: formData.TAC_GIA.trim(),
                LOAI_DE_TAI: formData.LOAI_DE_TAI,
                CAP_DE_TAI: formData.CAP_DE_TAI,
                VAI_TRO: formData.VAI_TRO
            };

            const response = await api.post('/api/nckh/luu', payload);

            if (response.data && response.data.success) {
                alert(`🎉 Đã lưu thành công đề tài [${formData.TEN_DE_TAI}] vào hệ thống CSDL!`);
                
                // Reset ô nhập tên đề tài
                setFormData(prev => ({
                    ...prev,
                    TEN_DE_TAI: '',
                    GHI_CHU: ''
                }));

                // Đồng bộ tải lại danh sách mới nhất từ Database
                fetchDanhSachDeTai();
            } else {
                alert(`Lỗi lưu dữ liệu: ${response.data.message || 'Không xác định'}`);
            }
        } catch (err) {
            console.error('Lỗi khi lưu đề tài NCKH:', err);
            const msg = err.response?.data?.message || err.message;
            alert(`Không thể kết nối đến máy chủ: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
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
                
                {/* Header Phân hệ */}
                <div className="bg-[#3B82F6] rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between border-b border-blue-400 gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-[#FFD700] tracking-wide uppercase">
                            KHAI BÁO & THEO DÕI ĐỀ TÀI NGHIÊN CỨU KHOA HỌC
                        </h2>
                        <p className="text-xs text-blue-100 font-semibold mt-1">
                            Người thao tác: <span className="text-white font-bold">{currentTenGV}</span> ({currentMaGV}) 
                            <span className="ml-2 px-2.5 py-0.5 rounded bg-blue-700 text-[#FFD700] font-bold border border-blue-400">
                                Vai trò: {currentUser.role || 'GIANG_VIEN'}
                            </span>
                        </p>
                    </div>
                </div>

                {/* FORM NHẬP ĐỀ TÀI */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            NHẬP THÔNG TIN ĐỀ TÀI MỚI
                        </h3>
                    </div>

                    {/* Hàng 1: Tên đề tài */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            TÊN ĐỀ TÀI / SÁNG KIẾN KINH NGHIỆM (*)
                        </label>
                        <input
                            type="text"
                            name="TEN_DE_TAI"
                            value={formData.TEN_DE_TAI}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên đề tài NCKH, sáng kiến kinh nghiệm hoặc thực tế doanh nghiệp..."
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Hàng 2: Tác giả / Nhóm tác giả */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            HỌ TÊN TÁC GIẢ (HOẶC NHÓM TÁC GIẢ) (*)
                        </label>
                        <input
                            type="text"
                            name="TAC_GIA"
                            value={formData.TAC_GIA}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Nguyễn Lê Ngọc Thành (Chủ nhiệm), Lê Thị Kim Oanh..."
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Hàng 3: Các thông số chi tiết */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                LOẠI ĐỀ TÀI (*)
                            </label>
                            <select
                                name="LOAI_DE_TAI"
                                value={formData.LOAI_DE_TAI}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                            >
                                <option value="Nghiên cứu khoa học">Nghiên cứu khoa học (84h)</option>
                                <option value="Sáng kiến kinh nghiệm">Sáng kiến kinh nghiệm (84h)</option>
                                <option value="Thực tế Doanh nghiệp">Thực tế Doanh nghiệp (56h)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                CẤP ĐỀ TÀI (*)
                            </label>
                            <select
                                name="CAP_DE_TAI"
                                value={formData.CAP_DE_TAI}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                            >
                                <option value="Cấp Khoa">Cấp Khoa</option>
                                <option value="Cấp Trường">Cấp Trường</option>
                                <option value="Cấp Tỉnh/Bộ">Cấp Tỉnh / Bộ</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                VAI TRÒ (*)
                            </label>
                            <select
                                name="VAI_TRO"
                                value={formData.VAI_TRO}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                            >
                                <option value="Chủ nhiệm đề tài">Chủ nhiệm đề tài</option>
                                <option value="Thành viên tham gia">Thành viên tham gia</option>
                                <option value="Đồng tác giả">Đồng tác giả</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                GIỜ QUY ĐỔI (*)
                            </label>
                            <input
                                type="number"
                                name="SO_GIO_QUY_DOI"
                                value={formData.SO_GIO_QUY_DOI}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50/50 focus:outline-none focus:border-blue-500 shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                NĂM HỌC (*)
                            </label>
                            <select
                                name="NAM_HOC"
                                value={formData.NAM_HOC}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                            >
                                <option value="2026-2027">2026-2027</option>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2024-2025">2024-2025</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-md transition transform active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                        >
                            {isSubmitting ? 'Đang lưu vào CSDL...' : 'Lưu Đề Tài NCKH'}
                        </button>
                    </div>
                </form>

                {/* BẢNG DATAGRIDVIEW LIỆT KÊ ĐỀ TÀI ĐÃ ĐĂNG KÝ */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
                    <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                                DANH SÁCH ĐỀ TÀI ĐÃ ĐĂNG KÝ
                            </span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                Tổng: {danhSachDeTai.length} đề tài
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
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
                                    <th className="py-3 px-4">LOẠI ĐỀ TÀI</th>
                                    <th className="py-3 px-4 text-center">CẤP ĐỀ TÀI</th>
                                    <th className="py-3 px-4 text-center">VAI TRÒ</th>
                                    <th className="py-3 px-4 text-center">GIỜ QUY ĐỔI</th>
                                    <th className="py-3 px-4 text-center">NĂM HỌC</th>
                                    <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-slate-400">
                                            Đang nạp dữ liệu đề tài từ SQL Server...
                                        </td>
                                    </tr>
                                ) : danhSachDeTai.length > 0 ? (
                                    danhSachDeTai.map((row, index) => (
                                        <tr key={row.ID || index} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3.5 px-4 text-slate-500 font-bold text-center">{index + 1}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{row.TEN_DE_TAI}</td>
                                            <td className="py-3.5 px-4 font-semibold text-blue-700">{row.TAC_GIA || '---'}</td>
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
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${renderBadgeTrangThai(row.TRANG_THAI)}`}>
                                                    {row.TRANG_THAI || 'Chờ phê duyệt'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                                            Chưa có đề tài nào phù hợp với bộ lọc hiện tại.
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

export default NhapDeTaiNCKH;