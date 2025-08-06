import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  userId: string;
  agentNumber: string;
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  policyIds: number[];
}

interface CreateAgentForm {
  name: string;
  email: string;
  phoneNumber: string;
  user: {
    username: string;
    password: string;
  };
}

interface UpdateAgentForm {
  name: string;
  email: string;
  phoneNumber: string;
  user: {
    username: string;
  };
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [createForm, setCreateForm] = useState<CreateAgentForm>({
    name: '',
    email: '',
    phoneNumber: '',
    user: {
      username: '',
      password: ''
    }
  });
  const [updateForm, setUpdateForm] = useState<UpdateAgentForm>({
    name: '',
    email: '',
    phoneNumber: '',
    user: {
      username: ''
    }
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      // Note: Backend doesn't have a getAllAgents endpoint yet
      // This would need to be added to AdminControllerImpl
      const response = await fetch('http://localhost:8080/api/v1/admin/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAgents(result.data || []);
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    // Form validation
    if (!createForm.name || !createForm.email || !createForm.phoneNumber || 
        !createForm.user.username || !createForm.user.password) {
      alert('Please fill in all required fields:\n- Agent Name\n- Agent Email\n- Phone Number\n- Username\n- Password');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug: Check if token exists
      console.log('Form data being sent:', createForm); // Debug: Check form data
      
      const response = await fetch('http://localhost:8080/api/v1/admin/create-agent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      });

      console.log('Response status:', response.status); // Debug: Check response status
      console.log('Response headers:', response.headers); // Debug: Check response headers

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result); // Debug: Check success response
        alert('Agent created successfully!');
        setShowCreateForm(false);
        setCreateForm({
          name: '',
          email: '',
          phoneNumber: '',
          user: {
            username: '',
            password: ''
          }
        });
        fetchAgents();
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData); // Debug: Check error response
        alert(`Failed to create agent: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Error creating agent');
    }
  };

  const updateAgent = async () => {
    if (!editingAgent) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/update-agent/${editingAgent.agentNumber}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateForm)
      });

      if (response.ok) {
        alert('Agent updated successfully!');
        setEditingAgent(null);
        setUpdateForm({
          name: '',
          email: '',
          phoneNumber: '',
          user: {
            username: ''
          }
        });
        fetchAgents();
      } else {
        const errorData = await response.json();
        alert(`Failed to update agent: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Error updating agent');
    }
  };

  const deleteAgent = async (agentNumber: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/delete-agent/${agentNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Agent deleted successfully!');
        fetchAgents();
      } else {
        alert('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  const startEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setUpdateForm({
      name: agent.name,
      email: agent.email,
      phoneNumber: agent.phoneNumber,
      user: {
        username: '' // Would need to fetch user details
      }
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading agents...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Agent Management
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Manage insurance agents in the system.
        </p>
      </div>

      {/* Create Agent Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ➕ Create New Agent
        </button>
      </div>

      {/* Create Agent Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Create New Agent</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Agent Name
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
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
                value={createForm.email}
                onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
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
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm({...createForm, phoneNumber: e.target.value})}
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
                value={createForm.user.username}
                onChange={(e) => setCreateForm({
                  ...createForm, 
                  user: {...createForm.user, username: e.target.value}
                })}
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
                value={createForm.user.password}
                onChange={(e) => setCreateForm({
                  ...createForm, 
                  user: {...createForm.user, password: e.target.value}
                })}
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
              onClick={createAgent}
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
              onClick={() => setShowCreateForm(false)}
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
      )}

      {/* Edit Agent Form */}
      {editingAgent && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Edit Agent: {editingAgent.agentNumber}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Agent Name
              </label>
              <input
                type="text"
                value={updateForm.name}
                onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
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
                value={updateForm.email}
                onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
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
                value={updateForm.phoneNumber}
                onChange={(e) => setUpdateForm({...updateForm, phoneNumber: e.target.value})}
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
                value={updateForm.user.username}
                onChange={(e) => setUpdateForm({
                  ...updateForm, 
                  user: {...updateForm.user, username: e.target.value}
                })}
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


          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={updateAgent}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Update Agent
            </button>
            <button
              onClick={() => setEditingAgent(null)}
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
      )}

      {/* Agents List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>All Agents</h3>
        
        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No agents found. Create your first agent using the button above.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '1rem'
          }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                    {agent.name} {agent.surname}
                  </h4>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: '#2563eb',
                    color: 'white'
                  }}>
                    {agent.agentNumber}
                  </span>
                </div>
                
                <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>Email:</strong> {agent.email}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>Phone:</strong> {agent.phoneNumber}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  <strong>Policies:</strong> {agent.policyIds?.length || 0}
                </p>
                
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => startEdit(agent)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.agentNumber)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 