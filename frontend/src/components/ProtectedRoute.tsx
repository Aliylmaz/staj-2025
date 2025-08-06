import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('ProtectedRoute: Checking authentication...');
  console.log('ProtectedRoute: token exists:', !!token);
  console.log('ProtectedRoute: userRole:', userRole);
  console.log('ProtectedRoute: allowedRoles:', allowedRoles);

  // Check if user is authenticated
  if (!token) {
    console.log('ProtectedRoute: No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has the correct role
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: User role is not allowed, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Authentication successful, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute; 