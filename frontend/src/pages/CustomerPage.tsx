import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import { 
  getMyOffers, 
  getMyPolicies, 
  getMyClaims, 
  getMyPayments, 
  getMyDocuments, 
  requestOffer, 
  acceptOfferAndCreatePolicy, 
  createClaim, 
  makePayment, 
  uploadDocument,
  getAllAgents
} from '../services/customerApi';
import type { AgentDto } from '../services/customerApi';

export default function CustomerPage() {
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'offers' | 'policies' | 'claims' | 'payments' | 'documents' | 'profile'>('dashboard');
  const navigate = useNavigate();
  const { customer, loading: contextLoading, error: contextError } = useCustomer();
  const customerId = customer?.id;

  // Data states
  const [offers, setOffers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  // Form data
  const [insuranceType, setInsuranceType] = useState<'VEHICLE' | 'HEALTH' | 'HOME'>('VEHICLE');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [note, setNote] = useState('');
  
  // Dynamic form data based on insurance type
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    vin: '',
    engineNumber: '',
    fuelType: 'GASOLINE' as any,
    gearType: 'MANUAL' as any,
    usageType: 'PERSONAL' as any,
    kilometers: 0,
    registrationDate: new Date().toISOString().split('T')[0]
  });
  
  const [healthData, setHealthData] = useState({
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
    height: 0,
    weight: 0,
    smoker: false,
    chronicDiseases: '',
    currentMedications: '',
    allergies: '',
    familyMedicalHistory: '',
    bloodType: '',
    CustomerId: ''
  });
  
  const [homeData, setHomeData] = useState({
    address: '',
    buildingAge: 0,
    squareMeters: 0,
    earthquakeResistance: false,
    floorNumber: 0,
    totalFloors: 0,
    customerId: ''
  });
  const [claimFormData, setClaimFormData] = useState({ description: '', amount: 0 });
  const [paymentFormData, setPaymentFormData] = useState({ amount: 0 });
  const [documentFormData, setDocumentFormData] = useState({ file: null as File | null });

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'CUSTOMER') {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (customerId) {
      fetchAllData();
    }
  }, [customerId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [offersData, policiesData, claimsData, paymentsData, documentsData, agentsData] = await Promise.all([
        getMyOffers(),
        getMyPolicies(),
        getMyClaims(),
        getMyPayments(),
        getMyDocuments(),
        getAllAgents()
      ]);
      setOffers(offersData);
      setPolicies(policiesData);
      setClaims(claimsData);
      setPayments(paymentsData);
      setDocuments(documentsData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const requestData: any = {
        insuranceType,
        note,
        agentId: selectedAgentId
      };
      
      // Add specific data based on insurance type
      switch (insuranceType) {
        case 'VEHICLE':
          requestData.vehicleRequest = vehicleData;
          break;
        case 'HEALTH':
          requestData.healthDetailRequest = healthData;
          break;
        case 'HOME':
          requestData.homeDetailRequest = homeData;
          break;
      }
      
      await requestOffer(requestData);
      setShowOfferForm(false);
      setInsuranceType('VEHICLE');
      setSelectedAgentId('');
      setNote('');
      // Reset form data
      setVehicleData({
        make: '', model: '', year: new Date().getFullYear(), plateNumber: '', vin: '', engineNumber: '',
        fuelType: 'GASOLINE', gearType: 'MANUAL', usageType: 'PERSONAL', kilometers: 0,
        registrationDate: new Date().toISOString().split('T')[0]
      });
      setHealthData({
        dateOfBirth: '', gender: '', medicalHistory: '', height: 0, weight: 0, smoker: false,
        chronicDiseases: '', currentMedications: '', allergies: '', familyMedicalHistory: '', bloodType: '', CustomerId: ''
      });
      setHomeData({
        address: '', buildingAge: 0, squareMeters: 0, earthquakeResistance: false, floorNumber: 0, totalFloors: 0, customerId: ''
      });
      fetchAllData();
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      await acceptOfferAndCreatePolicy(offerId);
      fetchAllData();
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleCreateClaim = async () => {
    if (!selectedPolicyId) return;
    try {
      await createClaim({
        policyId: selectedPolicyId,
        description: claimFormData.description,
        amount: claimFormData.amount,
        claimDate: new Date().toISOString()
      });
      setShowClaimForm(false);
      setClaimFormData({ description: '', amount: 0 });
      setSelectedPolicyId(null);
      fetchAllData();
    } catch (error) {
      console.error('Error creating claim:', error);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedPolicyId) return;
    try {
      await makePayment(selectedPolicyId, {
        amount: paymentFormData.amount,
        paymentMethod: 'CARD'
      });
      setShowPaymentForm(false);
      setPaymentFormData({ amount: 0 });
      setSelectedPolicyId(null);
      fetchAllData();
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedPolicyId || !documentFormData.file) return;
    try {
      await uploadDocument(documentFormData.file, selectedPolicyId);
      setShowDocumentUpload(false);
      setDocumentFormData({ file: null });
      setSelectedPolicyId(null);
      fetchAllData();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (contextLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #bfdbfe',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: '#334155',
            margin: 0
          }}>Loading customer data...</p>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginTop: '0.5rem'
          }}>Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fef2f2 50%, #fdf2f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '28rem',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.5rem'
          }}>Error Loading Data</h2>
          <p style={{
            color: '#dc2626',
            marginBottom: '1rem'
          }}>{contextError}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '28rem',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>👤</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.5rem'
          }}>No Customer Data</h2>
          <p style={{ color: '#475569' }}>Customer information is not available. Please log in again.</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Customer Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Welcome back! Here's your insurance overview and quick actions.
        </p>
      </div>

      {/* Stats Cards */}
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
                {policies.length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>📄</div>
          </div>
        </div>

        {/* Active Offers */}
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
                Active Offers
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {offers.filter(o => o.status === 'PENDING').length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>📋</div>
          </div>
        </div>

        {/* My Claims */}
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
                My Claims
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {claims.length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>🔑</div>
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
                ₺{policies.reduce((sum, p) => sum + p.totalPremium, 0)}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💳</div>
          </div>
        </div>
      </div>

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
            onClick={() => setShowOfferForm(true)}
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
            <span>📋</span>
            Request Offer
          </button>

          <button 
            onClick={() => setCurrentModule('documents')}
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
            <span>📁</span>
            Upload Document
          </button>

          <button 
            onClick={() => setCurrentModule('claims')}
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
            <span>🔑</span>
            File Claim
          </button>
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return renderDashboard();
             case 'offers':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Offers
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 View and manage your insurance offers
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowOfferForm(true)}
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
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
                 Request New Offer
               </button>
             </div>

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
             ) : offers.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Offers Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You don't have any insurance offers yet. Start by requesting an offer to get comprehensive coverage for your needs.
                 </p>
                 <button
                   onClick={() => setShowOfferForm(true)}
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
                   <span>📋</span>
                   Request Your First Offer
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {offers.map((offer) => (
                   <div key={offer.id} style={{
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
                         📋
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: offer.status === "PENDING" ? '#fef3c7' : offer.status === "ACCEPTED" ? '#dcfce7' : '#fee2e2',
                         color: offer.status === "PENDING" ? '#92400e' : offer.status === "ACCEPTED" ? '#166534' : '#991b1b'
                       }}>
                         {offer.status}
                       </span>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {offer.offerNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{offer.insuranceType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Premium:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>₺{offer.totalPremium}</span>
                       </div>
                       {offer.note && (
                         <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                           <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Note:</div>
                           <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{offer.note}</div>
                         </div>
                       )}
                     </div>
                     {offer.status === 'PENDING' && (
                       <button
                         onClick={() => handleAcceptOffer(offer.id)}
                         style={{
                           width: '100%',
                           padding: '0.75rem 1rem',
                           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'transform 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         Accept Offer
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'policies':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
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
                 Manage your active insurance coverage and policies
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowOfferForm(true)}
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
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
                 Request New Policy
               </button>
             </div>

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
             ) : policies.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Policies Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You don't have any active insurance policies yet. Start by requesting an offer to get comprehensive coverage for your needs.
                 </p>
                 <button
                   onClick={() => setShowOfferForm(true)}
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
                   <span>📋</span>
                   Request Your First Policy
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {policies.map((policy) => (
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
                         📄
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: policy.status === "ACTIVE" ? '#dcfce7' : policy.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                         color: policy.status === "ACTIVE" ? '#166534' : policy.status === "PENDING" ? '#92400e' : '#991b1b'
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
                       {policy.policyNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{policy.insuranceType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Premium:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>₺{policy.totalPremium}</span>
                       </div>
                       <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Coverage Period:</div>
                         <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>
                           {new Date(policy.startDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })} - {new Date(policy.endDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </div>
                       </div>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                       <button
                         onClick={() => {
                           setShowPaymentForm(true);
                           setSelectedPolicyId(policy.id);
                         }}
                         style={{
                           padding: '0.75rem 1rem',
                           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'transform 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         💳 Pay
                       </button>
                       <button
                         onClick={() => {
                           setShowClaimForm(true);
                           setSelectedPolicyId(policy.id);
                         }}
                         style={{
                           padding: '0.75rem 1rem',
                           background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'transform 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         🔑 Claim
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'claims':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
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

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowClaimForm(true)}
                 style={{
                   background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
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
                 <span>🔑</span>
                 File New Claim
               </button>
             </div>

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
             ) : claims.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Claims Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't filed any claims yet. Start by creating your first claim to get the support you need.
                 </p>
                 <button
                   onClick={() => setShowClaimForm(true)}
                   style={{
                     background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                   <span>🔑</span>
                   File Your First Claim
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {claims.map((claim) => (
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
                         background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         🔑
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: claim.status === "APPROVED" ? '#dcfce7' : claim.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                         color: claim.status === "APPROVED" ? '#166534' : claim.status === "PENDING" ? '#92400e' : '#991b1b'
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
                       {claim.claimNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>₺{claim.amount}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Claim Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(claim.claimDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                       <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description:</div>
                         <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{claim.description}</div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'payments':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Payments
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 View your payment history and manage transactions
               </p>
             </div>

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
             ) : payments.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Payments Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't made any payments yet. Payments will appear here once you start paying for your policies.
                 </p>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {payments.map((payment) => (
                   <div key={payment.id} style={{
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
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         💳
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: payment.status === "COMPLETED" ? '#dcfce7' : payment.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                         color: payment.status === "COMPLETED" ? '#166534' : payment.status === "PENDING" ? '#92400e' : '#991b1b'
                       }}>
                         {payment.status}
                       </span>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {payment.paymentNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>₺{payment.amount}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
       case 'documents':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Documents
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 Manage and upload your insurance documents
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowDocumentUpload(true)}
                 style={{
                   background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
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
                 <span>📁</span>
                 Upload Document
               </button>
             </div>

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
             ) : documents.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Documents Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't uploaded any documents yet. Start by uploading your first document.
                 </p>
                 <button
                   onClick={() => setShowDocumentUpload(true)}
                   style={{
                     background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                   <span>📁</span>
                   Upload Your First Document
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {documents.map((document) => (
                   <div key={document.id} style={{
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
                         background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         📁
                       </div>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {document.fileName}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>File Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{document.fileType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>File Size:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{(document.fileSize / 1024).toFixed(2)} KB</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Upload Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(document.uploadDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
       case 'profile':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Profile
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 Manage your personal information and account settings
               </p>
             </div>

             <div style={{
               background: 'white',
               borderRadius: '16px',
               padding: '2rem',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
               maxWidth: '600px'
             }}>
               <div style={{ marginBottom: '2rem' }}>
                 <h2 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Personal Information
                 </h2>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>First Name</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.firstName || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Last Name</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.lastName || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Email</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.email || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Customer Number</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.customerNumber || 'N/A'}
                     </div>
                   </div>
                 </div>
               </div>

               <div style={{ marginBottom: '2rem' }}>
                 <h2 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Address Information
                 </h2>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Address</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.address || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>City</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.city || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Country</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.country || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Postal Code</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.postalCode || 'N/A'}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
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
          <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0.5rem 0 0 0' }}>Customer Panel</p>
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
            { id: 'offers', label: 'My Offers', icon: '📋' },
            { id: 'policies', label: 'My Policies', icon: '📄' },
            { id: 'claims', label: 'My Claims', icon: '🔑' },
            { id: 'payments', label: 'My Payments', icon: '💳' },
            { id: 'documents', label: 'My Documents', icon: '📁' },
            { id: 'profile', label: 'Profile', icon: '👤' }
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

       {/* Offer Form Modal */}
       {showOfferForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '600px',
             maxHeight: '90vh',
             overflow: 'auto',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Request New Offer
               </h2>
               <button
                 onClick={() => setShowOfferForm(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Insurance Type
               </label>
               <select
                 value={insuranceType}
                 onChange={(e) => setInsuranceType(e.target.value as any)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="VEHICLE">Vehicle Insurance</option>
                 <option value="HEALTH">Health Insurance</option>
                 <option value="HOME">Home Insurance</option>
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Agent
               </label>
               <select
                 value={selectedAgentId}
                 onChange={(e) => setSelectedAgentId(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select an agent...</option>
                 {agents.map((agent) => (
                   <option key={agent.id} value={agent.id}>
                     {agent.firstName} {agent.lastName} - {agent.email}
                   </option>
                 ))}
               </select>
             </div>

             {/* Dynamic Fields Based on Insurance Type */}
             {insuranceType === 'VEHICLE' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Vehicle Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Make
                     </label>
                     <input
                       type="text"
                       value={vehicleData.make}
                       onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Model
                     </label>
                     <input
                       type="text"
                       value={vehicleData.model}
                       onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Year
                     </label>
                     <input
                       type="number"
                       value={vehicleData.year}
                       onChange={(e) => setVehicleData({ ...vehicleData, year: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Plate Number
                     </label>
                     <input
                       type="text"
                       value={vehicleData.plateNumber}
                       onChange={(e) => setVehicleData({ ...vehicleData, plateNumber: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       VIN
                     </label>
                     <input
                       type="text"
                       value={vehicleData.vin}
                       onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Engine Number
                     </label>
                     <input
                       type="text"
                       value={vehicleData.engineNumber}
                       onChange={(e) => setVehicleData({ ...vehicleData, engineNumber: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Fuel Type
                     </label>
                     <select
                       value={vehicleData.fuelType}
                       onChange={(e) => setVehicleData({ ...vehicleData, fuelType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="GASOLINE">Gasoline</option>
                       <option value="DIESEL">Diesel</option>
                       <option value="ELECTRIC">Electric</option>
                       <option value="HYBRID">Hybrid</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Gear Type
                     </label>
                     <select
                       value={vehicleData.gearType}
                       onChange={(e) => setVehicleData({ ...vehicleData, gearType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="MANUAL">Manual</option>
                       <option value="AUTOMATIC">Automatic</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Usage Type
                     </label>
                     <select
                       value={vehicleData.usageType}
                       onChange={(e) => setVehicleData({ ...vehicleData, usageType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="PERSONAL">Personal</option>
                       <option value="COMMERCIAL">Commercial</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Kilometers
                     </label>
                     <input
                       type="number"
                       value={vehicleData.kilometers}
                       onChange={(e) => setVehicleData({ ...vehicleData, kilometers: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                 </div>
               </div>
             )}

             {insuranceType === 'HEALTH' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Health Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Date of Birth
                     </label>
                     <input
                       type="date"
                       value={healthData.dateOfBirth}
                       onChange={(e) => setHealthData({ ...healthData, dateOfBirth: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Gender
                     </label>
                     <select
                       value={healthData.gender}
                       onChange={(e) => setHealthData({ ...healthData, gender: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="">Select Gender</option>
                       <option value="MALE">Male</option>
                       <option value="FEMALE">Female</option>
                       <option value="OTHER">Other</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Height (cm)
                     </label>
                     <input
                       type="number"
                       value={healthData.height}
                       onChange={(e) => setHealthData({ ...healthData, height: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Weight (kg)
                     </label>
                     <input
                       type="number"
                       value={healthData.weight}
                       onChange={(e) => setHealthData({ ...healthData, weight: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Blood Type
                     </label>
                     <select
                       value={healthData.bloodType}
                       onChange={(e) => setHealthData({ ...healthData, bloodType: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="">Select Blood Type</option>
                       <option value="A+">A+</option>
                       <option value="A-">A-</option>
                       <option value="B+">B+</option>
                       <option value="B-">B-</option>
                       <option value="AB+">AB+</option>
                       <option value="AB-">AB-</option>
                       <option value="O+">O+</option>
                       <option value="O-">O-</option>
                     </select>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <input
                       type="checkbox"
                       checked={healthData.smoker}
                       onChange={(e) => setHealthData({ ...healthData, smoker: e.target.checked })}
                       style={{ width: '1rem', height: '1rem' }}
                     />
                     <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                       Smoker
                     </label>
                   </div>
                 </div>
                 <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                     Medical History
                   </label>
                   <textarea
                     value={healthData.medicalHistory}
                     onChange={(e) => setHealthData({ ...healthData, medicalHistory: e.target.value })}
                     placeholder="Describe your medical history..."
                     style={{
                       width: '100%',
                       padding: '0.5rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '6px',
                       fontSize: '0.875rem',
                       minHeight: '60px',
                       resize: 'vertical'
                     }}
                   />
                 </div>
               </div>
             )}

             {insuranceType === 'HOME' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Home Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Address
                     </label>
                     <input
                       type="text"
                       value={homeData.address}
                       onChange={(e) => setHomeData({ ...homeData, address: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Building Age (years)
                     </label>
                     <input
                       type="number"
                       value={homeData.buildingAge}
                       onChange={(e) => setHomeData({ ...homeData, buildingAge: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Square Meters
                     </label>
                     <input
                       type="number"
                       value={homeData.squareMeters}
                       onChange={(e) => setHomeData({ ...homeData, squareMeters: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Floor Number
                     </label>
                     <input
                       type="number"
                       value={homeData.floorNumber}
                       onChange={(e) => setHomeData({ ...homeData, floorNumber: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Total Floors
                     </label>
                     <input
                       type="number"
                       value={homeData.totalFloors}
                       onChange={(e) => setHomeData({ ...homeData, totalFloors: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <input
                       type="checkbox"
                       checked={homeData.earthquakeResistance}
                       onChange={(e) => setHomeData({ ...homeData, earthquakeResistance: e.target.checked })}
                       style={{ width: '1rem', height: '1rem' }}
                     />
                     <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                       Earthquake Resistant
                     </label>
                   </div>
                 </div>
               </div>
             )}

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Note (Optional)
               </label>
               <textarea
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 placeholder="Add any additional information..."
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   minHeight: '100px',
                   resize: 'vertical'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowOfferForm(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleCreateOffer}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Request Offer
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Claim Form Modal */}
       {showClaimForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '500px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 File New Claim
               </h2>
               <button
                 onClick={() => setShowClaimForm(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Policy
               </label>
               <select
                 value={selectedPolicyId || ''}
                 onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select a policy...</option>
                 {policies.map((policy) => (
                   <option key={policy.id} value={policy.id}>
                     {policy.policyNumber} - {policy.insuranceType}
                   </option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Description
               </label>
               <textarea
                 value={claimFormData.description}
                 onChange={(e) => setClaimFormData({ ...claimFormData, description: e.target.value })}
                 placeholder="Describe your claim..."
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   minHeight: '100px',
                   resize: 'vertical'
                 }}
               />
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Amount (₺)
               </label>
               <input
                 type="number"
                 value={claimFormData.amount}
                 onChange={(e) => setClaimFormData({ ...claimFormData, amount: Number(e.target.value) })}
                 placeholder="0.00"
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowClaimForm(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleCreateClaim}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 File Claim
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Payment Form Modal */}
       {showPaymentForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '500px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Make Payment
               </h2>
               <button
                 onClick={() => setShowPaymentForm(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Policy
               </label>
               <select
                 value={selectedPolicyId || ''}
                 onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select a policy...</option>
                 {policies.map((policy) => (
                   <option key={policy.id} value={policy.id}>
                     {policy.policyNumber} - ₺{policy.totalPremium}
                   </option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Amount (₺)
               </label>
               <input
                 type="number"
                 value={paymentFormData.amount}
                 onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })}
                 placeholder="0.00"
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowPaymentForm(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleMakePayment}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Make Payment
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Document Upload Modal */}
       {showDocumentUpload && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '500px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Upload Document
               </h2>
               <button
                 onClick={() => setShowDocumentUpload(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Policy
               </label>
               <select
                 value={selectedPolicyId || ''}
                 onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select a policy...</option>
                 {policies.map((policy) => (
                   <option key={policy.id} value={policy.id}>
                     {policy.policyNumber} - {policy.insuranceType}
                   </option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select File
               </label>
               <input
                 type="file"
                 onChange={(e) => setDocumentFormData({ ...documentFormData, file: e.target.files?.[0] || null })}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowDocumentUpload(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleUploadDocument}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Upload Document
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 } 