import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';

const ModalTrieuTap = ({ isOpen, onClose, congVanData, onRefresh }) => {
    const [formData, setFormData] = useState({
        TEN_HOAT_DONG: '',
        NGAY_TO_CHUC: '',
        BUOI_TRIEU_TAP: 'Sáng',
        GIO_BAT_DAU: '08h00',
        DIA_DIEM: 'Hội trường 350 chỗ',
        NAM_HOC: '2026-2027',
        NGUOI_CHU_TRI: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chỉ đồng bộ dữ liệu vào Form khi Modal bắt đầu mở ra (isOpen = true)
    useEffect(() => {
        if (isOpen && congVanData) {
            setFormData({
                TEN_HOAT_DONG: `Hội nghị triển khai văn bản: ${congVanData.TEN_CONGVAN || ''}`,
                NGAY_TO_CHUC: new Date().toISOString().split('T')[0],
                BUOI_TRIEU_TAP: 'Sáng',
                GIO_BAT_DAU: '08h00',
                DIA_DIEM: 'Hội trường 350 chỗ',
                NAM_HOC: '2026-2027',
                NGUOI_CHU_TRI: ''
            });
        }
    }, [isOpen]); // Loại bỏ congVanData khỏi dependency để chống lặp render khi click chuột

    if (!isOpen || !congVanData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const submitData = { ...formData, MA_CONGVAN: congVanData.MA_CONGVAN };
            
            const response = await api.post('/api/trieu-tap/luu-va-dong-bo', submitData);
            if (response.status === 200 || response.status === 201) {
                alert('Tạo hoạt động triệu tập và đồng bộ danh sách điểm danh thành công!');
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Gặp lỗi hệ thống khi đồng bộ dữ liệu!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={onClose} // Bấm vào vùng mờ bên ngoài sẽ đóng Modal
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden transform transition-all relative z-10"
                onClick={(e) => e.stopPropagation()} // Chặn sự kiện click nổi bọt ra ngoài gây lag form
            >
                {/* Header Form */}
                <div className="bg-blue-600 px-6 py-5 relative text-center">
                    <h3 className="text-lg font-extrabold uppercase tracking-widest text-[#FFD700]">
                        Triệu tập theo kế hoạch
                    </h3>
                    <p className="text-[11px] text-blue-100 mt-1 font-medium opacity-90">
                        Văn bản liên kết: {congVanData.SO_KIEU_HIEU || congVanData.SO_KY_HIEU}
                    </p>
                    
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tên hoạt động triệu tập (*)</label>
                        <textarea
                            name="TEN_HOAT_DONG"
                            rows="2"
                            required
                            value={formData.TEN_HOAT_DONG}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-800 resize-none"
                        />
                    </div>

                    {/* HÀNG 1: NGÀY TỔ CHỨC & BUỔI TRIỆU TẬP */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ngày tổ chức (*)</label>
                            <input
                                type="date"
                                name="NGAY_TO_CHUC"
                                required
                                value={formData.NGAY_TO_CHUC}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Buổi triệu tập (*)</label>
                            <select
                                name="BUOI_TRIEU_TAP"
                                value={formData.BUOI_TRIEU_TAP}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700 bg-white"
                            >
                                <option value="Sáng">Sáng</option>
                                <option value="Chiều">Chiều</option>
                                <option value="Tối">Tối</option>
                            </select>
                        </div>
                    </div>

                    {/* HÀNG 2: GIỜ BẮT ĐẦU & ĐỊA ĐIỂM */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Giờ bắt đầu (*)</label>
                            <input
                                type="text"
                                name="GIO_BAT_DAU"
                                required
                                placeholder="Ví dụ: 08h00"
                                value={formData.GIO_BAT_DAU}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Địa điểm tổ chức (*)</label>
                            <input
                                type="text"
                                name="DIA_DIEM"
                                required
                                value={formData.DIA_DIEM}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    {/* HÀNG 3: NĂM HỌC & NGƯỜI CHỦ TRÌ */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Năm học (*)</label>
                            <input
                                type="text"
                                name="NAM_HOC"
                                required
                                value={formData.NAM_HOC}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Người chủ trì (*)</label>
                            <input
                                type="text"
                                name="NGUOI_CHU_TRI"
                                required
                                placeholder="Họ tên giảng viên chủ trì"
                                value={formData.NGUOI_CHU_TRI}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Nút bấm thao tác */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2 rounded-xl transition shadow-sm disabled:opacity-70"
                        >
                            {isSubmitting ? 'Đang bóc tách và đồng bộ...' : 'Xác nhận Triệu tập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalTrieuTap;