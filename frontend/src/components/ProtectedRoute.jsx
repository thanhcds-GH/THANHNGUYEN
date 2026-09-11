import React from 'react';
import { Navigate } from 'react-router-dom';
import { SPECIAL_ACCOUNTS, getUserRole } from '../utils/authRoles';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('currentUser');

    // 1. Nếu chưa đăng nhập -> Đẩy về trang login ngay lập tức
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const currentUser = JSON.parse(userStr);
        const userKey = (currentUser.MADN || currentUser.username || '').trim();
        const upperKey = userKey.toUpperCase();
        const lowerKey = userKey.toLowerCase();

        // 2. KIỂM TRA BẢO MẬT TUYỆT ĐỐI (WHITELIST CHECK):
        // Bắt buộc mã đăng nhập phải tồn tại trong danh sách 19 giảng viên / tài khoản đặc biệt của Khoa.
        const isValidAccount = SPECIAL_ACCOUNTS[userKey] || SPECIAL_ACCOUNTS[upperKey] || SPECIAL_ACCOUNTS[lowerKey];

        if (!isValidAccount) {
            // Nếu là tài khoản bậy bạ (như abcxyz, 123abc...), lập tức xóa sạch session và đá văng!
            localStorage.removeItem('currentUser');
            return <Navigate to="/login" replace />;
        }

        // 3. Kiểm tra phân quyền vai trò (Role Check)
        const userRole = getUserRole(currentUser);
        if (userRole === 'GUEST') {
            localStorage.removeItem('currentUser');
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            alert('⛔ Tài khoản không có quyền truy cập vào phân hệ này!');
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    } catch (error) {
        console.error('Lỗi xác thực bảo mật:', error);
        localStorage.removeItem('currentUser');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;