import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">I</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">InsuranceApp</h1>
              <p className="text-sm text-gray-400">Customer Portal</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Main Modules
            </h3>
          </div>
          
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 group ${
                  isActivePath(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={`text-lg ${isActivePath(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isActivePath(item.path) ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                  <p className={`text-xs ${isActivePath(item.path) ? 'text-blue-100' : 'text-gray-500'} mt-0.5`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-80 p-4 border-t border-gray-700 bg-gray-900">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-3 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {navigationItems.find(item => isActivePath(item.path))?.description || 'Welcome to your insurance portal'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Customer Portal</p>
                <p className="text-xs text-gray-500">Welcome back!</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout; 