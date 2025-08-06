import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Role kontrolü ve yönlendirme
    const userRole = localStorage.getItem('userRole');
    
    console.log('DashboardPage - Current userRole from localStorage:', userRole);
    
    if (userRole === "ADMIN") {
      console.log('Redirecting to /admin');
      navigate('/admin');
      return;
    } else if (userRole === "AGENT") {
      console.log('Redirecting to /agent');
      navigate('/agent');
      return;
    } else if (userRole === "CUSTOMER") {
      console.log('Redirecting to /customer');
      navigate('/customer');
      return;
    }

    // Eğer role yoksa login'e yönlendir
    if (!userRole) {
      console.log('No userRole found, redirecting to /login');
      navigate('/login');
      return;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate]);

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 items-center justify-center">
      <div className="text-center text-gray-500">
        Redirecting to appropriate dashboard...
      </div>
    </div>
  );
}