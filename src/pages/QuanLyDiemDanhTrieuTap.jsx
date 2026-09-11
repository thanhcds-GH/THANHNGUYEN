import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../api/axiosClient';

function QuanLyDiemDanhTrieuTap() {
  const { maHoatDong } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [tenHoatDong, setTenHoatDong] = useState('Đang nạp thông tin hoạt động...');
  const [isEditingTen, setIsEditingTen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái ngoại lệ: Bắt buộc triệu tập 100%
  const [isBatBuoc100, setIsBatBuoc100] = useState(false);

  // Hàm tải dữ liệu điểm danh và bóc tách nội dung hoạt động triệu tập thực tế
  const fetchDuLieuDiemDanh = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Gọi song song API lấy dữ liệu điểm danh và danh sách giảng viên toàn khoa
      const [resDiemDanh, resLecturers] = await Promise.all([
        api.get(`/api/diem-danh/${maHoatDong}`),
        api.get('/api/lecturers').catch(() => ({ data: [] }))
      ]);

      // 2. Lấy danh sách ID các giảng viên ĐANG CÔNG TÁC (TRANGTHAI = 1)
      const allLecturers = Array.isArray(resLecturers.data) 
        ? resLecturers.data 
        : (resLecturers.data?.data || resLecturers.data?.danhSach || []);

      const activeLecturerIds = new Set(
        allLecturers
          .filter(gv => {
            const tt = gv.TRANGTHAI ?? gv.TRANG_THAI ?? gv.trangThai ?? gv.TrangThai;
            return tt === 1 || tt === '1' || tt === true;
          })
          .map(gv => String(gv.MA_GIANGVIEN ?? gv.MAGV ?? gv.MA_GV ?? gv.ID))
      );

      if (resDiemDanh.data) {
        let rawTen = 
          resDiemDanh.data.TEN_HOAT_DONG || 
          resDiemDanh.data.tenHoatDong || 
          resDiemDanh.data.TEN_CONGVAN || 
          resDiemDanh.data.tenCongVan || 
          resDiemDanh.data.TRICH_YEU ||
          '';

        const isTenMau = !rawTen || rawTen.includes('mẫu số') || rawTen.includes('mau so');

        if (isTenMau) {
          try {
            const resDoc = await api.get(`/api/documents`);
            const dsCongVan = Array.isArray(resDoc.data) ? resDoc.data : (resDoc.data?.data || []);
            const cvHienTai = dsCongVan.find(cv => String(cv.MA_CONGVAN) === String(maHoatDong));
            
            if (cvHienTai?.TEN_CONGVAN) {
              setTenHoatDong(cvHienTai.TEN_CONGVAN);
            } else {
              setTenHoatDong(rawTen || `Hoạt động triệu tập số ${maHoatDong}`);
            }
          } catch {
            setTenHoatDong(rawTen || `Hoạt động triệu tập số ${maHoatDong}`);
          }
        } else {
          setTenHoatDong(rawTen);
        }

        const rawList = resDiemDanh.data.danhSach || [];
        
        // 3. LỌC: CHỈ GIỮ LẠI GIẢNG VIÊN CÓ TRANGTHAI = 1 (LOẠI BỎ TRANGTHAI = 0)
        const filteredRawList = activeLecturerIds.size > 0
          ? rawList.filter(item => {
              const idStr = String(item.MA_GIANGVIEN ?? item.MAGV ?? item.MA_GV ?? item.ID);
              return activeLecturerIds.has(idStr);
            })
          : rawList.filter(item => {
              const tt = item.TRANGTHAI ?? item.TRANG_THAI;
              return tt === undefined || tt === 1 || tt === '1' || tt === true;
            });

        const normalizedList = filteredRawList.map((item, idx) => {
          const isTrungLich = item.CO_GIO_LEN_LOP === 1 || item.CO_GIO_LEN_LOP === true || item.CO_GIO_LEN_LOP === "True" || item.CO_GIO_LEN_LOP === "1";
          const banDauCoPhep = item.XIN_PHEP_TRUONG_KHOA === 1 || item.XIN_PHEP_TRUONG_KHOA === true || item.XIN_PHEP_TRUONG_KHOA === "True" || item.XIN_PHEP_TRUONG_KHOA === "1";

          let currentStatus = item.TRANG_THAI_DI_HOP || 'Chưa điểm danh';
          if (currentStatus === 'Chưa điểm danh') {
            if (banDauCoPhep) currentStatus = 'Vắng có lý do';
            else if (isTrungLich) currentStatus = 'Trùng lịch dạy';
            else currentStatus = 'Có mặt';
          }

          const rawMa = item.MA_GIANGVIEN ?? item.MAGV ?? item.MA_GV ?? item.ID ?? (idx + 1);

          return {
            maGiangVien: rawMa,
            tenGiangVien: item.TEN_GIANGVIEN || item.HOTEN || item.TEN_GV || 'Chưa rõ',
            coGioLenLop: isTrungLich,
            xinPhepTruongKhoa: banDauCoPhep, 
            lyDoXinPhep: item.LY_DO_XIN_PHEP || '',
            trangThaiDiHop: currentStatus
          };
        });

        setData({
          ...resDiemDanh.data,
          danhSach: normalizedList
        });
        setError(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách điểm danh:", err);
      setError(`Không thể tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [maHoatDong]);

  useEffect(() => {
    if (!maHoatDong) {
      setLoading(false);
      setError("Không tìm thấy mã hoạt động triệu tập hợp lệ trên URL.");
      return;
    }
    fetchDuLieuDiemDanh();
  }, [maHoatDong, fetchDuLieuDiemDanh]);

  // XỬ LÝ NGOẠI LỆ: Khi kích hoạt Bắt buộc 100% -> Chỉ load Giảng viên có TRANGTHAI = 1
  const handleToggleBatBuoc100 = async (checked) => {
    setIsBatBuoc100(checked);

    if (checked) {
      try {
        setLoading(true);
        const resLecturers = await api.get('/api/lecturers');
        const allLecturers = Array.isArray(resLecturers.data) 
          ? resLecturers.data 
          : (resLecturers.data?.data || resLecturers.data?.danhSach || []);

        // LỌC: CHỈ LẤY GIẢNG VIÊN CÓ TRẠNG THÁI = 1
        const activeLecturers = allLecturers.filter(gv => {
          const tt = gv.TRANGTHAI ?? gv.TRANG_THAI ?? gv.trangThai ?? gv.TrangThai;
          return tt === 1 || tt === '1' || tt === true;
        });

        const fullList = activeLecturers.map((gv, idx) => {
          const rawMa = gv.MA_GIANGVIEN ?? gv.MAGV ?? gv.MA_GV ?? gv.ID ?? (idx + 1);
          return {
            maGiangVien: rawMa,
            tenGiangVien: gv.HOTEN || gv.TEN_GIANGVIEN || gv.TEN_GV || 'Chưa rõ',
            coGioLenLop: false,
            xinPhepTruongKhoa: false,
            lyDoXinPhep: '',
            trangThaiDiHop: 'Có mặt'
          };
        });

        setData(prev => ({
          ...(prev || {}),
          danhSach: fullList
        }));
      } catch (err) {
        console.error("Lỗi tải danh sách giảng viên đang công tác:", err);
        alert("Không thể tải danh sách giảng viên từ máy chủ!");
      } finally {
        setLoading(false);
      }
    } else {
      fetchDuLieuDiemDanh();
    }
  };

  const handleStatusChange = (index, newStatus) => {
    if (!data?.danhSach) return;
    const updatedList = [...data.danhSach];
    const item = updatedList[index];
    item.trangThaiDiHop = newStatus;
    
    if (newStatus === 'Vắng có lý do') {
      item.xinPhepTruongKhoa = true;
      if (!item.lyDoXinPhep) item.lyDoXinPhep = 'Trưởng khoa cho phép';
    } else {
      item.xinPhepTruongKhoa = false;
    }

    setData({ ...data, danhSach: updatedList });
  };

  const handleLyDoChange = (index, text) => {
    if (!data?.danhSach) return;
    const updatedList = [...data.danhSach];
    updatedList[index].lyDoXinPhep = text;
    setData({ ...data, danhSach: updatedList });
  };

  // HÀM LƯU KẾT QUẢ ĐÃ ĐƯỢC CHUẨN HÓA KHỚP VỚI BACKEND
  const handleSaveDiemDanh = async () => {
    if (!data?.danhSach || data.danhSach.length === 0) {
      alert("Không có danh sách giảng viên để lưu!");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const idHoatDong = parseInt(data?.maHoatDong || data?.MA_HOAT_DONG || maHoatDong, 10);

      const payload = {
        maHoatDong: idHoatDong,
        danhSachDiemDanh: data.danhSach.map(item => ({
          MA_GIANGVIEN: parseInt(item.maGiangVien, 10),
          TRANG_THAI_DI_HOP: item.trangThaiDiHop,
          XIN_PHEP_TRUONG_KHOA: item.xinPhepTruongKhoa ? 1 : 0,
          LY_DO_XIN_PHEP: item.lyDoXinPhep || '',
          CO_GIO_LEN_LOP: item.coGioLenLop ? 1 : 0
        }))
      };

      const response = await api.post(`/api/diem-danh/luu`, payload);
      if (response.data.success || response.status === 200) {
        alert("Hệ thống đã cập nhật và lưu kết quả điểm danh thành công!");
      } else {
        alert(`Thông báo từ máy chủ: ${response.data.message || 'Lưu thất bại'}`);
      }
    } catch (err) {
      console.error("Lỗi khi lưu điểm danh:", err);
      const thongBaoLoi = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Lỗi hệ thống: ${thongBaoLoi}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    if (!maHoatDong) {
      alert('Không tìm thấy mã hoạt động hợp lệ để xuất Excel.');
      return;
    }
    window.location.href = `${BASE_URL}/api/diem-danh/xuat-excel/${maHoatDong}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium text-sm">Đang nạp cấu trúc bảng điểm danh hành chính...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center border-t-4 border-red-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Thông báo hệ thống</h3>
          <p className="text-gray-600 mb-6 text-xs leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/quan-ly-cong-van')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
          >
            Quay lại danh mục công văn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* HEADER BANNER */}
      <div className="bg-[#4C75F2] rounded-t-xl p-5 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-xl font-black text-[#FDE047] tracking-wide uppercase">
            PHÂN HỆ QUẢN LÝ ĐIỂM DANH TRIỆU TẬP
          </h2>
          
          <div className="flex items-start sm:items-center gap-2 mt-2">
            <span className="text-xs font-bold text-white/90 shrink-0 mt-1 sm:mt-0">Hoạt động:</span>
            {isEditingTen ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={tenHoatDong}
                  onChange={(e) => setTenHoatDong(e.target.value)}
                  className="bg-white text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg w-full focus:outline-none shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTen(false)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded shadow-xs"
                >
                  Xong
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#2A49B8] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs leading-relaxed inline-block max-w-3xl">
                  {tenHoatDong}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTen(true)}
                  className="text-blue-100 hover:text-white text-xs underline cursor-pointer"
                  title="Nhấn để sửa tên hoạt động"
                >
                  ✏️ Sửa
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2.5 items-center shrink-0">
          <button 
            onClick={handleSaveDiemDanh}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-md transition ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
          </button>

          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg shadow-md transition"
          >
            Xuất Excel
          </button>

          <button 
            onClick={() => navigate('/quan-ly-cong-van')}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-xs hover:bg-gray-50 transition"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* THANH NGOẠI LỆ 100% */}
      <div className="bg-[#FEFCE8] border border-[#FEF08A] px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={isBatBuoc100}
            onChange={(e) => handleToggleBatBuoc100(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
          />
          <div>
            <span className="text-xs font-extrabold text-[#991B1B] uppercase tracking-wide flex items-center gap-1.5">
              ⚠️ NGOẠI LỆ: HOẠT ĐỘNG BẮT BUỘC TRIỆU TẬP 100% (TOÀN THỂ GIẢNG VIÊN & VIÊN CHỨC)
            </span>
            <p className="text-[11px] text-[#854D0E] font-medium">
              Khi kích hoạt: Tự động tải danh sách giảng viên đang công tác (Trạng thái = 1), mặc định chuyển sang "Có mặt".
            </p>
          </div>
        </label>

        {isBatBuoc100 && (
          <span className="bg-[#DC2626] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            CHẾ ĐỘ BẮT BUỘC 100% ĐANG BẬT
          </span>
        )}
      </div>

      {/* BẢNG DỮ LIỆU ĐIỂM DANH */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#F8FAFC]">
            <tr className="text-xs text-gray-600 uppercase font-bold tracking-wider">
              <th className="px-6 py-3.5 text-left w-24">MÃ GV</th>
              <th className="px-6 py-3.5 text-left w-56">TÊN GIẢNG VIÊN</th>
              <th className="px-6 py-3.5 text-left w-36">LỊCH DẠY TRÙNG</th>
              <th className="px-6 py-3.5 text-left w-60">TÁC VỤ ĐIỂM DANH</th>
              <th className="px-6 py-3.5 text-left w-40">TRẠNG THÁI LƯU TRỮ</th>
              <th className="px-6 py-3.5 text-left">LÝ DO / MINH CHỨNG GHI CHÚ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {data?.danhSach && data.danhSach.length > 0 ? (
              data.danhSach.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {item.maGiangVien}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-800 font-semibold">
                    {item.tenGiangVien}
                  </td>

                  <td className="px-6 py-4">
                    {isBatBuoc100 && item.coGioLenLop ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        Hoãn dạy - Bắt buộc dự
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.coGioLenLop ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.coGioLenLop ? 'Có giờ lên lớp' : 'Trống lịch'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-3">
                    <select
                      value={item.trangThaiDiHop}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500 shadow-2xs"
                    >
                      <option value="Có mặt">Có mặt</option>
                      <option value="Vắng mặt">Vắng mặt (Không phép)</option>
                      <option value="Vắng có lý do">Vắng có lý do (Phép Trưởng khoa)</option>
                      {!isBatBuoc100 && <option value="Trùng lịch dạy">Trùng lịch dạy</option>}
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`font-bold px-2.5 py-1 rounded text-[10px] border inline-block text-center ${
                      item.trangThaiDiHop === 'Có mặt' ? 'bg-green-50 text-green-700 border-green-200' : 
                      item.trangThaiDiHop === 'Vắng có lý do' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.trangThaiDiHop === 'Trùng lịch dạy' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {item.trangThaiDiHop}
                    </span>
                  </td>

                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={item.lyDoXinPhep}
                      onChange={(e) => handleLyDoChange(index, e.target.value)}
                      placeholder="Nhập lý do xin phép nếu vắng..."
                      className="w-full bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none py-1 text-gray-600"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                  Chưa tìm thấy danh sách giảng viên hợp lệ cho hoạt động này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuanLyDiemDanhTrieuTap;