import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axiosClient';

const FormTrieuTapModal = ({ congVanLink, onClose }) => {
    // 1. Khởi tạo trạng thái dữ liệu biểu mẫu khớp chuẩn cấu trúc CSDL
    const [formData, setFormData] = useState({
        tenHoatDong: '',
        ngayToChuc: '2026-06-14', // Định dạng chuẩn YYYY-MM-DD cho input type="date" và SQL Datetime
        buoiTrieuTap: 'Buổi Sáng',
        gioBatDau: '08h00',
        diaDiem: 'Hội trường 350 chỗ',
        namHoc: '2026-2027',
        nguoiChuTri: 'Dương Văn Vinh' // Chuỗi văn bản khớp nvarchar(100) của CSDL
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tự động điền trích yếu nội dung công văn làm tên hoạt động mặc định khi mở Form
    useEffect(() => {
        if (congVanLink) {
            setFormData(prev => ({
                ...prev,
                tenHoatDong: congVanLink.TRICH_YEU || congVanLink.tenCongVan || prev.tenHoatDong
            }));
        }
    }, [congVanLink]);

    // Hàm cập nhật dữ liệu liên tục khi người dùng thay đổi giá trị trên các ô nhập liệu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 2. Tiến trình bóc tách dữ liệu và kích hoạt API đồng bộ chuỗi điểm danh
    const handleXacNhanTrieuTap = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi tải lại trang của form mặc định
        setIsSubmitting(true);

        try {
            // Đóng gói cấu trúc Payload chính xác với các tham số đầu vào ở Backend Controller
            const payload = {
                MA_CONGVAN: congVanLink?.MA || congVanLink?.id || 1, // Lấy mã định danh công văn liên kết
                TEN_HOAT_DONG: formData.tenHoatDong,
                NGAY_TO_CHUC: formData.ngayToChuc, // Chuỗi dạng YYYY-MM-DD an toàn cho hệ thống
                BUOI_TRIEU_TAP: formData.buoiTrieuTap,
                GIO_BAT_DAU: formData.gioBatDau,
                NAM_HOC: formData.namHoc,
                DIA_DIEM: formData.diaDiem,
                NGUOI_CHU_TRI: formData.nguoiChuTri // Truyền chuỗi họ tên giảng viên xuống nvarchar(100)
            };

            // Thực hiện cuộc gọi API bằng phương thức POST đến đúng phân hệ backend cổng 5000
           // const response = await axios.post('http://localhost:5000/api/trieu-tap/luu-va-dong-bo', payload);
//lệnh thay mới
            const response = await api.post('/api/trieu-tap/luu-va-dong-bo', payload);
            if (response.data.success) {
                // Thông báo kết quả lưu dữ liệu và quét lịch điểm danh thành công từ Server
                alert(response.data.message); 
                
                const maHoatDongMoi = response.data.maHoatDong;
                console.log("Mã hoạt động triệu tập vừa được hệ thống tự động sinh:", maHoatDongMoi);
                
                if (onClose) onClose(); // Đóng Modal biểu mẫu, quay lại màn hình danh mục
            }
        } catch (error) {
            console.error("Lỗi tiến trình thực thi nút lệnh Triệu tập:", error);
            // Bóc tách thông báo lỗi chi tiết trả về từ Rollback Transaction của Backend Express
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Quá trình đồng bộ dữ liệu thất bại.';
            alert(`[Lỗi Hệ Thống]: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-container">
            {/* Giao diện Form Triệu tập theo kế hoạch */}
            <form onSubmit={handleXacNhanTrieuTap}>
                
                {/* Khu vực hiển thị văn bản liên kết phía trên đầu Form */}
                <div className="text-center mb-4">
                    <span className="text-sm font-semibold text-blue-600">
                        Văn bản liên kết: {congVanLink?.SO_KYHIEU || congVanLink?.soKyHieu || "95/KH-CĐKTCNQN"}
                    </span>
                </div>

                {/* Ô nhập tên hoạt động triệu tập */}
                <div className="form-group mb-3">
                    <label className="block text-sm font-medium mb-1">Tên hoạt động triệu tập (*)</label>
                    <textarea 
                        name="tenHoatDong" 
                        value={formData.tenHoatDong} 
                        onChange={handleInputChange} 
                        className="w-full border p-2 rounded"
                        rows="3"
                        required 
                    />
                </div>

                {/* Hàng chứa Ngày tổ chức và Buổi triệu tập */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày tổ chức (*)</label>
                        <input 
                            type="date" 
                            name="ngayToChuc" 
                            value={formData.ngayToChuc} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Buổi triệu tập (*)</label>
                        <select 
                            name="buoiTrieuTap" 
                            value={formData.buoiTrieuTap} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="Buổi Sáng">Buổi Sáng</option>
                            <option value="Buổi Chiều">Buổi Chiều</option>
                            <option value="Buổi Tối">Buổi Tối</option>
                        </select>
                    </div>
                </div>

                {/* Hàng chứa Giờ bắt đầu và Địa điểm tổ chức */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Giờ bắt đầu (*)</label>
                        <input 
                            type="text" 
                            name="gioBatDau" 
                            value={formData.gioBatDau} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            placeholder="Ví dụ: 08h00"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Địa điểm tổ chức (*)</label>
                        <input 
                            type="text" 
                            name="diaDiem" 
                            value={formData.diaDiem} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            required 
                        />
                    </div>
                </div>

                {/* Hàng chứa Năm học và Người chủ trì */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Năm học (*)</label>
                        <input 
                            type="text" 
                            name="namHoc" 
                            value={formData.namHoc} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Người chủ trì (*)</label>
                        <input 
                            type="text" 
                            name="nguoiChuTri" 
                            value={formData.nguoiChuTri} 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                            required 
                        />
                    </div>
                </div>
                
                {/* Hệ thống nút bấm điều hướng hành động dựa theo trạng thái xử lý API */}
                <div className="form-actions flex justify-end gap-2 mt-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang bóc tách và đồng bộ...' : 'Xác nhận Triệu tập'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormTrieuTapModal;