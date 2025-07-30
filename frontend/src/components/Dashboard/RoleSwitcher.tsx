import type { Role } from "../../hooks/useRole";
import { useRole } from "../../hooks/useRole";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Role:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="px-2 py-1 border rounded text-sm"
      >
        <option value="ADMIN">Admin</option>
        <option value="AGENT">Agent</option>
        <option value="CUSTOMER">Customer</option>
      </select>
    </div>
  );
}