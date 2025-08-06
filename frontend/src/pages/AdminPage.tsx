import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentManagement from '../components/Admin/AgentManagement';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  createdAt: string;
}

interface DashboardData {
  totalPolicies: number;
  totalCustomers: number;
  totalClaims: number;
  totalPayments: number;
  totalOffers: number;
  totalPremium: number;
}

interface AgentStats {
  agentName: string;
  agentNumber: string;
  totalPolicies: number;
  totalClaims: number;
  totalPayments: number;
  totalPremium: number;
}

type AdminModule = 'dashboard' | 'users' | 'agents';
type UserSubModule = 'view-users' | 'change-roles' | 'user-stats';
type AgentSubModule = 'view-agents' | 'create-agent' | 'agent-statistics';

export default function AdminPage() {
  const [currentModule, setCurrentModule] = useState<AdminModule>('dashboard');
  const [currentUserSubModule, setCurrentUserSubModule] = useState<UserSubModule>('view-users');
  const [currentAgentSubModule, setCurrentAgentSubModule] = useState<AgentSubModule>('view-agents');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Admin kontrolü
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (userRole !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
    if (currentModule === 'users' && currentUserSubModule === 'view-users') {
      fetchUsers();
    }
    // Note: Agent management is handled by the AgentManagement component
  }, [currentModule, navigate]);

  // Fetch agent statistics when agent-statistics module is selected
  useEffect(() => {
    if (currentModule === 'agents' && currentAgentSubModule === 'agent-statistics') {
      fetchAgentStats();
    }
  }, [currentModule, currentAgentSubModule]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/admin/summary-report', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAgentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/admin/agent-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAgentStats(result.data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      } else {
        console.error('Failed to fetch agent statistics');
      }
    } catch (error) {
      console.error('Error fetching agent statistics:', error);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/users/change-role', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          role: newRole
        })
      });

      if (response.ok) {
        alert('User role updated successfully!');
        fetchUsers(); // Refresh user list
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleModuleClick = (moduleId: AdminModule) => {
    setCurrentModule(moduleId);
    if (moduleId === 'dashboard') {
      setExpandedModules(new Set());
    }
  };

  const handleUserSubModuleClick = (subModule: UserSubModule) => {
    setCurrentModule('users');
    setCurrentUserSubModule(subModule);
  };

  const handleAgentSubModuleClick = (subModule: AgentSubModule) => {
    setCurrentModule('agents');
    setCurrentAgentSubModule(subModule);
  };

  const renderDashboard = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Admin Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Welcome back! Here's what's happening with your insurance platform.
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading dashboard data...</div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Customers */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Users in System
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {dashboardData?.totalCustomers || 0}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>👥</div>
            </div>
          </div>

          {/* Total Policies */}
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Policies
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {dashboardData?.totalPolicies || 0}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>📋</div>
            </div>
          </div>

          {/* Total Claims */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Claims
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {dashboardData?.totalClaims || 0}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>🔧</div>
            </div>
          </div>

          {/* Total Premium */}
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Premium
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  ${dashboardData?.totalPremium?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>💰</div>
            </div>
          </div>

          {/* Total Payments */}
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Payments
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {dashboardData?.totalPayments || 0}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>💳</div>
            </div>
          </div>

          {/* Total Offers */}
          <div style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: '#1e293b',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                  Total Offers
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {dashboardData?.totalOffers || 0}
                </div>
              </div>
              <div style={{ fontSize: '2rem' }}>📄</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <button 
            onClick={() => setCurrentModule('users')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>👥</span>
            Manage Users
          </button>

          <button 
            onClick={() => setCurrentModule('agents')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>👨‍💼</span>
            Manage Agents
          </button>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          System Status
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#10b981' 
              }}></div>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>System Online</span>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>
              All services are running smoothly. No issues detected.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#f59e0b' 
              }}></div>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>Database</span>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>
              Connected and synchronized. Last backup: 2 hours ago.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#10b981' 
              }}></div>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>API Services</span>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>
              All endpoints responding normally. Average response time: 120ms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChangeRoles = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Change User Roles
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Manage user roles and permissions in the system.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Role Management</h3>
        
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No users found. Please check the "View All Users" section first.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem'
          }}>
            {users.map((user) => (
              <div key={user.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                    {user.firstName} {user.lastName}
                  </h4>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: user.role === 'ADMIN' ? '#dc2626' : user.role === 'AGENT' ? '#2563eb' : '#059669',
                    color: 'white'
                  }}>
                    {user.role}
                  </span>
                </div>
                
                <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>Username:</strong> {user.username}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>Email:</strong> {user.email}
                </p>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                    Change Role:
                  </label>
                  <select 
                    defaultValue={user.role}
                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem',
                      background: 'white',
                      width: '100%'
                    }}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="AGENT">Agent</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderUserStats = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          User Statistics
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Overview of user distribution and activity in the system.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>User Distribution</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {users.filter(u => u.role === 'CUSTOMER').length}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Customers</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {users.filter(u => u.role === 'AGENT').length}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Agents</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {users.filter(u => u.role === 'ADMIN').length}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Admins</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Users</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Recent User Activity</h4>
          <div style={{ 
            background: '#f8fafc', 
            borderRadius: '8px', 
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <p>• Last 7 days: {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} new users</p>
            <p>• Most active role: {users.length > 0 ? (() => {
              const roleCounts = users.reduce((acc, user) => {
                const role = user.role;
                acc[role] = (acc[role] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const mostActiveRole = Object.entries(roleCounts).reduce((a, b) => roleCounts[a[0]] > roleCounts[b[0]] ? a : b)[0];
              return mostActiveRole;
            })() : 'No data'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserContent = () => {
    switch (currentUserSubModule) {
      case 'view-users':
        return renderUsers();
      case 'change-roles':
        return renderChangeRoles();
      case 'user-stats':
        return renderUserStats();
      default:
        return renderUsers();
    }
  };

  // Agent render functions
  const renderCreateAgent = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Create New Agent
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Add a new insurance agent to the system.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Agent Information</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Agent Name
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Phone Number
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Username
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
              placeholder="Enter password"
            />
          </div>


        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Create Agent
          </button>
          <button
            onClick={() => handleAgentSubModuleClick('view-agents')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderAgentStatistics = () => {
    return (
      <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Agent Statistics
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b',
            margin: 0
          }}>
            View detailed performance statistics for all agents.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Agent Performance Overview</h3>
          
          {agentStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No agent statistics available. Please check back later.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '1.5rem'
            }}>
              {agentStats.map((stat) => (
                <div key={stat.agentNumber} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#1e293b' }}>
                      {stat.agentName}
                    </h4>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#2563eb',
                      color: 'white'
                    }}>
                      {stat.agentNumber}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                        {stat.totalPolicies}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Policies</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                        {stat.totalClaims}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Claims</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                        {stat.totalPayments}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Payments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                        {stat.totalPremium.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Premium</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        ${stat.totalPremium.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Premium</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAgentContent = () => {
    switch (currentAgentSubModule) {
      case 'view-agents':
        return <AgentManagement />;
      case 'create-agent':
        return renderCreateAgent();
      case 'agent-statistics':
        return renderAgentStatistics();
      default:
        return <AgentManagement />;
    }
  };

  const renderUsers = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          User Management
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          View all users in the system. For role management, use the "Change User Roles" section.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem'
        }}>
          {users.map((user) => (
            <div key={user.id} style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  {user.firstName} {user.lastName}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: user.role === 'ADMIN' ? '#dc2626' : user.role === 'AGENT' ? '#2563eb' : '#059669',
                  color: 'white'
                }}>
                  {user.role}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                <strong>Username:</strong> {user.username}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                <strong>Phone:</strong> {user.phoneNumber}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserContent();
      case 'agents':
        return renderAgentContent();
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0 }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '2rem 1rem',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>InsuranceApp</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0.5rem 0 0 0' }}>Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.5rem' }}>
              MAIN MODULES
            </h3>
          </div>
          
          {/* Dashboard */}
          <button
            onClick={() => handleModuleClick('dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              background: currentModule === 'dashboard' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentModule !== 'dashboard') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentModule !== 'dashboard') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            Dashboard
          </button>

          {/* User Management Accordion */}
          <div style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => toggleModuleExpansion('users')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: currentModule === 'users' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentModule !== 'users') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentModule !== 'users') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👥</span>
                User Management
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                transition: 'transform 0.2s',
                transform: expandedModules.has('users') ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            
            {expandedModules.has('users') && (
              <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                {[
                  { id: 'view-users', label: 'View All Users', icon: '👁️' },
                  { id: 'change-roles', label: 'Change User Roles', icon: '🔄' },
                  { id: 'user-stats', label: 'User Statistics', icon: '📈' }
                ].map((subModule) => (
                  <button
                    key={subModule.id}
                    onClick={() => handleUserSubModuleClick(subModule.id as UserSubModule)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.25rem',
                      background: currentModule === 'users' && currentUserSubModule === subModule.id ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!(currentModule === 'users' && currentUserSubModule === subModule.id)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(currentModule === 'users' && currentUserSubModule === subModule.id)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{subModule.icon}</span>
                    {subModule.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agent Management Accordion */}
          <div style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => toggleModuleExpansion('agents')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: currentModule === 'agents' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentModule !== 'agents') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentModule !== 'agents') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👨‍💼</span>
                Agent Management
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                transition: 'transform 0.2s',
                transform: expandedModules.has('agents') ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            
            {expandedModules.has('agents') && (
              <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                {[
                  { id: 'view-agents', label: 'View All Agents', icon: '👁️' },
                  { id: 'create-agent', label: 'Create New Agent', icon: '➕' },
                  { id: 'agent-statistics', label: 'Agent Statistics', icon: '📊' }
                ].map((subModule) => (
                  <button
                    key={subModule.id}
                    onClick={() => handleAgentSubModuleClick(subModule.id as AgentSubModule)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.25rem',
                      background: currentModule === 'agents' && currentAgentSubModule === subModule.id ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!(currentModule === 'agents' && currentAgentSubModule === subModule.id)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(currentModule === 'agents' && currentAgentSubModule === subModule.id)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{subModule.icon}</span>
                    {subModule.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderModuleContent()}
      </div>
    </div>
  );
} 