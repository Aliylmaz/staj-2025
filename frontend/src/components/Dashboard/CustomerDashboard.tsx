import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

interface Policy {
  id: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  premium: number;
}

interface Claim {
  id: string;
  policyId: number;
  status: string;
  description: string;
  amount: number;
  createdAt: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export default function CustomerDashboard({ page }: { page: string }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock customer ID - gerçek uygulamada JWT'den alınacak
  const customerId = "123e4567-e89b-12d3-a456-426614174000";

  useEffect(() => {
    if (page === "policies" || page === "dashboard") {
      fetchPolicies();
    } else if (page === "claims") {
      fetchClaims();
    } else if (page === "documents") {
      fetchDocuments();
    }
  }, [page]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/project/customer/policies/${customerId}`);
      setPolicies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
      // Fallback to dummy data
      setPolicies([
        { id: 301, type: "Health", status: "active", startDate: "2024-01-01", endDate: "2024-12-31", premium: 89.99 },
        { id: 302, type: "Home", status: "expired", startDate: "2023-01-01", endDate: "2023-12-31", premium: 120.50 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/project/customer/claims/${customerId}`);
      setClaims(response.data.data || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
      // Fallback to dummy data
      setClaims([
        { id: "401", policyId: 301, status: "pending", description: "Medical claim", amount: 500, createdAt: "2024-01-15" },
        { id: "402", policyId: 302, status: "approved", description: "Property damage", amount: 1200, createdAt: "2024-01-10" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/project/customer/documents/${customerId}`);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Fallback to dummy data
      setDocuments([
        { id: 501, name: "ID Card.pdf", type: "Identity", uploadDate: "2024-01-01", size: "2.5 MB" },
        { id: 502, name: "Policy.pdf", type: "Policy", uploadDate: "2024-01-01", size: "1.8 MB" },
      ]);
    } finally {
      setLoading(false);
    }
  };



  if (page === "dashboard" || page === "policies") {
    return (
      <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            My Policies
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b',
            margin: 0
          }}>
            Manage your insurance policies and coverage
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '3rem' 
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          /* Policies Grid */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {policies.map(policy => (
              <div key={policy.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    🛡️
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: policy.status === "active" ? '#dcfce7' : '#f3f4f6',
                    color: policy.status === "active" ? '#166534' : '#374151'
                  }}>
                    {policy.status}
                  </span>
                </div>
                
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  color: '#1e293b',
                  marginBottom: '1rem' 
                }}>
                  {policy.type} Insurance
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy ID:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{policy.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Premium:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>${policy.premium}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Start Date:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{policy.startDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>End Date:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{policy.endDate}</span>
                  </div>
                </div>
                
                <button 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => { setSelected(policy); setShowModal(true); }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {showModal && selected && (
          <Modal onClose={() => setShowModal(false)}>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Policy Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Policy ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">#{selected.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selected.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    selected.status === "active" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}>
                    {selected.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Premium:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${selected.premium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Start Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selected.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">End Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selected.endDate}</span>
                </div>
              </div>
              <button 
                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  if (page === "claims") {
    return (
      <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            My Claims
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b',
            margin: 0
          }}>
            Track and manage your insurance claims
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '3rem' 
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #ef4444',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          /* Claims Grid */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {claims.map(claim => (
              <div key={claim.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    📋
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: claim.status === "approved" ? '#dcfce7' : '#fef3c7',
                    color: claim.status === "approved" ? '#166534' : '#92400e'
                  }}>
                    {claim.status}
                  </span>
                </div>
                
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  color: '#1e293b',
                  marginBottom: '1rem' 
                }}>
                  Claim #{claim.id}
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy ID:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{claim.policyId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>${claim.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Created:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{claim.createdAt}</span>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Description:</span>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{claim.description}</p>
                  </div>
                </div>
                
                <button 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => { setSelected(claim); setShowModal(true); }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {showModal && selected && (
          <Modal onClose={() => setShowModal(false)}>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Claim Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Claim ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">#{selected.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Policy ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">#{selected.policyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    selected.status === "approved" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {selected.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${selected.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selected.createdAt}</span>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Description:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{selected.description}</p>
                </div>
              </div>
              <button 
                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  if (page === "documents") {
    return (
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Documents</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your uploaded documents</p>
          </div>
          <button 
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={() => alert("Upload new document")}
          >
            <span className="mr-2">📁</span>
            Upload New Document
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xl">
                      📁
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{doc.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doc.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doc.uploadDate}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    onClick={() => alert("View document " + doc.id)}
                  >
                    View Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}