// Danh mục toàn bộ tài khoản và phân quyền trong Khoa Điện tử - Tin học
export const SPECIAL_ACCOUNTS = {
    // 1. Ban Chủ nhiệm Khoa
    'GV018': { role: 'TRUONG_KHOA', name: 'Trần Hiếu Nghĩa', title: 'Trưởng khoa', chuyenNganh: 'Điện tử' },
    'truongkhoa': { role: 'TRUONG_KHOA', name: 'Trần Hiếu Nghĩa', title: 'Trưởng khoa', chuyenNganh: 'Điện tử' },

    // 2. Trưởng các Bộ môn
    'GV004': { role: 'TO_TRUONG_BM', name: 'Đinh Thị Thu', title: 'Trưởng BM CNTT', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV008': { role: 'TO_TRUONG_BM', name: 'Lê Tấn Hòa', title: 'Trưởng BM Điện tử', chuyenNganh: 'Điện tử' },

    // 3. Thư ký Khoa
    'GV025': { role: 'THU_KY', name: 'Lê Đức An', title: 'Thư ký khoa', chuyenNganh: 'Văn phòng Khoa' },
    'thuky': { role: 'THU_KY', name: 'Lê Đức An', title: 'Thư ký khoa', chuyenNganh: 'Văn phòng Khoa' },

    // 4. Giảng viên Bộ môn Công Nghệ Thông Tin
    'GV001': { role: 'GIANG_VIEN', name: 'Nguyễn Lê Ngọc Thành', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'giaovien': { role: 'GIANG_VIEN', name: 'Nguyễn Lê Ngọc Thành', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV002': { role: 'GIANG_VIEN', name: 'Lê Thị Kim Oanh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV007': { role: 'GIANG_VIEN', name: 'Lê Thị Hòa', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV009': { role: 'GIANG_VIEN', name: 'Dương Văn Vinh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV010': { role: 'GIANG_VIEN', name: 'Nguyễn Bích Hà', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV012': { role: 'GIANG_VIEN', name: 'Nguyễn Thị Thanh Thắng', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV014': { role: 'GIANG_VIEN', name: 'Huỳnh Thị Hồng Sinh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },

    // 5. Giảng viên Bộ môn Điện tử
    'GV003': { role: 'GIANG_VIEN', name: 'Nguyễn Văn Đại', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV005': { role: 'GIANG_VIEN', name: 'Nguyễn Giang Long', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV006': { role: 'GIANG_VIEN', name: 'Lương Thanh Long', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV019': { role: 'GIANG_VIEN', name: 'Dư Vĩ Bằng', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV020': { role: 'GIANG_VIEN', name: 'Đào Thị Thúy Dung', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV021': { role: 'GIANG_VIEN', name: 'Thái Thiên Ân', title: 'Giảng viên', chuyenNganh: 'Điện tử' },

    // 6. Giảng viên Tiếng Anh
    'GV022': { role: 'GIANG_VIEN', name: 'Bùi Thị Thu Hà', title: 'Giảng viên', chuyenNganh: 'Tiếng Anh' },
    'GV023': { role: 'GIANG_VIEN', name: 'Trì Thị Kim Hồng', title: 'Giảng viên', chuyenNganh: 'Tiếng Anh' }
};

// Hàm chuẩn hóa và xác định quyền hạn người dùng (Đã bít kín lỗ hổng không trả về mặc định)
export const getUserRole = (user) => {
    if (!user) return 'GUEST';

    const maDN = (user.MADN || user.username || user.maGV || '').toString().trim().toUpperCase();
    const rawUserLower = (user.username || user.MADN || '').toString().trim().toLowerCase();

    // 1. Kiểm tra đối chiếu trực tiếp theo mã GV / username trong danh sách chuẩn
    if (SPECIAL_ACCOUNTS[maDN]) return SPECIAL_ACCOUNTS[maDN].role;
    if (SPECIAL_ACCOUNTS[rawUserLower]) return SPECIAL_ACCOUNTS[rawUserLower].role;

    // 2. Kiểm tra fallback theo chuỗi role lưu trong session (nếu có định nghĩa rõ ràng)
    const rawRole = (user.role || '').toString().trim().toLowerCase();
    if (rawRole.includes('trưởng khoa') || rawRole.includes('truong_khoa') || rawRole.includes('truongkhoa')) {
        return 'TRUONG_KHOA';
    }
    if (rawRole.includes('bộ môn') || rawRole.includes('to_truong') || rawRole.includes('totruong')) {
        return 'TO_TRUONG_BM';
    }
    if (rawRole.includes('thư ký') || rawRole.includes('thu_ky') || rawRole.includes('thuky')) {
        return 'THU_KY';
    }
    if (rawRole.includes('giang_vien') || rawRole.includes('giáo viên')) {
        return 'GIANG_VIEN';
    }

    // 🛑 CHỐT CHẶN TUYỆT ĐỐI: Không cho phép lọt qua nếu không khớp danh sách thực tế
    return 'GUEST';
};

// Hàm kiểm tra quyền hạn truy cập
export const hasPermission = (user, allowedRoles = []) => {
    if (!user) return false;
    const userRole = getUserRole(user);
    return allowedRoles.includes(userRole);
};