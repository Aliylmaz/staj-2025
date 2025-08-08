import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentStatistics, type AgentStatsDto } from '../services/agentApi';

export default function AgentPage() {
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'customers' | 'policies' | 'offers' | 'claims' | 'profile'>('dashboard');
  const [agentStats, setAgentStats] = useState<AgentStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Agent kontrolü
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'AGENT') {
      navigate('/login');
      return;
    }
    fetchAgentStats();
  }, [navigate]);

  const fetchAgentStats = async () => {
    setStatsLoading(true);
    try {
      const allStats = await getAgentStatistics();
      const agentNumber = localStorage.getItem('agentNumber');
      // Find the stats for the current agent
      const myStats = allStats.find(s => s.agentNumber === agentNumber);
      setAgentStats(myStats || null);
    } catch (error) {
      setAgentStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('agentNumber');
    navigate('/login');
  };

  const renderDashboard = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Agent Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Welcome back! Here's what's happening with your customers and policies.
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading statistics...</div>
      ) : agentStats ? (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* My Policies */}
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
                My Policies
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {agentStats.totalPolicies}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>📋</div>
          </div>
        </div>
        {/* Claims */}
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
                Claims
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {agentStats.totalClaims}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>🔧</div>
          </div>
        </div>
        {/* Payments */}
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
                Payments
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {agentStats.totalPayments}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💰</div>
          </div>
        </div>
        {/* Total Premium */}
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
                Total Premium
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                ₺{agentStats.totalPremium.toFixed(2)}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💎</div>
          </div>
        </div>
        {/* Total Commission */}
        <div style={{
          background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Total Commission
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                ₺{agentStats.totalCommission.toFixed(2)}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💸</div>
          </div>
        </div>
        {/* Success Rate */}
        <div style={{
          background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Success Rate
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {agentStats.successRate.toFixed(1)}%
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>🏆</div>
          </div>
        </div>
      </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>No statistics found for your agent profile.</div>
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
            onClick={() => setCurrentModule('customers')}
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
            Manage Customers
          </button>

          <button 
            onClick={() => setCurrentModule('policies')}
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
            <span>📋</span>
            View Policies
          </button>

          <button 
            onClick={() => setCurrentModule('offers')}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
            <span>📄</span>
            Create Offers
          </button>

          <button 
            onClick={() => setCurrentModule('claims')}
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
            <span>🔧</span>
            Process Claims
          </button>
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return renderDashboard();
      case 'customers':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>My Customers</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
      case 'policies':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>Policies</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
      case 'offers':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>Offers</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
      case 'claims':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>Claims</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>My Profile</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0 }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '2rem 1rem',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>InsuranceApp</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0.5rem 0 0 0' }}>Agent Panel</p>
        </div>

        {/* Navigation */}
        <nav>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.5rem' }}>
              MAIN MODULES
            </h3>
          </div>
          
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'customers', label: 'My Customers', icon: '👥' },
            { id: 'policies', label: 'Policies', icon: '📋' },
            { id: 'offers', label: 'Offers', icon: '📄' },
            { id: 'claims', label: 'Claims', icon: '🔧' },
            { id: 'profile', label: 'My Profile', icon: '👤' }
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => setCurrentModule(module.id as any)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                background: currentModule === module.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
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
                if (currentModule !== module.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentModule !== module.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{module.icon}</span>
              {module.label}
            </button>
          ))}
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