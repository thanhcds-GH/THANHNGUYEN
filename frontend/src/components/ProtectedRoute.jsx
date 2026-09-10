import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/authRoles';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('currentUser');

    // Chưa đăng nhập -> Điều hướng về Login
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const currentUser = JSON.parse(userStr);
        const userRole = getUserRole(currentUser);

        // Nếu có khai báo danh sách quyền và quyền hiện tại không khớp
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            alert('⛔ Tài khoản không có quyền truy cập vào phân hệ này!');
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    } catch (error) {
        console.error('Lỗi phân quyền:', error);
        localStorage.removeItem('currentUser');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;