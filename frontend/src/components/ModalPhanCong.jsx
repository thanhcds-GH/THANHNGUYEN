import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';

const ModalPhanCong = ({ isOpen, onClose, onSuccess, defaultNamHoc = '2026-2027', defaultHocKy = 1 }) => {
    const [maBoMon, setMaBoMon] = useState('');
    const [heDaoTao, setHeDaoTao] = useState('Cao đẳng'); // 'Cao đẳng' hoặc 'Trung cấp'
    const [maDmMhmd, setMaDmMhmd] = useState('');
    const [maGiangVien, setMaGiangVien] = useState('');
    const [maLop, setMaLop] = useState('');
    const [soGio, setSoGio] = useState(0);
    const [siSo, setSiSo] = useState(30);

    const [dsMonHoc, setDsMonHoc] = useState([]);
    const [dsGiangVien, setDsGiangVien] = useState([]);
    const [dsLopHoc, setDsLopHoc] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. TẢI DANH SÁCH GIẢNG VIÊN ĐỦ ĐIỀU KIỆN KHI MỞ MODAL HOẶC ĐỔI BỘ MÔN
    useEffect(() => {
        if (isOpen) {
            let paramBoMon = '';
            if (maBoMon === 'CNTT' || maBoMon === 'KHOA_NGOAI') {
                paramBoMon = 'Công nghệ thông tin';
            } else if (maBoMon === 'DTCN') {
                paramBoMon = 'Điện tử';
            }

            api.get('/api/phan-cong/giang-vien', { params: { boMon: paramBoMon } })
                .then(res => setDsGiangVien(res.data?.data || []))
                .catch(err => console.error("Lỗi lấy danh sách giảng viên:", err));
        }
    }, [isOpen, maBoMon]);

    // 2. XỬ LÝ NGOẠI LỆ: KHOA NGOÀI TỰ ĐỘNG KHÓA MÔN TIN HỌC THEO HỆ ĐÀO TẠO
    useEffect(() => {
        if (maBoMon === 'KHOA_NGOAI') {
            if (heDaoTao === 'Cao đẳng') {
                setMaDmMhmd('5H05');
                setSoGio(75);
            } else {
                setMaDmMhmd('4H05');
                setSoGio(45);
            }
        }
    }, [maBoMon, heDaoTao]);

    // 3. XỬ LÝ KHI CHỌN BỘ MÔN / NGHỀ
    const handleBoMonChange = async (e) => {
        const selectedBoMon = e.target.value;
        setMaBoMon(selectedBoMon);
        setMaDmMhmd('');
        setMaLop('');

        if (!selectedBoMon) {
            setDsMonHoc([]);
            setDsLopHoc([]);
            return;
        }

        if (selectedBoMon === 'KHOA_NGOAI') {
            setDsMonHoc([]);
            setDsLopHoc([]);
            return;
        }

        // Nếu là các bộ môn nội bộ trong khoa: tải danh mục môn và danh sách lớp
        setLoading(true);
        try {
            const resMon = await api.get(`/api/phan-cong/mon-hoc/${selectedBoMon}`);
            setDsMonHoc(resMon.data?.data || resMon.data || []);

            const resLop = await api.get(`/api/phan-cong/lop-hoc/${selectedBoMon}`);
            setDsLopHoc(resLop.data?.data || resLop.data || []);
        } catch (error) {
            console.error("Lỗi lọc danh mục theo Bộ môn:", error);
        } finally {
            setLoading(false);
        }
    };

    // 4. XỬ LÝ CHỌN MÔN TRONG KHOA ĐỂ TỰ LẤY SỐ GIỜ
    const handleMonHocChange = (e) => {
        const val = e.target.value;
        setMaDmMhmd(val);
        const selected = dsMonHoc.find(m => String(m.MA_MH_MD || m.MA_DM_MHMD) === String(val));
        if (selected) {
            setSoGio(selected.SO_GIO || (selected.SO_TIN_CHI ? selected.SO_TIN_CHI * 15 : 45));
        }
    };

    // 5. GỬI DỮ LIỆU PHÂN CÔNG XUỐNG CSDL
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!maBoMon || !maDmMhmd || !maGiangVien || !maLop.trim()) {
            alert("⚠️ Vui lòng điền đầy đủ các trường thông tin bắt buộc!");
            return;
        }

        try {
            const payload = {
                MA_GIANGVIEN: maGiangVien, // Mã đăng nhập hoặc số ID
                MA_MH_MD: maDmMhmd,
                MALOP: maLop.trim(),
                HOCKY: defaultHocKy,
                NAMHOC: defaultNamHoc,
                GIO_DAY_THEO_PHAN_CONG: soGio,
                SISO_HSSV: parseInt(siSo, 10) || 30,
                NGUOI_PHAN_CONG: localStorage.getItem('TEN_DANG_NHAP') || 'Tổ trưởng bộ môn'
            };

            const res = await api.post('/api/phan-cong/luu', payload);

            alert("🎉 " + (res.data?.message || "Lưu phân công vào CSDL thành công!"));
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi lưu phân công:", error);
            alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff', width: '90%', maxWidth: '640px',
                borderRadius: '8px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.25)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#1a56db', fontWeight: 'bold' }}>TẠO PHÂN CÔNG GIẢNG DẠY</h4>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* BỘ MÔN & HỆ ĐÀO TẠO */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>1. Bộ môn / Nghề (*):</label>
                            <select
                                className="form-select"
                                value={maBoMon}
                                onChange={handleBoMonChange}
                                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Chọn Bộ môn / Nghề --</option>
                                <option value="CNTT">Công nghệ thông tin (UDPM)</option>
                                <option value="DTCN">Điện tử công nghiệp</option>
                                <option value="SCLRMT">KTSC, LRMT</option>
                                <option value="KHOA_NGOAI">Khoa ngoài (Ngoại lệ)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>2. Hệ đào tạo (*):</label>
                            <select
                                className="form-select"
                                value={heDaoTao}
                                onChange={e => setHeDaoTao(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Cao đẳng">Cao đẳng</option>
                                <option value="Trung cấp">Trung cấp</option>
                            </select>
                        </div>
                    </div>

                    {/* MÔN HỌC / MÔ-ĐUN */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>3. Môn học / Mô-đun (*):</label>
                        {maBoMon === 'KHOA_NGOAI' ? (
                            <input
                                type="text"
                                readOnly
                                value={heDaoTao === 'Cao đẳng' ? '5H05 - Tin học (75 giờ)' : '4H05 - Tin học (45 giờ)'}
                                style={{
                                    width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px',
                                    border: '1px solid #93c5fd', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '600'
                                }}
                            />
                        ) : (
                            <select
                                className="form-select"
                                value={maDmMhmd}
                                onChange={handleMonHocChange}
                                disabled={!maBoMon || loading}
                                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Chọn Môn học / Mô-đun --</option>
                                {dsMonHoc.map(mh => (
                                    <option key={mh.MA_MH_MD || mh.MA_DM_MHMD} value={mh.MA_MH_MD || mh.MA_DM_MHMD}>
                                        {mh.MA_MH_MD || mh.MAMON} - {mh.TEN_MH_MD || mh.TEN_MON_HOC} ({mh.SO_GIO || (mh.SO_TIN_CHI * 15)} giờ)
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* GIẢNG VIÊN ĐẢM NHẬN */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>4. Giảng viên đảm nhận (*):</label>
                        <select
                            className="form-select"
                            value={maGiangVien}
                            onChange={e => setMaGiangVien(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- Chọn Giảng viên phân công --</option>
                            {dsGiangVien.map(gv => (
                                <option key={gv.MADN || gv.MA_GIANGVIEN} value={gv.MADN || gv.MA_GIANGVIEN}>
                                    {gv.HOTEN} ({gv.MADN}) - Tổ: {gv.BO_MON}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* LỚP HỌC & SĨ SỐ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>5. Lớp học tiếp nhận (*):</label>
                            {maBoMon === 'KHOA_NGOAI' ? (
                                <input
                                    type="text"
                                    placeholder="Nhập tên lớp Khoa ngoài (ví dụ: CD20 MAY A)..."
                                    value={maLop}
                                    onChange={e => setMaLop(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px',
                                        border: '1px solid #f59e0b', backgroundColor: '#fffbeb'
                                    }}
                                />
                            ) : (
                                <select
                                    className="form-select"
                                    value={maLop}
                                    onChange={e => setMaLop(e.target.value)}
                                    disabled={!maBoMon || loading}
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">-- Chọn Lớp --</option>
                                    {dsLopHoc.map(lop => (
                                        <option key={lop.MA_LOP || lop.MALOP} value={lop.MA_LOP || lop.MALOP}>
                                            {lop.TEN_LOP || lop.MALOP} ({lop.HE_DAO_TAO || 'Lớp'})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Sĩ số HSSV:</label>
                            <input
                                type="number"
                                min="1"
                                value={siSo}
                                onChange={e => setSiSo(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    {/* NÚT THAO TÁC */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '8px 18px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Lưu CSDL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalPhanCong;