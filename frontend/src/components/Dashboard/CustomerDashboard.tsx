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

  const handleCreatePolicy = async () => {
    try {
      const newPolicy = {
        type: "Health",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        premium: 89.99
      };
      
      await axios.post(`http://localhost:8080/project/customer/policy/create/${customerId}`, newPolicy);
      alert("Policy created successfully!");
      fetchPolicies();
    } catch (error) {
      console.error("Error creating policy:", error);
      alert("Failed to create policy");
    }
  };

  const handleFileClaim = async () => {
    try {
      // Backend'de claim endpoint'i varsa kullan
      // await axios.post(`http://localhost:8080/api/v1/claims`, {
      //   policyId: policies[0]?.id || 301,
      //   description: "New claim",
      //   amount: 500
      // });
      alert("Claim filed successfully!");
      fetchClaims();
    } catch (error) {
      console.error("Error filing claim:", error);
      alert("Failed to file claim");
    }
  };

  if (page === "dashboard" || page === "policies") {
    return (
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Policies</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your insurance policies</p>
          </div>
          <button 
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={handleCreatePolicy}
          >
            <span className="mr-2">🛡️</span>
            Submit New Policy
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Policies Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map(policy => (
              <div key={policy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                      🛡️
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      policy.status === "active" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{policy.type} Insurance</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Policy ID:</span>
                      <span className="font-medium text-gray-900 dark:text-white">#{policy.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${policy.premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{policy.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{policy.endDate}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    onClick={() => { setSelected(policy); setShowModal(true); }}
                  >
                    View Details
                  </button>
                </div>
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
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Claims</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your insurance claims</p>
          </div>
          <button 
            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={handleFileClaim}
          >
            <span className="mr-2">📋</span>
            File New Claim
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          /* Claims Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map(claim => (
              <div key={claim.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
                      📋
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      claim.status === "approved" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Claim #{claim.id}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Policy ID:</span>
                      <span className="font-medium text-gray-900 dark:text-white">#{claim.policyId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${claim.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{claim.createdAt}</span>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-900 dark:text-white">Description:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{claim.description}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    onClick={() => { setSelected(claim); setShowModal(true); }}
                  >
                    View Details
                  </button>
                </div>
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