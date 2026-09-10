import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
//import api from '../api/axiosClient';
const ImportLichDay = () => {
    const [danhSachGiangVien, setDanhSachGiangVien] = useState([]);
    const [selectedGV, setSelectedGV] = useState('');
    const [fileExcel, setFileExcel] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Bổ sung useRef để quản lý và reset thẻ input file vật lý sau khi nạp thành công
    const fileInputRef = useRef(null);

    // Tải danh sách giảng viên khi màn hình khởi tạo để đổ vào Dropdown
    useEffect(() => {
        const fetchGiangVien = async () => {
            try {
               const res = await axios.get('http://localhost:5000/api/lecturers'); 
              // const res = await api.get('/api/lecturers');
                const data = Array.isArray(res.data) ? res.data : res.data.data || [];
                setDanhSachGiangVien(data);
            } catch (err) {
                console.error("Lỗi tải danh sách giảng viên:", err);
            }
        };
        fetchGiangVien();
    }, []);

    const handleFileChange = (e) => {
        setFileExcel(e.target.files[0]);
    };

    const handleExecuteImport = async (e) => {
        e.preventDefault();
        if (!selectedGV) {
            alert('Vui lòng chọn Giảng viên cần nạp lịch dạy!');
            return;
        }
        if (!fileExcel) {
            alert('Vui lòng chọn file Excel tiến độ giảng dạy!');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileExcel);
        
        // ĐỒNG BỘ 100%: Truyền tải chính xác trường mã định danh viết hoa liền nhau
        formData.append('MA_GIANGVIEN', selectedGV); 

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/lich-day/import-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                alert(response.data.message);
                
                // Làm sạch trạng thái lưu trữ và reset thẻ input vật lý về rỗng
                setFileExcel(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error("Lỗi Import lịch dạy:", error);
            alert(error.response?.data?.message || 'Quá trình bóc tách tệp gặp sự cố kỹ thuật.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto my-10 bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
            
            {/* BANNER HEADER - KHỐI TIÊU ĐỀ HỆ THỐNG */}
            <div className="bg-blue-600 px-6 py-5 text-center">
                <h2 className="text-xl font-extrabold uppercase tracking-widest text-[#FFD700]">
                    Nạp tiến độ giảng dạy học phần
                </h2>
                <p className="text-white/80 text-xs font-medium mt-1">
                    Đồng bộ dữ liệu thời khóa biểu vào hệ thống quản lý tích lũy KPI
                </p>
            </div>

            {/* FORM NHẬP LIỆU */}
            <form onSubmit={handleExecuteImport} className="p-6 space-y-5 text-left">
                
                {/* 1. Chọn giảng viên */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Chọn Giảng viên sở hữu (*)
                    </label>
                    <select
                        value={selectedGV}
                        onChange={(e) => setSelectedGV(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 bg-white transition"
                    >
                        <option value="">-- Chọn Thầy/Cô giảng dạy --</option>
                        {danhSachGiangVien.map((gv) => (
                            // ĐỊNH DANH CHUẨN XÁC: Ánh xạ chuẩn theo MA_GIANGVIEN và tên cột HOTEN của SQL Server
                            <option key={gv.MA_GIANGVIEN} value={gv.MA_GIANGVIEN}>
                                {gv.MA_GIANGVIEN} - {gv.HOTEN}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Khu vực tải file kéo thả */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Chọn tệp tiến độ Excel (.xls, .xlsx) (*)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition cursor-pointer relative">
                        <input
                            type="file"
                            ref={fileInputRef} // Gắn tham chiếu vật lý vào đây
                            accept=".xls,.xlsx"
                            onChange={handleFileChange}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                            <div className="text-slate-400 flex justify-center">
                                <svg className="w-10 h-10 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                Click để chọn tệp hoặc kéo thả vào đây
                            </p>
                            <p className="text-xs text-slate-400">
                                Hệ thống tự động bóc tách cột Ngày lên lớp và cột Buổi
                            </p>
                        </div>
                    </div>
                    {fileExcel && (
                        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-700">📄 File đã chọn:</span>
                            <span className="text-sm text-slate-700 font-medium truncate">{fileExcel.name}</span>
                        </div>
                    )}
                </div>

                {/* BUTTON THỰC THI */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-2.5 rounded-xl transition shadow-md active:scale-95 disabled:bg-slate-300 disabled:scale-100"
                    >
                        {loading ? 'Đang bóc tách dữ liệu...' : 'Bắt đầu nạp dữ liệu'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ImportLichDay;