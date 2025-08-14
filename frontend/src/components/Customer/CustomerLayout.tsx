import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      path: '/customer/dashboard',
      description: 'Overview of your insurance account'
    },
    { 
      id: 'offers', 
      label: 'Offers', 
      icon: '📋', 
      path: '/customer/offers',
      description: 'Manage your insurance offers and requests'
    },
    { 
      id: 'policies', 
      label: 'My Policies', 
      icon: '📄', 
      path: '/customer/policies',
      description: 'View and manage your active policies'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: '💰', 
      path: '/customer/payments',
      description: 'Track your payment history and make payments'
    },
    { 
      id: 'claims', 
      label: 'My Claims', 
      icon: '🔧', 
      path: '/customer/claims',
      description: 'Submit and track your insurance claims'
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: '📁', 
      path: '/customer/documents',
      description: 'Upload and manage your documents'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤', 
      path: '/customer/profile',
      description: 'Update your personal information'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">Insurceed</div>
          <div className="sidebar-subtitle">Customer Portal</div>
        </div>
        
        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Modules</div>
            
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                  title={item.description}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* User Actions */}
          <div className="nav-section">
            <div className="nav-section-title">Account</div>
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left"
            >
              <span className="nav-item-icon">🚪</span>
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-with-sidebar">
        {/* Top Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="flex items-center space-x-4">
              <h1 className="header-title">Insurceed</h1>
              <span className="text-gray-300 text-sm">Customer Management Platform</span>
            </div>
            <div className="header-actions">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-300">Welcome back</div>
                  <div className="text-white font-semibold">Customer</div>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="main-content-scrollable">
          <div className="scrollable-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout; 