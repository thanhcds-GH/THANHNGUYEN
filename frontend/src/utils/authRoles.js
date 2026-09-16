// Danh mục toàn bộ tài khoản, mật khẩu và phân quyền trong Khoa Điện tử - Tin học
export const SPECIAL_ACCOUNTS = {
    // 1. Ban Chủ nhiệm Khoa
    'GV018': { password: '123', role: 'TRUONG_KHOA', name: 'Trần Hiếu Nghĩa', title: 'Trưởng khoa', chuyenNganh: 'Điện tử' },
    'truongkhoa': { password: '123', role: 'TRUONG_KHOA', name: 'Trần Hiếu Nghĩa', title: 'Trưởng khoa', chuyenNganh: 'Điện tử' },

    // 2. Trưởng các Bộ môn
    'GV004': { password: '123', role: 'TO_TRUONG_BM', name: 'Đinh Thị Thu', title: 'Trưởng BM CNTT', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV008': { password: '123', role: 'TO_TRUONG_BM', name: 'Lê Tấn Hòa', title: 'Trưởng BM Điện tử', chuyenNganh: 'Điện tử' },

    // 3. Thư ký Khoa
    'GV025': { password: '123', role: 'THU_KY', name: 'Lê Đức An', title: 'Thư ký khoa', chuyenNganh: 'Văn phòng Khoa' },
    'thuky': { password: '123', role: 'THU_KY', name: 'Lê Đức An', title: 'Thư ký khoa', chuyenNganh: 'Văn phòng Khoa' },

    // 4. Giảng viên Bộ môn Công Nghệ Thông Tin
    'GV001': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Lê Ngọc Thành', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'giaovien': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Lê Ngọc Thành', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV002': { password: '123', role: 'GIANG_VIEN', name: 'Lê Thị Kim Oanh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV007': { password: '123', role: 'GIANG_VIEN', name: 'Lê Thị Hòa', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV009': { password: '123', role: 'GIANG_VIEN', name: 'Dương Văn Vinh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV010': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Bích Hà', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV012': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Thị Thanh Thắng', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },
    'GV014': { password: '123', role: 'GIANG_VIEN', name: 'Huỳnh Thị Hồng Sinh', title: 'Giảng viên', chuyenNganh: 'Công Nghệ Thông Tin' },

    // 5. Giảng viên Bộ môn Điện tử
    'GV003': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Văn Đại', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV005': { password: '123', role: 'GIANG_VIEN', name: 'Nguyễn Giang Long', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV006': { password: '123', role: 'GIANG_VIEN', name: 'Lương Thanh Long', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV019': { password: '123', role: 'GIANG_VIEN', name: 'Dư Vĩ Bằng', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV020': { password: '123', role: 'GIANG_VIEN', name: 'Đào Thị Thúy Dung', title: 'Giảng viên', chuyenNganh: 'Điện tử' },
    'GV021': { password: '123', role: 'GIANG_VIEN', name: 'Thái Thiên Ân', title: 'Giảng viên', chuyenNganh: 'Điện tử' },

    // 6. Giảng viên Tiếng Anh
    'GV022': { password: '123', role: 'GIANG_VIEN', name: 'Bùi Thị Thu Hà', title: 'Giảng viên', chuyenNganh: 'Tiếng Anh' },
    'GV023': { password: '123', role: 'GIANG_VIEN', name: 'Trì Thị Kim Hồng', title: 'Giảng viên', chuyenNganh: 'Tiếng Anh' }
};

// 🔒 HÀM XÁC THỰC ĐĂNG NHẬP BẢO MẬT (Kiểm tra nghiêm ngặt Cả Mã Đăng Nhập lẫn Mật Khẩu)
export const verifyLogin = (madn, password) => {
    if (!madn || !password) return null;

    const cleanMaDN = madn.toString().trim().toUpperCase();
    const cleanMaDNCapLow = madn.toString().trim().toLowerCase();

    // Tìm tài khoản theo mã viết hoa hoặc viết thường
    const account = SPECIAL_ACCOUNTS[cleanMaDN] || SPECIAL_ACCOUNTS[cleanMaDNCapLow];

    if (!account) {
        return null; // Không tồn tại mã đăng nhập
    }

    // Đối chiếu chính xác mật khẩu (so sánh chuỗi trực tiếp, phân biệt chữ hoa/thường)
    if (account.password !== password.toString().trim()) {
        return null; // Sai mật khẩu
    }

    // Trả về thông tin người dùng nếu vượt qua mọi tầng kiểm tra bảo mật
    return {
        MADN: cleanMaDN,
        HOTEN: account.name,
        role: account.role,
        title: account.title,
        chuyenNganh: account.chuyenNganh
    };
};

// Hàm chuẩn hóa và xác định quyền hạn người dùng
export const getUserRole = (user) => {
    if (!user) return 'GUEST';

    const maDN = (user.MADN || user.username || user.maGV || '').toString().trim().toUpperCase();
    const rawUserLower = (user.username || user.MADN || '').toString().trim().toLowerCase();

    if (SPECIAL_ACCOUNTS[maDN]) return SPECIAL_ACCOUNTS[maDN].role;
    if (SPECIAL_ACCOUNTS[rawUserLower]) return SPECIAL_ACCOUNTS[rawUserLower].role;

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

    return 'GUEST';
};

// Hàm kiểm tra quyền hạn truy cập
export const hasPermission = (user, allowedRoles = []) => {
    if (!user) return false;
    const userRole = getUserRole(user);
    return allowedRoles.includes(userRole);
};