import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Check if user is authenticated
  if (!token) {
    console.log('🚫 ProtectedRoute - No token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('🚫 ProtectedRoute - User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ ProtectedRoute - Authentication successful, rendering children');
  return <>{children}</>;
} 