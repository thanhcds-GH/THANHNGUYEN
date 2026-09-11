import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosClient';

const getCleanLopName = (rawLop) => {
    if (!rawLop) return '';
    return String(rawLop)
        .replace(/\s*\(Sĩ số:.*\)/i, '')
        .trim()
        .normalize('NFC');
};

const QuanLyPhanCong = ({ isOpen = true, onClose }) => {
    const danhSachNghe = [
        'Công nghệ thông tin (UDPM)',
        'Điện tử công nghiệp',
        'KTSC,LRMT',
        'Khoa ngoài'
    ];

    const danhSachHeDaoTao = ['Cao đẳng', 'Trung cấp'];
    const danhSachNamHoc = ['2026-2027', '2025-2026', '2024-2025'];
    const danhSachHocKy = ['Học kỳ 1', 'Học kỳ 2'];

    const [allMonHoc, setAllMonHoc] = useState([]);
    const [allGiangVien, setAllGiangVien] = useState([]);
    const [allLopHoc, setAllLopHoc] = useState([]);
    const [dsPhanCong, setDsPhanCong] = useState([]);

    const [filteredMonHoc, setFilteredMonHoc] = useState([]);
    const [filteredGiangVien, setFilteredGiangVien] = useState([]);
    const [filteredLopHoc, setFilteredLopHoc] = useState([]);

    const [formData, setFormData] = useState({
        TEN_NGHE: 'Công nghệ thông tin (UDPM)',
        HE_DAO_TAO: 'Cao đẳng',
        NAM_HOC: '2026-2027',
        HOC_KY: 'Học kỳ 1',
        MA_MH_MD: '',
        MA_GIANGVIEN: '',
        TEN_LOP: 'CĐK20 CNTT A',
        SI_SO: 27
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingGrid, setLoadingGrid] = useState(false);

    // 1. Nạp danh mục ban đầu và tự động gọi API lấy dữ liệu theo lớp hiện tại từ CSDL
    useEffect(() => {
        const fetchDanhMucVaDuLieu = async () => {
            try {
                const resGV = await api.get('/api/phan-cong/giang-vien');
                if (resGV.data?.success && Array.isArray(resGV.data?.data)) {
                    setAllGiangVien(resGV.data.data);
                }
            } catch (error) {
                console.warn('Backend chưa có API GV, dùng danh sách chuẩn.');
            }

            const defaultGiangVien = [
                { MADN: 'GV001', HOTEN: 'Nguyễn Lê Ngọc Thành', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV002', HOTEN: 'Lê Thị Kim Oanh', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV004', HOTEN: 'Đinh Thị Thu', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV007', HOTEN: 'Lê Thị Hòa', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV008', HOTEN: 'Lê Tấn Hòa', BO_MON: 'Điện tử' },
                { MADN: 'GV010', HOTEN: 'Nguyễn Bích Hà', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV012', HOTEN: 'Nguyễn Thị Thanh Thắng', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV014', HOTEN: 'Huỳnh Thị Hồng Sinh', BO_MON: 'Công Nghệ Thông Tin' },
                { MADN: 'GV003', HOTEN: 'Nguyễn Văn Đại', BO_MON: 'Điện tử' },
                { MADN: 'GV005', HOTEN: 'Nguyễn Giang Long', BO_MON: 'Điện tử' },
                { MADN: 'GV006', HOTEN: 'Lương Thanh Long', BO_MON: 'Điện tử' },
                { MADN: 'GV018', HOTEN: 'Trần Hiếu Nghĩa', BO_MON: 'Điện tử' },
                { MADN: 'GV019', HOTEN: 'Dư Vĩ Bằng', BO_MON: 'Điện tử' },
                { MADN: 'GV020', HOTEN: 'Đào Thị Thúy Dung', BO_MON: 'Điện tử' },
                { MADN: 'GV021', HOTEN: 'Thái Thiên Ân', BO_MON: 'Điện tử' },
                { MADN: 'GV022', HOTEN: 'Bùi Thị Thu Hà', BO_MON: 'Tiếng Anh' },
                { MADN: 'GV023', HOTEN: 'Trì Thị Kim Hồng', BO_MON: 'Tiếng Anh' }
            ];
            setAllGiangVien(prev => prev.length > 0 ? prev : defaultGiangVien);

            const fullMonHoc = [
                // CÔNG NGHỆ THÔNG TIN (UDPM) - CAO ĐẲNG
                { MA_MH_MD: '5H01', TEN_MH_MD: 'Giáo dục chính trị', STC: 2, SO_GIO: 75, LT: 41, TH: 29, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H02', TEN_MH_MD: 'Pháp luật', STC: 2, SO_GIO: 30, LT: 18, TH: 10, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H03', TEN_MH_MD: 'Giáo dục thể chất', STC: 2, SO_GIO: 60, LT: 5, TH: 53, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H04', TEN_MH_MD: 'Giáo dục quốc phòng - An ninh', STC: 3, SO_GIO: 75, LT: 37, TH: 35, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H05', TEN_MH_MD: 'Tin học', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H06', TEN_MH_MD: 'Tiếng Anh', STC: 4, SO_GIO: 120, LT: 40, TH: 76, KT: 4, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5H2507', TEN_MH_MD: 'An toàn lao động', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2508', TEN_MH_MD: 'Lập trình C', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2509', TEN_MH_MD: 'Lắp ráp cài đặt và bảo trì máy tính', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'Xưởng PC', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2510', TEN_MH_MD: 'Tiếng Anh chuyên ngành', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5H2511', TEN_MH_MD: 'Cơ sở dữ liệu', STC: 3, SO_GIO: 45, LT: 36, TH: 6, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2512', TEN_MH_MD: 'Xây dựng cấu trúc dữ liệu và giải thuật', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2513', TEN_MH_MD: 'Thiết kế đồ họa', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2514', TEN_MH_MD: 'Phân tích và thiết kế hệ thống thông tin', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2515', TEN_MH_MD: 'Thiết kế và lắp đặt mạng LAN', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'Xưởng Mạng', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2516', TEN_MH_MD: 'Quản trị cơ sở dữ liệu với SQL Server', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2517', TEN_MH_MD: 'Lập trình C#.NET', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2518', TEN_MH_MD: 'Thiết kế và lập trình website', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2519', TEN_MH_MD: 'Lập trình cơ sở dữ liệu', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2520', TEN_MH_MD: 'Lập trình di động trên nền tảng Android', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2521', TEN_MH_MD: 'Xử lý ngôn ngữ tự nhiên với AI', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2522', TEN_MH_MD: 'Xử lý đa phương tiện bằng AI', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2523', TEN_MH_MD: 'Quản trị an ninh mạng', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'Xưởng Mạng', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2524', TEN_MH_MD: 'Thực tập sản xuất 1', STC: 8, SO_GIO: 360, LT: 65, TH: 293, KT: 2, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2525', TEN_MH_MD: 'Thực tập sản xuất 2', STC: 16, SO_GIO: 720, LT: 190, TH: 528, KT: 2, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2526', TEN_MH_MD: 'Xây dựng phần mềm quản lý bán hàng', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2527', TEN_MH_MD: 'Quản trị hệ điều hành Windows Server', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2528', TEN_MH_MD: 'Thiết kế đa phương tiện', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'CNTT5D2529', TEN_MH_MD: 'Xây dựng trang web với ReactJS', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },

                // CÔNG NGHỆ THÔNG TIN (UDPM) - TRUNG CẤP
                { MA_MH_MD: '4H01', TEN_MH_MD: 'Giáo dục chính trị', STC: 2, SO_GIO: 30, LT: 15, TH: 13, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H02', TEN_MH_MD: 'Pháp luật', STC: 1, SO_GIO: 15, LT: 9, TH: 5, KT: 1, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H03', TEN_MH_MD: 'Giáo dục thể chất', STC: 1, SO_GIO: 30, LT: 4, TH: 25, KT: 1, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H04', TEN_MH_MD: 'Giáo dục quốc phòng và An ninh', STC: 2, SO_GIO: 45, LT: 22, TH: 21, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H05', TEN_MH_MD: 'Tin học', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H06', TEN_MH_MD: 'Tiếng Anh', STC: 3, SO_GIO: 90, LT: 30, TH: 57, KT: 3, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4H2507', TEN_MH_MD: 'Toán', STC: 5, SO_GIO: 75, LT: 20, TH: 50, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4H2508', TEN_MH_MD: 'Văn', STC: 5, SO_GIO: 75, LT: 32, TH: 38, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4H2509', TEN_MH_MD: 'Lý', STC: 5, SO_GIO: 75, LT: 30, TH: 40, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4H2510', TEN_MH_MD: 'An toàn lao động', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2511', TEN_MH_MD: 'Lập trình C', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2512', TEN_MH_MD: 'Lắp ráp cài đặt và bảo trì máy tính', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'Xưởng PC', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4H2513', TEN_MH_MD: 'Cơ sở dữ liệu', STC: 3, SO_GIO: 45, LT: 36, TH: 6, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2514', TEN_MH_MD: 'Thiết kế đồ họa', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2515', TEN_MH_MD: 'Thiết kế và lắp đặt mạng LAN', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'Xưởng Mạng', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2516', TEN_MH_MD: 'Quản trị cơ sở dữ liệu với SQL Server', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2517', TEN_MH_MD: 'Lập trình C#.NET', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2518', TEN_MH_MD: 'Thiết kế và lập trình website', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2519', TEN_MH_MD: 'Lập trình cơ sở dữ liệu', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'CNTT4D2520', TEN_MH_MD: 'Thực tập sản xuất', STC: 8, SO_GIO: 360, LT: 15, TH: 343, KT: 2, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },

                // ĐIỆN TỬ CÔNG NGHIỆP - CAO ĐẲNG
                { MA_MH_MD: '5H01', TEN_MH_MD: 'Giáo dục chính trị', STC: 5, SO_GIO: 75, LT: 41, TH: 29, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H02', TEN_MH_MD: 'Pháp luật', STC: 2, SO_GIO: 30, LT: 18, TH: 10, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H03', TEN_MH_MD: 'Giáo dục thể chất', STC: 2, SO_GIO: 60, LT: 5, TH: 53, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H04', TEN_MH_MD: 'Giáo dục quốc phòng - An ninh', STC: 3, SO_GIO: 75, LT: 37, TH: 35, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H05', TEN_MH_MD: 'Tin học', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 0, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: '5H06', TEN_MH_MD: 'Tiếng Anh', STC: 4, SO_GIO: 120, LT: 40, TH: 76, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5H2507', TEN_MH_MD: 'An toàn lao động', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 0, PHONG_XUONG: 'P.101, P.104', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2508', TEN_MH_MD: 'Tiếng Anh chuyên ngành', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5H2509', TEN_MH_MD: 'Kỹ thuật điện - điện tử', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 0, PHONG_XUONG: 'P.101, P.104', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5H2510', TEN_MH_MD: 'Thiết bị điện', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 0, PHONG_XUONG: 'dãy A, B', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5H2511', TEN_MH_MD: 'Công nghệ sản xuất linh kiện bán dẫn', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2512', TEN_MH_MD: 'Đo lường điện, điện tử', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 0, PHONG_XUONG: 'P.101; P.201-203', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2513', TEN_MH_MD: 'Lắp ráp mạch điện tử tương tự', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: 'P.101; P.201-203', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2514', TEN_MH_MD: 'Lắp ráp mạch điện tử số', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2515', TEN_MH_MD: 'Chế tạo mạch điện tử', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2516', TEN_MH_MD: 'Lắp đặt, bảo trì hệ thống điều khiển', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2517', TEN_MH_MD: 'Lắp đặt, điều khiển hệ thống điện khí nén', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2518', TEN_MH_MD: 'Lắp ráp, vận hành, bảo trì các bộ biến đổi nguồn...', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2519', TEN_MH_MD: 'Lắp đặt, vận hành thiết bị âm thanh, ánh sáng và ...', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2520', TEN_MH_MD: 'Lập trình vi điều khiển', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2521', TEN_MH_MD: 'Lập trình PLC', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2522', TEN_MH_MD: 'Lắp đặt mạng truyền thông công nghiệp', STC: 2, SO_GIO: 45, LT: 18, TH: 25, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2523', TEN_MH_MD: 'Lắp đặt, vận hành hệ thống quản lí toà nhà', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2524', TEN_MH_MD: 'Thực tập sản xuất 1', STC: 8, SO_GIO: 360, LT: 65, TH: 293, KT: 0, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2525', TEN_MH_MD: 'Thực tập sản xuất 2', STC: 16, SO_GIO: 720, LT: 190, TH: 528, KT: 0, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2526', TEN_MH_MD: 'Thiết kế vi mạch bán dẫn', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2527', TEN_MH_MD: 'Vận hành dây chuyền sản xuất vi mạch bán dẫn', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2528', TEN_MH_MD: 'Kết nối, lập trình IoT', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { MA_MH_MD: 'ĐTCN5D2529', TEN_MH_MD: 'Điều khiển dùng thị giác máy tính', STC: 3, SO_GIO: 75, LT: 30, TH: 42, KT: 0, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },

                // ĐIỆN TỬ CÔNG NGHIỆP - TRUNG CẤP (CHUẨN 21 MÔN)
                { MA_MH_MD: '4H01', TEN_MH_MD: 'Giáo dục chính trị', STC: 2, SO_GIO: 30, LT: 15, TH: 13, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H02', TEN_MH_MD: 'Pháp luật', STC: 1, SO_GIO: 15, LT: 9, TH: 5, KT: 1, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H03', TEN_MH_MD: 'Giáo dục thể chất', STC: 1, SO_GIO: 30, LT: 4, TH: 25, KT: 1, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H04', TEN_MH_MD: 'Giáo dục quốc phòng và An ninh', STC: 2, SO_GIO: 45, LT: 22, TH: 21, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H05', TEN_MH_MD: 'Tin học', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'P.303-P.306', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: '4H06', TEN_MH_MD: 'Tiếng Anh', STC: 3, SO_GIO: 90, LT: 30, TH: 57, KT: 3, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2507', TEN_MH_MD: 'Toán', STC: 5, SO_GIO: 75, LT: 20, TH: 50, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2508', TEN_MH_MD: 'Văn', STC: 5, SO_GIO: 75, LT: 32, TH: 38, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2509', TEN_MH_MD: 'Lý', STC: 5, SO_GIO: 75, LT: 30, TH: 40, KT: 5, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2510', TEN_MH_MD: 'An toàn lao động', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: 'P.101, P.104', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2511', TEN_MH_MD: 'Kỹ thuật điện - điện tử', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: 'P.101, P.104', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2512', TEN_MH_MD: 'Thiết bị điện', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: 'P.101, P.104', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4H2513', TEN_MH_MD: 'Công nghệ sản xuất linh kiện bán dẫn', STC: 2, SO_GIO: 30, LT: 24, TH: 4, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2514', TEN_MH_MD: 'Đo lường điện, điện tử', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'P.101; P.201-203', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2515', TEN_MH_MD: 'Lắp ráp mạch điện tử tương tự', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.101; P.201-203', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2516', TEN_MH_MD: 'Lắp ráp mạch điện tử số', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2517', TEN_MH_MD: 'Chế tạo mạch điện tử', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2518', TEN_MH_MD: 'Lắp đặt, bảo trì hệ thống điều khiển', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2519', TEN_MH_MD: 'Lắp ráp, vận hành, bảo trì các bộ biến đổi nguồn...', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2520', TEN_MH_MD: 'Lắp đặt, vận hành thiết bị âm thanh, ánh sáng và ...', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: '', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { MA_MH_MD: 'ĐTCN4D2521', TEN_MH_MD: 'Thực tập sản xuất', STC: 8, SO_GIO: 360, LT: 15, TH: 343, KT: 2, PHONG_XUONG: 'Doanh nghiệp', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' }
            ];
            setAllMonHoc(fullMonHoc);

            const fullLopHoc = [
                { TEN_LOP: 'CĐK20 CNTT A', SI_SO: 27, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK20 CNTT B', SI_SO: 27, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK19 CNTT A', SI_SO: 35, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK19 CNTT B', SI_SO: 31, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK20 ĐTCN A', SI_SO: 36, KHOA: 'ĐT-TH', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK20 ĐTCN B', SI_SO: 36, KHOA: 'ĐT-TH', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK20 ĐTCN CLC', SI_SO: 36, KHOA: 'ĐT-TH', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'CĐK20 KTSCLRMT A', SI_SO: 29, KHOA: 'ĐT-TH', TEN_NGHE: 'KTSC,LRMT', HE_DAO_TAO: 'Cao đẳng' },
                { TEN_LOP: 'TCK20 CNTT A', SI_SO: 28, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { TEN_LOP: 'TCK20 ĐTCN A', SI_SO: 26, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { TEN_LOP: 'TCK19 CNTT A', SI_SO: 19, KHOA: 'ĐT-TH', TEN_NGHE: 'Công nghệ thông tin (UDPM)', HE_DAO_TAO: 'Trung cấp' },
                { TEN_LOP: 'TCK19 ĐTCN A', SI_SO: 25, KHOA: 'ĐT-TH', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' },
                { TEN_LOP: 'TCK19 KTSCLRMT A', SI_SO: 27, KHOA: 'ĐT-TH', TEN_NGHE: 'Điện tử công nghiệp', HE_DAO_TAO: 'Trung cấp' }
            ];
            setAllLopHoc(fullLopHoc);

            // GỌI TRỰC TIẾP API /theo-lop NGAY KHI MỞ FORM
            fetchPhanCongTheoLopHienTai(formData.TEN_LOP, formData.HOC_KY, formData.NAM_HOC);
        };

        if (isOpen) {
            fetchDanhMucVaDuLieu();
        }
    }, [isOpen]);

    // 2. Hàm gọi API /theo-lop
    const fetchPhanCongTheoLopHienTai = async (lopName, hk, nh) => {
        const cleanLop = getCleanLopName(lopName);
        if (!cleanLop) return;

        const hocKyInt = (hk === 'Học kỳ 1' || String(hk) === '1') ? 1 : 2;
        const cleanNH = String(nh || '2026-2027').replace('Năm học ', '').trim();

        setLoadingGrid(true);
        try {
            const res = await api.get('/api/phan-cong/theo-lop', {
                params: {
                    maLop: cleanLop,
                    hocKy: hocKyInt,
                    namHoc: cleanNH
                }
            });

            if (res.data?.success && Array.isArray(res.data?.data)) {
                const listFromDB = res.data.data;

                const loadedData = listFromDB.map(row => {
                    const maMonChuan = String(row?.MA_MH_MD || '').trim();
                    const mhInfo = allMonHoc.find(m => String(m?.MA_MH_MD).trim() === maMonChuan) || {};
                    const maGVChuan = String(row?.MA_GIANGVIEN || '').trim();
                    const gvInfo = allGiangVien.find(g => String(g?.MADN || g?.MA_GIANGVIEN).trim() === maGVChuan) || {};

                    return {
                        ID: row?.ID_PHAN_CONG || row?.ID || Date.now() + Math.random(),
                        MA_MH_MD: maMonChuan,
                        TEN_MH_MD: row?.TEN_MH_MD || mhInfo?.TEN_MH_MD || maMonChuan,
                        STC: row?.STC || mhInfo?.STC || 3,
                        SO_GIO: row?.GIO_DAY_THEO_PHAN_CONG || row?.SO_GIO || mhInfo?.SO_GIO || 45,
                        LT: row?.LT ?? mhInfo?.LT ?? 0,
                        TH: row?.TH ?? mhInfo?.TH ?? 0,
                        KT: 0,
                        PHONG_XUONG: row?.PHONG_XUONG || mhInfo?.PHONG_XUONG || 'P.303-P.306',
                        MA_GIANGVIEN: maGVChuan,
                        TEN_GIANGVIEN: gvInfo?.HOTEN || gvInfo?.TEN_GIANGVIEN || row?.TEN_GIANGVIEN || 'Chưa rõ',
                        TEN_LOP: row?.TEN_LOP || cleanLop,
                        HOC_KY: hocKyInt === 1 ? 'Học kỳ 1' : 'Học kỳ 2',
                        NAM_HOC: cleanNH,
                        SI_SO: row?.SI_SO || 27
                    };
                });

                setDsPhanCong(prev => {
                    const currentArray = Array.isArray(prev) ? prev : [];
                    const others = currentArray.filter(p => {
                        const isThisLop = getCleanLopName(p?.TEN_LOP).toLowerCase() === cleanLop.toLowerCase() &&
                                          String(p?.NAM_HOC || '').replace('Năm học ', '').trim() === cleanNH &&
                                          (p?.HOC_KY === (hocKyInt === 1 ? 'Học kỳ 1' : 'Học kỳ 2') || p?.HOC_KY === hocKyInt);
                        return !isThisLop;
                    });
                    return [...others, ...loadedData];
                });
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu phân công theo lớp từ CSDL:', err);
        } finally {
            setLoadingGrid(false);
        }
    };

    // Theo dõi thay đổi lớp học tiếp nhận, học kỳ, năm học để tự động gọi API load dữ liệu
    useEffect(() => {
        const cleanLop = getCleanLopName(formData.TEN_LOP);
        if (isOpen && cleanLop) {
            fetchPhanCongTheoLopHienTai(cleanLop, formData.HOC_KY, formData.NAM_HOC);
        }
    }, [isOpen, formData.TEN_LOP, formData.HOC_KY, formData.NAM_HOC]);

    // 3. Lọc danh mục form theo Nghề và Hệ đào tạo
    useEffect(() => {
        const { TEN_NGHE, HE_DAO_TAO, TEN_LOP } = formData;

        if (TEN_NGHE === 'Khoa ngoài') {
            const monKhoaNgoai = HE_DAO_TAO === 'Cao đẳng'
                ? [{ MA_MH_MD: '5H05', TEN_MH_MD: 'Tin học', STC: 3, SO_GIO: 75, LT: 15, TH: 57, KT: 3, PHONG_XUONG: 'P.303-P.306' }]
                : [{ MA_MH_MD: '4H05', TEN_MH_MD: 'Tin học', STC: 2, SO_GIO: 45, LT: 15, TH: 28, KT: 2, PHONG_XUONG: 'P.303-P.306' }];

            setFilteredMonHoc(monKhoaNgoai);
            setFilteredLopHoc([]);
            setFormData(prev => ({ ...prev, MA_MH_MD: monKhoaNgoai[0].MA_MH_MD }));

            const dsGVKhoaNgoai = allGiangVien.filter(
                gv => gv?.BO_MON === 'Công Nghệ Thông Tin' || gv?.BO_MON === 'Tiếng Anh'
            );
            setFilteredGiangVien(dsGVKhoaNgoai);
            return;
        }

        if (TEN_NGHE && HE_DAO_TAO) {
            const dsMH = allMonHoc.filter(
                item => item?.TEN_NGHE === TEN_NGHE && item?.HE_DAO_TAO === HE_DAO_TAO
            );
            setFilteredMonHoc(dsMH);

            const dsLop = allLopHoc.filter(
                item => item?.TEN_NGHE === TEN_NGHE && item?.HE_DAO_TAO === HE_DAO_TAO
            );
            setFilteredLopHoc(dsLop);

            let dsGV = [];
            if (TEN_NGHE === 'Công nghệ thông tin (UDPM)') {
                dsGV = allGiangVien.filter(gv => gv?.BO_MON === 'Công Nghệ Thông Tin' || gv?.BO_MON === 'Tiếng Anh');
            } else if (TEN_NGHE === 'Điện tử công nghiệp') {
                dsGV = allGiangVien.filter(gv => gv?.BO_MON === 'Điện tử' || gv?.BO_MON === 'Tiếng Anh');
            } else {
                dsGV = allGiangVien;
            }
            setFilteredGiangVien(dsGV);

            if (dsLop.length > 0 && (!TEN_LOP || !dsLop.some(l => getCleanLopName(l?.TEN_LOP) === getCleanLopName(TEN_LOP)))) {
                const firstLopClean = getCleanLopName(dsLop[0]?.TEN_LOP);
                setFormData(prev => ({ ...prev, TEN_LOP: firstLopClean, SI_SO: dsLop[0]?.SI_SO || 30 }));
            }
        }
    }, [formData.TEN_NGHE, formData.HE_DAO_TAO, allMonHoc, allLopHoc, allGiangVien]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const cleanVal = name === 'TEN_LOP' ? getCleanLopName(value) : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: cleanVal };
            if (name === 'TEN_LOP') {
                const found = allLopHoc.find(l => getCleanLopName(l?.TEN_LOP) === cleanVal);
                if (found) updated.SI_SO = found?.SI_SO || 30;
            }
            return updated;
        });
    };

    // 4. Lưu phân công (Optimistic UI + Cập nhật CSDL)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.MA_MH_MD) {
            alert('Vui lòng chọn Môn học / Mô-đun cần phân công!');
            return;
        }
        if (!formData.MA_GIANGVIEN) {
            alert('Vui lòng chọn Giảng viên đảm nhận!');
            return;
        }
        if (!formData.TEN_LOP || !formData.TEN_LOP.trim()) {
            alert('Vui lòng nhập hoặc chọn Lớp học tiếp nhận!');
            return;
        }

        const tenLopChuan = getCleanLopName(formData.TEN_LOP);
        const namHocChuan = String(formData.NAM_HOC || '').replace('Năm học ', '').trim();
        const hocKyChuan = formData.HOC_KY;
        const maMhChuan = String(formData.MA_MH_MD).trim();

        const currentList = Array.isArray(dsPhanCong) ? dsPhanCong : [];
        const monDaPhanCong = currentList.find(p => {
            const sameLop = getCleanLopName(p?.TEN_LOP).toLowerCase() === tenLopChuan.toLowerCase();
            const sameMH = String(p?.MA_MH_MD || '').trim().toLowerCase() === maMhChuan.toLowerCase();
            const sameNH = String(p?.NAM_HOC || '').replace('Năm học ', '').trim() === namHocChuan;
            const sameHK = p?.HOC_KY === hocKyChuan || (p?.HOC_KY === 1 && hocKyChuan === 'Học kỳ 1') || (p?.HOC_KY === 2 && hocKyChuan === 'Học kỳ 2');
            return sameLop && sameMH && sameNH && sameHK;
        });

        if (monDaPhanCong) {
            alert(`Môn học này đã được phân công cho lớp ${tenLopChuan}!`);
            return;
        }

        const mhChon = filteredMonHoc.find(m => String(m?.MA_MH_MD).trim() === maMhChuan) || {};
        const gvChon = filteredGiangVien.find(g => String(g?.MADN || g?.MA_GIANGVIEN).trim() === String(formData.MA_GIANGVIEN).trim()) || {};
        const soGioInt = mhChon?.SO_GIO || (formData.HE_DAO_TAO === 'Cao đẳng' ? 75 : 45);
        const stcInt = mhChon?.STC || (formData.HE_DAO_TAO === 'Cao đẳng' ? 3 : 2);

        const newItem = {
            ID: Date.now(),
            MA_MH_MD: maMhChuan,
            TEN_MH_MD: mhChon?.TEN_MH_MD || maMhChuan,
            STC: stcInt,
            SO_GIO: soGioInt,
            LT: mhChon?.LT || 0,
            TH: mhChon?.TH || 0,
            KT: 0,
            PHONG_XUONG: mhChon?.PHONG_XUONG || 'P.303-P.306',
            MA_GIANGVIEN: formData.MA_GIANGVIEN,
            TEN_GIANGVIEN: gvChon?.HOTEN || gvChon?.TEN_GIANGVIEN || formData.MA_GIANGVIEN,
            TEN_LOP: tenLopChuan,
            HOC_KY: hocKyChuan,
            NAM_HOC: namHocChuan,
            SI_SO: parseInt(formData.SI_SO, 10) || 30
        };

        setDsPhanCong(prev => [newItem, ...(Array.isArray(prev) ? prev : [])]);

        try {
            setIsSubmitting(true);
            const payload = {
                MA_GIANGVIEN: formData.MA_GIANGVIEN,
                MA_MH_MD: maMhChuan,
                TENLOP: tenLopChuan,
                HOCKY: hocKyChuan === 'Học kỳ 1' ? 1 : 2,
                NAMHOC: namHocChuan,
                GIO_DAY_THEO_PHAN_CONG: soGioInt,
                SISO_HSSV: parseInt(formData.SI_SO, 10) || 30,
                NGUOI_PHAN_CONG: localStorage.getItem('TEN_DANG_NHAP') || 'Tổ trưởng bộ môn'
            };

            const response = await api.post('/api/phan-cong/luu', payload);
            alert(response.data?.message || `Đã lưu phân công môn [${newItem.TEN_MH_MD}] vào cơ sở dữ liệu!`);
            
            await fetchPhanCongTheoLopHienTai(tenLopChuan, hocKyChuan, namHocChuan);
        } catch (error) {
            console.error('Lỗi khi lưu CSDL:', error);
            const errorMsg = error.response?.data?.message || error.message;
            alert('Lỗi máy chủ khi lưu: ' + errorMsg);
            setDsPhanCong(prev => prev.filter(p => p.ID !== newItem.ID));
        } finally {
            setIsSubmitting(false);
            setFormData(prev => ({
                ...prev,
                MA_MH_MD: formData.TEN_NGHE === 'Khoa ngoài' ? prev.MA_MH_MD : '',
                MA_GIANGVIEN: ''
            }));
        }
    };

    // 5. Xóa phân công
    const handleDeletePhanCong = async (id, tenMon) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy phân công môn [${tenMon || 'đã chọn'}] không?`)) {
            return;
        }
        try {
            const res = await api.delete(`/api/phan-cong/xoa/${id}`);
            if (res.data?.success) {
                alert('Đã xóa phân công khỏi cơ sở dữ liệu!');
                setDsPhanCong(prev => prev.filter(p => p.ID !== id));
            } else {
                alert('Không thể xóa: ' + (res.data?.message || 'Có lỗi xảy ra'));
            }
        } catch (error) {
            console.error('Lỗi khi xóa phân công qua API:', error);
            setDsPhanCong(prev => prev.filter(p => p.ID !== id));
        }
    };

    // 6. Xuất Excel gom nhóm theo Giảng viên
    const handleExportExcelTheoGiangVien = () => {
        const targetNH = String(formData.NAM_HOC || '').replace('Năm học ', '').trim();
        const dataToExport = dsPhanCong.filter(
            item => String(item?.NAM_HOC || '').replace('Năm học ', '').trim() === targetNH && 
                   (item?.HOC_KY === formData.HOC_KY || (item?.HOC_KY === 1 && formData.HOC_KY === 'Học kỳ 1') || (item?.HOC_KY === 2 && formData.HOC_KY === 'Học kỳ 2'))
        );

        if (dataToExport.length === 0) {
            alert(`Chưa có dữ liệu phân công trong ${formData.HOC_KY} (${targetNH}) để xuất Excel!`);
            return;
        }

        const groupedByGV = dataToExport.reduce((acc, curr) => {
            const gvName = curr?.TEN_GIANGVIEN || 'Chưa phân công';
            if (!acc[gvName]) acc[gvName] = [];
            acc[gvName].push(curr);
            return acc;
        }, {});

        let tableHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
           <head>
               <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
               <style>
                    th { background-color: #f1f5f9; font-weight: bold; border: 1px solid #94a3b8; padding: 6px; }
                    td { border: 1px solid #cbd5e1; padding: 6px; }
                   .gv-header { background-color: #fef08a; font-weight: bold; }
                   .text-center { text-align: center; }
               </style>
           </head>
           <body>
               <table border="1">
                   <thead>
                       <tr>
                           <th>TT</th>
                           <th>Lớp</th>
                           <th>Sĩ số</th>
                           <th>Mã MH, MĐ</th>
                           <th>Tên môn học, mô đun</th>
                           <th>Số tín chỉ</th>
                           <th>Số giờ</th>
                           <th>LT</th>
                           <th>TH</th>
                           <th>KT</th>
                           <th>Phòng/Xưởng</th>
                       </tr>
                   </thead>
                   <tbody>
        `;

        let stt = 1;
        Object.keys(groupedByGV).forEach((gvName) => {
            const listMon = groupedByGV[gvName];
            const tongGio = listMon.reduce((sum, item) => sum + (Number(item?.SO_GIO) || 0), 0);

            tableHTML += `
                <tr class="gv-header">
                   <td class="text-center">${stt}</td>
                   <td colspan="5" style="font-weight: bold; color: #1e3a8a;">${gvName}</td>
                   <td class="text-center" style="font-weight: bold;">${tongGio}</td>
                   <td></td><td></td><td></td><td></td>
                </tr>
            `;

            listMon.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td></td>
                        <td>${row?.TEN_LOP || ''}</td>
                        <td class="text-center">${row?.SI_SO || ''}</td>
                        <td class="text-center">${row?.MA_MH_MD || ''}</td>
                        <td>${row?.TEN_MH_MD || ''}</td>
                        <td class="text-center">${row?.STC || ''}</td>
                        <td class="text-center">${row?.SO_GIO || ''}</td>
                        <td class="text-center">${row?.LT || ''}</td>
                        <td class="text-center">${row?.TH || ''}</td>
                        <td class="text-center">${row?.KT || ''}</td>
                        <td>${row?.PHONG_XUONG || 'P.303-P.306'}</td>
                    </tr>
                `;
            });
            stt++;
        });

        tableHTML += `</tbody></table></body></html>`;

        const blob = new Blob(['\uFEFF' + tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bang_Phan_Cong_Theo_Giang_Vien_${formData.HOC_KY}_${targetNH}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 7. Xuất Excel Kế hoạch toàn khoa
    const handleExportExcelKeHoachToanKhoa = () => {
        const targetNH = String(formData.NAM_HOC || '').replace('Năm học ', '').trim();
        const dataToExport = dsPhanCong.filter(
            item => String(item?.NAM_HOC || '').replace('Năm học ', '').trim() === targetNH && 
                   (item?.HOC_KY === formData.HOC_KY || (item?.HOC_KY === 1 && formData.HOC_KY === 'Học kỳ 1') || (item?.HOC_KY === 2 && formData.HOC_KY === 'Học kỳ 2'))
        );

        if (dataToExport.length === 0) {
            alert(`Chưa có dữ liệu phân công trong ${formData.HOC_KY} (${targetNH}) để xuất Excel!`);
            return;
        }

        const groupedByLop = dataToExport.reduce((acc, curr) => {
            const lopName = curr?.TEN_LOP || 'Chưa rõ lớp';
            if (!acc[lopName]) acc[lopName] = [];
            acc[lopName].push(curr);
            return acc;
        }, {});

        const titleHK = formData.HOC_KY === 'Học kỳ 1' ? 'HK1' : 'HK2';

        let tableHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
           <head>
               <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
               <style>
                   .title { font-size: 16px; font-weight: bold; text-align: center; height: 35px; vertical-align: middle; }
                    th { background-color: #f1f5f9; font-weight: bold; border: 1px solid #64748b; padding: 6px; text-align: center; }
                    td { border: 1px solid #cbd5e1; padding: 6px; }
                   .row-chunhiem { font-weight: bold; background-color: #ffffff; }
                   .text-center { text-align: center; }
               </style>
           </head>
           <body>
               <table border="1">
                   <thead>
                       <tr>
                           <th colspan="12" class="title">KẾ HOẠCH PHÂN CÔNG GIÁO VIÊN ${titleHK}/${targetNH}</th>
                       </tr>
                       <tr>
                           <th>Khoa</th>
                           <th>Lớp</th>
                           <th>Sĩ số</th>
                           <th>Mã MH, MĐ</th>
                           <th>Tên môn học, mô đun</th>
                           <th>Số tín chỉ</th>
                           <th>Số giờ</th>
                           <th>LT</th>
                           <th>TH</th>
                           <th>KT</th>
                           <th>Nhà giáo giảng dạy</th>
                           <th>Phòng/Xưởng</th>
                       </tr>
                   </thead>
                   <tbody>
        `;

        Object.keys(groupedByLop).forEach((lopName) => {
            const listMon = groupedByLop[lopName];
            const siSo = listMon[0]?.SI_SO || 30;
            const khoa = lopName.includes('MAY') || lopName.includes('OTO') ? 'Khoa ngoài' : 'ĐT-TH';
            const tongSTC = listMon.reduce((sum, item) => sum + (Number(item?.STC) || 0), 0);
            const tongGio = listMon.reduce((sum, item) => sum + (Number(item?.SO_GIO) || 0), 0);
            const gvChuNhiem = listMon[0]?.TEN_GIANGVIEN || '';

            listMon.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td class="text-center">${khoa}</td>
                        <td class="text-center">${row?.TEN_LOP || ''}</td>
                        <td class="text-center">${row?.SI_SO || ''}</td>
                        <td class="text-center">${row?.MA_MH_MD || ''}</td>
                        <td>${row?.TEN_MH_MD || ''}</td>
                        <td class="text-center">${row?.STC || ''}</td>
                        <td class="text-center">${row?.SO_GIO || ''}</td>
                        <td class="text-center">${row?.LT || ''}</td>
                        <td class="text-center">${row?.TH || ''}</td>
                        <td class="text-center">${row?.KT || ''}</td>
                        <td style="font-weight: 500;">${row?.TEN_GIANGVIEN || ''}</td>
                        <td>${row?.PHONG_XUONG || 'P.303-P.306'}</td>
                    </tr>
                `;
            });

            tableHTML += `
                <tr class="row-chunhiem">
                   <td class="text-center">${khoa}</td>
                   <td class="text-center">${lopName}</td>
                   <td class="text-center">${siSo}</td>
                   <td></td>
                   <td style="font-weight: bold; color: #991b1b;">Chủ nhiệm</td>
                   <td class="text-center" style="font-weight: bold;">${tongSTC}</td>
                   <td class="text-center" style="font-weight: bold;">${tongGio}</td>
                   <td></td><td></td><td></td>
                   <td style="font-weight: bold;">${gvChuNhiem}</td>
                   <td></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></body></html>`;

        const blob = new Blob(['\uFEFF' + tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ke_Hoach_Phan_Cong_Giang_Day_Toan_Khoa_${titleHK}_${targetNH}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 8. Lọc danh sách hiển thị lên DataGridView được tối ưu chuẩn Unicode (khớp hoàn toàn chữ Đ)
    const dsPhanCongHienThi = useMemo(() => {
        const targetLopClean = getCleanLopName(formData.TEN_LOP).toLowerCase();
        const targetNHClean = String(formData.NAM_HOC || '').replace('Năm học ', '').trim();
        const targetHKClean = String(formData.HOC_KY || '').trim();

        const currentList = Array.isArray(dsPhanCong) ? dsPhanCong : [];
        return currentList.filter(item => {
            const itemLopClean = getCleanLopName(item?.TEN_LOP).toLowerCase();
            const itemNHClean = String(item?.NAM_HOC || '').replace('Năm học ', '').trim();
            const itemHKClean = String(item?.HOC_KY || '').trim();

            const sameLop = itemLopClean === targetLopClean;
            const sameNH = itemNHClean === targetNHClean;
            const sameHK = (itemHKClean === targetHKClean) ||
                          (itemHKClean === '1' && targetHKClean === 'Học kỳ 1') ||
                          (itemHKClean === '2' && targetHKClean === 'Học kỳ 2');

            return sameLop && sameNH && sameHK;
        });
    }, [dsPhanCong, formData.TEN_LOP, formData.NAM_HOC, formData.HOC_KY]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 md:p-5">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-100">
                
                {/* TIÊU ĐỀ */}
                <div className="bg-blue-600 px-6 py-4 relative text-center shrink-0">
                   <h3 className="text-lg font-black uppercase tracking-wider text-[#FFD700]">
                       PHÂN CÔNG GIẢNG DẠY
                   </h3>
                   {onClose && (
                       <button 
                           type="button" 
                           onClick={onClose} 
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-lg transition"
                       >
                           ✕
                       </button>
                    )}
                </div>

                <div className="overflow-y-auto p-5 md:p-6 space-y-5">
                    
                    {/* FORM PHÂN CÔNG */}
                    <form onSubmit={handleSubmit} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* BỘ MÔN / NGHỀ */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    BỘ MÔN / NGHỀ (*)
                                </label>
                                <select 
                                   name="TEN_NGHE"
                                   value={formData.TEN_NGHE}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                   {danhSachNghe.map((nghe, idx) => (
                                       <option key={idx} value={nghe}>{nghe}</option>
                                    ))}
                                </select>
                            </div>

                            {/* HỆ ĐÀO TẠO */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    HỆ ĐÀO TẠO (*)
                                </label>
                                <select 
                                   name="HE_DAO_TAO"
                                   value={formData.HE_DAO_TAO}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                   {danhSachHeDaoTao.map((he, idx) => (
                                       <option key={idx} value={he}>{he}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* NĂM HỌC */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    NĂM HỌC (*)
                                </label>
                                <select 
                                   name="NAM_HOC"
                                   value={formData.NAM_HOC}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                   {danhSachNamHoc.map((nh, idx) => (
                                       <option key={idx} value={nh}>Năm học {nh}</option>
                                    ))}
                                </select>
                            </div>

                            {/* HỌC KỲ */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    HỌC KỲ (*)
                                </label>
                                <select 
                                   name="HOC_KY"
                                   value={formData.HOC_KY}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                   {danhSachHocKy.map((hk, idx) => (
                                       <option key={idx} value={hk}>{hk}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* MÔN HỌC / MÔ-ĐUN */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                DANH MỤC MÔN HỌC THEO NGHỀ (*)
                            </label>
                            {formData.TEN_NGHE === 'Khoa ngoài' ? (
                                <div className="w-full px-3.5 py-2.5 border border-blue-300 rounded-xl text-sm font-bold text-blue-800 bg-blue-50 shadow-inner">
                                   {formData.HE_DAO_TAO === 'Cao đẳng' ? '5H05 - Tin học (75 giờ)' : '4H05 - Tin học (45 giờ)'}
                                    <span className="text-xs font-normal text-blue-600 ml-2">(Ràng buộc tự động Khoa ngoài)</span>
                                </div>
                            ) : (
                                <select 
                                   name="MA_MH_MD"
                                   value={formData.MA_MH_MD}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                    <option value="">-- Chọn Môn học / Mô-đun ({filteredMonHoc.length} môn) --</option>
                                   {filteredMonHoc.map((mh, idx) => (
                                       <option key={idx} value={mh?.MA_MH_MD}>
                                           {mh?.MA_MH_MD} - {mh?.TEN_MH_MD} ({mh?.SO_GIO} giờ)
                                       </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* GIẢNG VIÊN ĐẢM NHẬN */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    GIẢNG VIÊN ĐỦ ĐIỀU KIỆN ({filteredGiangVien.length} GV) (*)
                                </label>
                                <select 
                                   name="MA_GIANGVIEN"
                                   value={formData.MA_GIANGVIEN}
                                   onChange={handleChange}
                                    required
                                   className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                >
                                    <option value="">-- Chọn Giảng viên ({filteredGiangVien.length} GV) --</option>
                                   {filteredGiangVien.map(gv => (
                                       <option key={gv?.MADN || gv?.MA_GIANGVIEN} value={gv?.MADN || gv?.MA_GIANGVIEN}>
                                           {gv?.HOTEN || gv?.TEN_GIANGVIEN} ({gv?.MADN || gv?.MA_GIANGVIEN}) {gv?.BO_MON === 'Tiếng Anh' ? '- [Tiếng Anh]' : ''}
                                       </option>
                                    ))}
                                </select>
                            </div>

                            {/* LỚP HỌC TIẾP NHẬN */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    LỚP HỌC TIẾP NHẬN (*)
                                </label>
                                {formData.TEN_NGHE === 'Khoa ngoài' ? (
                                    <input 
                                       type="text"
                                       name="TEN_LOP"
                                       placeholder="Nhập tên lớp Khoa ngoài (ví dụ: CD20 MAY A)..."
                                       value={formData.TEN_LOP}
                                       onChange={handleChange}
                                       required
                                       className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl text-sm font-bold text-slate-800 bg-amber-50 focus:outline-none focus:border-amber-500 shadow-sm"
                                    />
                                ) : (
                                    <select 
                                       name="TEN_LOP"
                                       value={getCleanLopName(formData.TEN_LOP)}
                                       onChange={handleChange}
                                       required
                                       className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                                    >
                                       <option value="">-- Chọn Lớp ({filteredLopHoc.length} lớp) --</option>
                                       {filteredLopHoc.map((lop, idx) => {
                                           const tenLopChuan = getCleanLopName(lop?.TEN_LOP);
                                           return (
                                               <option key={idx} value={tenLopChuan}>
                                                   {tenLopChuan} {lop?.SI_SO ? `(Sĩ số: ${lop.SI_SO})` : ''}
                                               </option>
                                            );
                                        })}
                                   </select>
                                )}
                            </div>
                        </div>

                        {/* NÚT THAO TÁC & XUẤT EXCEL */}
                        <div className="pt-2 flex flex-wrap justify-end gap-3">
                            <button
                               type="button"
                               onClick={handleExportExcelTheoGiangVien}
                               className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Excel Theo Giảng Viên
                            </button>

                            <button
                               type="button"
                               onClick={handleExportExcelKeHoachToanKhoa}
                               className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Excel Kế Hoạch Toàn Khoa
                            </button>

                            <button
                               type="submit"
                               disabled={isSubmitting}
                               className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-70 active:scale-[0.98]"
                            >
                                {isSubmitting ? 'Đang lưu vào SQL Server...' : 'Lưu CSDL'}
                            </button>
                        </div>
                    </form>

                    {/* BẢNG HIỂN THỊ CÁC MÔN ĐÃ PHÂN CÔNG */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                                    DANH SÁCH ĐÃ PHÂN CÔNG LỚP: <span className="text-blue-600">{getCleanLopName(formData.TEN_LOP) || '---'}</span>
                                </span> 
                                <span className="text-xs text-slate-500 ml-2 font-medium">
                                    ({formData.HOC_KY} - Năm học {formData.NAM_HOC})
                                </span> 
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                                Đã phân công: {dsPhanCongHienThi.length} môn
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">STT</th>
                                        <th className="py-3 px-4">MÃ MH</th>
                                        <th className="py-3 px-4">TÊN MÔN HỌC / MÔ-ĐUN</th>
                                        <th className="py-3 px-4">GIẢNG VIÊN ĐẢM NHẬN</th>
                                        <th className="py-3 px-4 text-center">STC</th>
                                        <th className="py-3 px-4 text-center">SỐ GIỜ</th>
                                        <th className="py-3 px-4 text-center">TÁC VỤ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium bg-white">
                                   {loadingGrid ? (
                                       <tr>
                                           <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                                               Đang tải dữ liệu từ cơ sở dữ liệu SQL Server...
                                           </td>
                                       </tr>
                                    ) : dsPhanCongHienThi.length > 0 ? (
                                       dsPhanCongHienThi.map((row, index) => (
                                           <tr key={row?.ID || index} className="hover:bg-blue-50/50 transition">
                                               <td className="py-3 px-4 text-slate-500 font-bold">{index + 1}</td>
                                               <td className="py-3 px-4 font-bold text-slate-900">{row?.MA_MH_MD || '---'}</td>
                                               <td className="py-3 px-4 font-bold text-blue-700">{row?.TEN_MH_MD}</td>
                                               <td className="py-3 px-4">
                                                   <span className="font-bold text-slate-800">{row?.TEN_GIANGVIEN}</span>
                                                   {row?.MA_GIANGVIEN && (
                                                       <span className="text-slate-400 ml-1">({row.MA_GIANGVIEN})</span>
                                                   )}
                                               </td>
                                               <td className="py-3 px-4 text-center font-bold text-slate-700">{row?.STC || '-'}</td>
                                               <td className="py-3 px-4 text-center font-bold text-indigo-600">{row?.SO_GIO ? `${row.SO_GIO} giờ` : '-'}</td>
                                               <td className="py-3 px-4 text-center">
                                                   <button
                                                       type="button"
                                                       onClick={() => handleDeletePhanCong(row?.ID, row?.TEN_MH_MD)}
                                                       className="text-rose-500 hover:text-rose-700 font-bold hover:underline"
                                                   >
                                                       Xóa
                                                   </button>
                                               </td>
                                           </tr>
                                        ))
                                    ) : (
                                       <tr>
                                           <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                                               Chưa có môn nào được phân công cho lớp {getCleanLopName(formData.TEN_LOP) || 'này'} trong {formData.HOC_KY} ({formData.NAM_HOC}).
                                           </td>
                                       </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export { QuanLyPhanCong };
export default QuanLyPhanCong;