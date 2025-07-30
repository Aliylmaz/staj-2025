import DashboardSummaryCards from "./DashboardSummaryCards";
import UserManagementPanel from "./UserManagementPanel";

export default function AdminDashboard({ page }: { page: string }) {
  if (page === "dashboard") return <DashboardSummaryCards />;
  if (page === "users") return <UserManagementPanel />;
  return null;
}