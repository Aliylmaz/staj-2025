import { useState, useEffect } from "react";
import { useRole } from "../hooks/useRole";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import AgentDashboard from "../components/Dashboard/AgentDashboard";
import CustomerDashboard from "../components/Dashboard/CustomerDashboard";
import DashboardSummaryCards from "../components/Dashboard/DashboardSummaryCards";

export default function DashboardPage() {
  const { role } = useRole();
  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const renderDashboardContent = () => {
    switch (role) {
      case "ADMIN":
        return page === "dashboard" ? <DashboardSummaryCards /> : <AdminDashboard page={page} />;
      case "AGENT":
        return page === "dashboard" ? <DashboardSummaryCards /> : <AgentDashboard page={page} />;
      case "CUSTOMER":
        return page === "dashboard" ? <DashboardSummaryCards /> : <CustomerDashboard page={page} />;
      default:
        return <div className="text-center text-gray-500">Invalid role</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar role={role} currentPage={page} onPageChange={setPage} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {page === "dashboard" ? "Dashboard" : 
                 page === "users" ? "User Management" :
                 page === "customers" ? "My Customers" :
                 page === "policies" ? "Policies" :
                 page === "offers" ? "Offers" :
                 page === "claims" ? "Claims" :
                 page === "documents" ? "Documents" : "Dashboard"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back! Here's what's happening with your account.
              </p>
            </div>

            {/* Dashboard Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {renderDashboardContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}