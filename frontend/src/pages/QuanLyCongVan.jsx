import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../api/axiosClient';
import ModalThemCongVan from '../components/ModalThemCongVan';
import ModalTrieuTap from '../components/ModalTrieuTap';

const QuanLyCongVan = () => {
    const navigate = useNavigate();
    const [danhSachCV, setDanhSachCV] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ==========================================
    // STATE TÌM KIẾM VÀ BỘ LỌC CÔNG VĂN
    // ==========================================
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [searchInContent, setSearchInContent] = useState(false);

    // State theo dõi dòng nào đang được mở Dropdown Menu
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // State quản lý Modal Triệu tập
    const [isTrieuTapOpen, setIsTrieuTapOpen] = useState(false);
    const [selectedCV, setSelectedCV] = useState(null);

    // State quản lý Hộp thoại thông báo tùy biến
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: 'Thông báo',
        message: ''
    });

    // ==========================================
    // HÀM TẢI VÀ TÌM KIẾM CÔNG VĂN TỪ BACKEND
    // ==========================================
    const fetchDanhSachCongVan = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/api/documents', {
                params: {
                    keyword: searchTerm.trim(),
                    loaiCv: filterType,
                    searchInContent: searchInContent
                }
            });
            setDanhSachCV(response.data);
        } catch (err) {
            console.error("Lỗi tải danh sách công văn:", err);
            setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ để tải danh sách!');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterType, searchInContent]);

    // Tự động tìm kiếm với độ trễ (Debounce 350ms) khi nhập text hoặc đổi bộ lọc
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDanhSachCongVan();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [fetchDanhSachCongVan]);

    // Tự động đóng Dropdown menu khi bấm ra ngoài
    useEffect(() => {
        const handleOutsideClick = () => setOpenDropdownId(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    // Nghiệp vụ 1: Triển khai văn bản
    const handleTrienKhai = async (cv, e) => {
        e.stopPropagation();
        setOpenDropdownId(null);
        try {
            const response = await api.put(`/api/documents/${cv.MA_CONGVAN}/status`, {
                actionType: 'TRIEN_KHAI'
            });
            if (response.status === 200) {
                setAlertModal({
                    isOpen: true,
                    title: 'Thông báo triển khai',
                    message: `Hệ thống ghi nhận: Tiến hành chuyển tiếp và Triển khai nội dung Công văn số ${cv.SO_KIEU_HIEU} đến toàn bộ các tổ bộ môn nội bộ trong khoa.`
                });
                fetchDanhSachCongVan();
            }
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái triển khai:", err);
            setAlertModal({
                isOpen: true,
                title: 'Lỗi hệ thống',
                message: 'Không thể cập nhật trạng thái triển khai. Vui lòng kiểm tra lại kết nối Backend!'
            });
        }
    };

    // Nghiệp vụ 2: Mở modal Triệu tập giảng viên
    const handleOpenModalTrieuTap = (cv, e) => {
        e.stopPropagation();
        setSelectedCV(cv);
        setIsTrieuTapOpen(true);
        setOpenDropdownId(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* THANH BANNER TIÊU ĐỀ PHÂN HỆ */}
            <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-md">
                <h1 className="text-xl font-bold tracking-wide uppercase">Hệ thống Quản lý KPI Giảng viên</h1>
                <p className="text-xs text-blue-100 mt-1 opacity-90">
                    Phân hệ văn phòng khoa: Tiếp nhận Công văn & Giám sát các hoạt động Triệu tập hành chính (`CONG_VAN`)
                </p>
            </div>

            {/* KHU VỰC BỘ LỌC TÌM KIẾM NÂNG CAO & NÚT TIẾP NHẬN MỚI */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Danh mục hồ sơ Công văn quản lý</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Dữ liệu kết xuất đồng bộ từ cơ sở dữ liệu SQL Server</p>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition transform active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        + Tiếp Nhận Công Văn Mới
                    </button>
                </div>

                {/* THANH TÌM KIẾM & BỘ LỌC */}
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Ô nhập tìm kiếm */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo Số ký hiệu, Trích yếu nội dung hoặc Cơ quan..."
                            className="w-full pl-9 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Phân loại công văn */}
                    <div className="w-full md:w-48">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                        >
                            <option value="ALL">Tất cả loại văn bản</option>
                            <option value="Den">Công văn Đến</option>
                            <option value="Di">Công văn Đi</option>
                        </select>
                    </div>

                    {/* Checkbox tìm sâu trong nội dung file PDF */}
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition">
                        <input
                            type="checkbox"
                            checked={searchInContent}
                            onChange={(e) => setSearchInContent(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                            🔍 Tìm sâu trong nội dung file PDF
                        </span>
                    </label>
                </div>
            </div>

            {/* KHU VỰC BẢNG HIỂN THỊ DANH SÁCH DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-sm font-medium">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full mb-2" role="status"></div>
                        <p>Đang đồng bộ dữ liệu từ SQL Server...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 text-sm font-medium bg-red-50/50 m-4 rounded-xl border border-red-100">
                        ⚠️ Lỗi hệ thống: {error}. Vui lòng kiểm tra lại kết nối Backend!
                    </div>
                ) : danhSachCV.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">
                        {searchTerm ? 'Không tìm thấy hồ sơ công văn nào phù hợp với từ khóa.' : 'Hiện chưa có hồ sơ công văn nào được lưu trữ trong học kỳ này.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3.5 text-center w-12">Mã</th>
                                    <th className="px-4 py-3.5 w-36">Số / Ký hiệu</th>
                                    <th className="px-4 py-3.5 w-28">Phân loại</th>
                                    <th className="px-4 py-3.5">Trích yếu nội dung văn bản</th>
                                    <th className="px-4 py-3.5 w-24 text-center">Tệp gốc</th>
                                    <th className="px-4 py-3.5 w-36">Nơi gửi / Nơi nhận</th>
                                    <th className="px-4 py-3.5 w-28">Ngày nhận</th>
                                    <th className="px-4 py-3.5 w-48 text-center">Nghiệp vụ xử lý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {danhSachCV.map((cv) => (
                                    <tr key={cv.MA_CONGVAN} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-4 text-center font-semibold text-slate-400 text-xs">
                                            {cv.MA_CONGVAN}
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
                                            {cv.SO_KIEU_HIEU}
                                        </td>
                                        <td className="px-4 py-4">
                                            {cv.LOAI_CV === 'Den' ? (
                                                <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[11px] px-2.5 py-1 rounded-md font-semibold border border-amber-100">
                                                    ⬇️ CV Đến
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center bg-purple-50 text-purple-700 text-[11px] px-2.5 py-1 rounded-md font-semibold border border-purple-100">
                                                    ⬆️ CV Đi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-800 max-w-xs md:max-w-md truncate" title={cv.TEN_CONGVAN}>
                                            {cv.TEN_CONGVAN}
                                        </td>

                                        {/* CỘT TỆP ĐÍNH KÈM GỐC */}
                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            {cv.FILE_PATH ? (
                                                <a
                                                    href={`${BASE_URL}${cv.FILE_PATH}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition shadow-2xs"
                                                    title="Bấm vào để mở xem toàn văn tệp PDF gốc"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                    </svg>
                                                    Xem PDF
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-slate-300 italic">Không có file</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                            {cv.NOI_GURI_NHAN}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-mono text-slate-600">
                                            {cv.NGAY_TIEP_NHAN}
                                        </td>
                                        
                                        {/* CỘT LOGIC XỬ LÝ THEO TRẠNG THÁI HỆ THỐNG */}
                                        <td className="px-4 py-4 text-center relative">
                                            {cv.TRANG_THAI_CV === 'Đã triển khai' ? (
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1.5 rounded-xl font-bold border border-blue-100">
                                                    ✓ Đã triển khai
                                                </span>
                                            ) : cv.TRANG_THAI_CV === 'Đã triệu tập' || cv.TRANG_THAI_CV === 'Đã lên lịch họp' || cv.DA_LEN_LICH_TRIEU_TAP === 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/diem-danh-trieu-tap/${cv.MA_CONGVAN}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-sm animate-fade-in"
                                                    title="Bấm vào đây để mở phân hệ quản lý điểm danh giảng viên"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Đã lên lịch họp
                                                </button>
                                            ) : cv.LOAI_CV === 'Den' ? (
                                                <div className="inline-flex rounded-xl shadow-sm bg-blue-600" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleTrienKhai(cv, e)}
                                                        className="inline-flex items-center justify-center text-white text-[11px] font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-l-xl border-r border-blue-500/40 transition whitespace-nowrap"
                                                    >
                                                        Triển khai
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenDropdownId(openDropdownId === cv.MA_CONGVAN ? null : cv.MA_CONGVAN);
                                                        }}
                                                        className="inline-flex items-center justify-center px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-r-xl transition"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === cv.MA_CONGVAN && (
                                                        <div className="absolute right-5 mt-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-100 text-left">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleOpenModalTrieuTap(cv, e)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Triệu tập hoạt động
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleTrienKhai(cv, e)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-t border-slate-50 transition-colors"
                                                            >
                                                                🚀 Đánh dấu triển khai
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-medium italic">
                                                    Lưu hồ sơ khoa
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL 1: TIẾP NHẬN CÔNG VĂN MỚI */}
            <ModalThemCongVan
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchDanhSachCongVan}
            />

            {/* MODAL 2: TRIỆU TẬP HOẠT ĐỘNG */}
            {isTrieuTapOpen && (
                <ModalTrieuTap
                    isOpen={isTrieuTapOpen}
                    congVanData={selectedCV}
                    onClose={() => {
                        setIsTrieuTapOpen(false);
                        fetchDanhSachCongVan();
                    }}
                />
            )}

            {/* MODAL 3: HỘP THOẠI THÔNG BÁO TÙY BIẾN */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                            <span className="text-sm font-bold text-slate-700">{alertModal.title}</span>
                            <button 
                                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                            {alertModal.message}
                        </div>
                        <div className="bg-slate-50 px-4 py-2.5 flex justify-end border-t border-slate-100">
                            <button
                                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition active:scale-95"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyCongVan;