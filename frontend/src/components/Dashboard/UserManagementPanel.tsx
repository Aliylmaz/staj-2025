import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const dummyUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "ADMIN", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "AGENT", status: "active" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "CUSTOMER", status: "inactive" },
];

export default function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="p-2">{user.id}</td>
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 capitalize">{user.role}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.status}
                </span>
              </td>
              <td className="p-2">
                <button 
                  className="text-blue-600 mr-2" 
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </button>
                <button 
                  className="text-red-600" 
                  onClick={() => alert(`Delete user ${user.id}`)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="font-bold mb-4">Edit User</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Name:</label>
                <input 
                  type="text" 
                  defaultValue={selectedUser.name}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email:</label>
                <input 
                  type="email" 
                  defaultValue={selectedUser.email}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role:</label>
                <select defaultValue={selectedUser.role} className="w-full p-2 border rounded">
                  <option value="ADMIN">Admin</option>
                  <option value="AGENT">Agent</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Status:</label>
                <select defaultValue={selectedUser.status} className="w-full p-2 border rounded">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                className="px-3 py-1 bg-gray-600 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => handleSaveUser(selectedUser)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}