import type { Role } from "../../hooks/useRole";

interface SidebarProps {
  role: Role;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ role, currentPage, onPageChange }: SidebarProps) {
  const getMenuItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { id: "dashboard", label: "Dashboard", icon: "📊", description: "Overview & analytics" },
          { id: "users", label: "User Management", icon: "👥", description: "Manage all users" },
        ];
      case "AGENT":
        return [
          { id: "dashboard", label: "Dashboard", icon: "📊", description: "Overview & analytics" },
          { id: "customers", label: "My Customers", icon: "👤", description: "Manage customers" },
          { id: "policies", label: "Policies", icon: "📄", description: "Insurance policies" },
          { id: "offers", label: "Offers", icon: "📝", description: "Create offers" },
        ];
      case "CUSTOMER":
        return [
          { id: "dashboard", label: "Dashboard", icon: "📊", description: "Overview & analytics" },
          { id: "policies", label: "My Policies", icon: "🛡️", description: "Insurance policies" },
          { id: "claims", label: "My Claims", icon: "📋", description: "Insurance claims" },
          { id: "documents", label: "Documents", icon: "📁", description: "Upload documents" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700">
      {/* Brand Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            🛡️
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">InsuranceApp</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                currentPage === item.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:transform hover:scale-105"
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{item.label}</div>
                <div className={`text-xs ${
                  currentPage === item.id 
                    ? "text-blue-100" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
          <div className="space-y-2">
            {role === "ADMIN" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Users</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Active Policies</span>
                  <span className="font-semibold text-gray-900 dark:text-white">5,678</span>
                </div>
              </>
            )}
            {role === "AGENT" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">My Customers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Active Policies</span>
                  <span className="font-semibold text-gray-900 dark:text-white">156</span>
                </div>
              </>
            )}
            {role === "CUSTOMER" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">My Policies</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Active Claims</span>
                  <span className="font-semibold text-gray-900 dark:text-white">2</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}