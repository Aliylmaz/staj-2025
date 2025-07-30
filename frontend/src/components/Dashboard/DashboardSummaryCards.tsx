import { useRole } from "../../hooks/useRole";

interface SummaryCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
  color: string;
}

export default function DashboardSummaryCards() {
  const { role } = useRole();

  const getSummaryCards = (): SummaryCard[] => {
    switch (role) {
      case "ADMIN":
        return [
          {
            title: "Total Users",
            value: "1,234",
            change: "+12%",
            changeType: "positive",
            icon: "👥",
            color: "bg-gradient-to-r from-blue-500 to-blue-600"
          },
          {
            title: "Active Policies",
            value: "5,678",
            change: "+8%",
            changeType: "positive",
            icon: "📋",
            color: "bg-gradient-to-r from-green-500 to-green-600"
          },
          {
            title: "Total Revenue",
            value: "$2.4M",
            change: "+15%",
            changeType: "positive",
            icon: "💰",
            color: "bg-gradient-to-r from-purple-500 to-purple-600"
          },
          {
            title: "Pending Claims",
            value: "89",
            change: "-5%",
            changeType: "negative",
            icon: "⚠️",
            color: "bg-gradient-to-r from-orange-500 to-orange-600"
          }
        ];
      case "AGENT":
        return [
          {
            title: "My Customers",
            value: "45",
            change: "+3",
            changeType: "positive",
            icon: "👤",
            color: "bg-gradient-to-r from-indigo-500 to-indigo-600"
          },
          {
            title: "Active Policies",
            value: "156",
            change: "+12",
            changeType: "positive",
            icon: "📄",
            color: "bg-gradient-to-r from-emerald-500 to-emerald-600"
          },
          {
            title: "Monthly Sales",
            value: "$12.5K",
            change: "+18%",
            changeType: "positive",
            icon: "💵",
            color: "bg-gradient-to-r from-teal-500 to-teal-600"
          },
          {
            title: "Pending Offers",
            value: "8",
            change: "-2",
            changeType: "negative",
            icon: "📝",
            color: "bg-gradient-to-r from-amber-500 to-amber-600"
          }
        ];
      case "CUSTOMER":
        return [
          {
            title: "My Policies",
            value: "3",
            change: "+1",
            changeType: "positive",
            icon: "🛡️",
            color: "bg-gradient-to-r from-blue-500 to-blue-600"
          },
          {
            title: "Active Claims",
            value: "2",
            change: "0",
            changeType: "neutral",
            icon: "📋",
            color: "bg-gradient-to-r from-green-500 to-green-600"
          },
          {
            title: "Total Premium",
            value: "$450",
            change: "+$50",
            changeType: "positive",
            icon: "💳",
            color: "bg-gradient-to-r from-purple-500 to-purple-600"
          },
          {
            title: "Documents",
            value: "12",
            change: "+3",
            changeType: "positive",
            icon: "📁",
            color: "bg-gradient-to-r from-orange-500 to-orange-600"
          }
        ];
      default:
        return [];
    }
  };

  const cards = getSummaryCards();

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {role === "ADMIN" ? "Administrator" : role === "AGENT" ? "Agent" : "Customer"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="text-6xl opacity-20">
            {role === "ADMIN" ? "👨‍💼" : role === "AGENT" ? "👨‍💻" : "👤"}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${card.color}`}>
                  {card.icon}
                </div>
                <div className={`text-sm font-medium ${
                  card.changeType === "positive" ? "text-green-600" :
                  card.changeType === "negative" ? "text-red-600" : "text-gray-600"
                }`}>
                  {card.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {role === "ADMIN" && (
            <>
              <button className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">👥</span>
                <div className="text-left">
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-sm opacity-90">Add, edit, or remove users</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">📊</span>
                <div className="text-left">
                  <div className="font-semibold">View Analytics</div>
                  <div className="text-sm opacity-90">System performance metrics</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">⚙️</span>
                <div className="text-left">
                  <div className="font-semibold">System Settings</div>
                  <div className="text-sm opacity-90">Configure system options</div>
                </div>
              </button>
            </>
          )}
          {role === "AGENT" && (
            <>
              <button className="flex items-center p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">👤</span>
                <div className="text-left">
                  <div className="font-semibold">Add Customer</div>
                  <div className="text-sm opacity-90">Register new customer</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">📄</span>
                <div className="text-left">
                  <div className="font-semibold">Create Policy</div>
                  <div className="text-sm opacity-90">Generate new insurance policy</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">📝</span>
                <div className="text-left">
                  <div className="font-semibold">Create Offer</div>
                  <div className="text-sm opacity-90">Make insurance offer</div>
                </div>
              </button>
            </>
          )}
          {role === "CUSTOMER" && (
            <>
              <button className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">🛡️</span>
                <div className="text-left">
                  <div className="font-semibold">New Policy</div>
                  <div className="text-sm opacity-90">Apply for insurance</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">📋</span>
                <div className="text-left">
                  <div className="font-semibold">File Claim</div>
                  <div className="text-sm opacity-90">Submit insurance claim</div>
                </div>
              </button>
              <button className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
                <span className="text-2xl mr-3">📁</span>
                <div className="text-left">
                  <div className="font-semibold">Upload Document</div>
                  <div className="text-sm opacity-90">Add required documents</div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {role === "ADMIN" && (
            <>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 dark:text-blue-400">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">New user registered</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">John Doe joined the platform</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 dark:text-green-400">📄</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Policy approved</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Health insurance policy #1234</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">15 min ago</span>
              </div>
            </>
          )}
          {role === "AGENT" && (
            <>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 dark:text-indigo-400">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Customer added</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sarah Wilson registered</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">1 hour ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 dark:text-emerald-400">📄</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Policy created</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Home insurance for client #456</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">3 hours ago</span>
              </div>
            </>
          )}
          {role === "CUSTOMER" && (
            <>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 dark:text-blue-400">🛡️</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Policy renewed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Health insurance policy #789</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 dark:text-red-400">📋</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Claim submitted</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Medical claim #123 processed</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">2 days ago</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}