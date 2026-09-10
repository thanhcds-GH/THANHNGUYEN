import React, { useState } from 'react';
import api from '../api/axiosClient';

const ModalThemCongVan = ({ isOpen, onClose, onRefresh }) => {
    // CHUẨN HÓA STATE: Khớp hoàn toàn các trường dữ liệu với Backend
    const [formData, setFormData] = useState({
        SO_KIEU_HIEU: '',
        LOAI_CV: 'Den',
        TEN_CONGVAN: '',
        NOI_GURI_NHAN: '',
        NGUOI_KY_DUYET: '',
        NGAY_TIEP_NHAN: new Date().toISOString().split('T')[0],
        HAN_GIAI_QUYET: ''
    });

    // State quản lý file PDF được chọn
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý khi chọn file PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra định dạng PDF
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                alert('Hệ thống chỉ chấp nhận tệp văn bản định dạng .PDF!');
                e.target.value = '';
                setSelectedFile(null);
                return;
            }
            // Giới hạn kích thước tệp tối đa (20MB)
            if (file.size > 20 * 1024 * 1024) {
                alert('Dung lượng tệp PDF vượt quá giới hạn 20MB. Vui lòng chọn tệp nhỏ hơn!');
                e.target.value = '';
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };

    // Xử lý gửi dữ liệu lên Backend qua FormData
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // Đóng gói dữ liệu dạng Multipart Form Data
            const submitData = new FormData();
            
            // Đảm bảo tên trường tệp khớp với upload.single('filePdf') ở backend
            if (selectedFile) {
                submitData.append('filePdf', selectedFile);
            }
            
            // Thêm các trường dữ liệu biểu mẫu
            submitData.append('SO_KIEU_HIEU', formData.SO_KIEU_HIEU);
            submitData.append('LOAI_CV', formData.LOAI_CV);
            submitData.append('TEN_CONGVAN', formData.TEN_CONGVAN);
            submitData.append('NOI_GURI_NHAN', formData.NOI_GURI_NHAN);
            submitData.append('NGUOI_KY_DUYET', formData.NGUOI_KY_DUYET);
            submitData.append('NGAY_TIEP_NHAN', formData.NGAY_TIEP_NHAN);
            submitData.append('HAN_GIAI_QUYET', formData.HAN_GIAI_QUYET || '');

            // Ghi đè Content-Type để kích hoạt boundary multipart cho file upload
            const response = await api.post('/api/documents', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert('Tiếp nhận và lưu trữ công văn kèm tệp thành công!');
                setSelectedFile(null);
                onRefresh(); // Làm mới danh sách công văn
                onClose();   // Đóng modal
            }
        } catch (error) {
            console.error("Lỗi lưu công văn:", error);
            alert(error.response?.data?.message || 'Gặp lỗi khi lưu dữ liệu công văn mới!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
                
                {/* HEADER FORM */}
                <div className="bg-blue-600 px-6 py-5 relative text-center">
                    <h3 className="text-xl font-extrabold uppercase tracking-widest text-[#FFD700]">
                        Tiếp nhận và lưu trữ công văn mới
                    </h3>
                    
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* BODY FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                    
                    {/* Hàng 1: Số ký hiệu & Loại công văn */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">SỐ / KÝ HIỆU (*)</label>
                            <input
                                type="text"
                                name="SO_KIEU_HIEU"
                                required
                                value={formData.SO_KIEU_HIEU}
                                onChange={handleChange}
                                placeholder="Ví dụ: 492 / TB-CĐKTCNQN"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">LOẠI CÔNG VĂN</label>
                            <select
                                name="LOAI_CV"
                                value={formData.LOAI_CV}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700 bg-white"
                            >
                                <option value="Den">Công văn Đến</option>
                                <option value="Di">Công văn Đi</option>
                            </select>
                        </div>
                    </div>

                    {/* Hàng 2: Trích yếu nội dung */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">TRÍCH YẾU NỘI DUNG (*)</label>
                        <textarea
                            name="TEN_CONGVAN"
                            rows="3"
                            required
                            value={formData.TEN_CONGVAN}
                            onChange={handleChange}
                            placeholder="Nhập trích yếu nội dung công văn..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-800 resize-none"
                        />
                    </div>

                    {/* Hàng 3: Cơ quan gửi/đến & Người ký ban hành */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">CƠ QUAN GỬI ĐẾN (*)</label>
                            <input
                                type="text"
                                name="NOI_GURI_NHAN"
                                required
                                value={formData.NOI_GURI_NHAN}
                                onChange={handleChange}
                                placeholder="Ví dụ: Ban Giám Hiệu"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">NGƯỜI KÝ BAN HÀNH (*)</label>
                            <input
                                type="text"
                                name="NGUOI_KY_DUYET"
                                required
                                value={formData.NGUOI_KY_DUYET}
                                onChange={handleChange}
                                placeholder="Ví dụ: Hiệu trưởng"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Hàng 4: Ngày tiếp nhận & Hạn xử lý */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">NGÀY TIẾP NHẬN / BAN HÀNH (*)</label>
                            <input
                                type="date"
                                name="NGAY_TIEP_NHAN"
                                required
                                value={formData.NGAY_TIEP_NHAN}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">HẠN XỬ LÝ / GIẢI QUYẾT (NẾU CÓ)</label>
                            <input
                                type="date"
                                name="HAN_GIAI_QUYET"
                                value={formData.HAN_GIAI_QUYET}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Hàng 5: Đính kèm tệp văn bản gốc (PDF) */}
                    <div className="space-y-1 pt-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>ĐÍNH KÈM TỆP VĂN BẢN GỐC (PDF)</span>
                            <span className="text-[11px] font-normal text-slate-400">Tối đa 20MB</span>
                        </label>
                        <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                        </div>
                        {selectedFile && (
                            <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 mt-1">
                                <span className="truncate max-w-100">
                                    ✓ Đã chọn: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-slate-400 hover:text-red-500 font-bold ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold px-8 py-2 rounded-xl transition shadow-md shadow-blue-200 active:scale-95 flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            )}
                            {isSubmitting ? 'Đang trích xuất & lưu...' : 'Lưu CSDL'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalThemCongVan;