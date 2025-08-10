import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMyAgentStatistics,
  type AgentStatsDto, 
  getAllOffers, 
  updateOfferStatus, 
  type OfferDto,
  type ClaimDto,
  type PaymentDto,
  getClaimsByAgent,
  approveClaim,
  rejectClaim,
  getPaymentsByAgent,
  approvePayment,
  rejectPayment,
  reviseOfferPremium,
  getCurrentAgent,
  getMyCustomers,
  type CustomerDto,
  type AgentDto
} from '../services/agentApi';

export default function AgentPage() {
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'customers' | 'policies' | 'offers' | 'claims' | 'payments' | 'profile'>('dashboard');
  const [agentStats, setAgentStats] = useState<AgentStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [claims, setClaims] = useState<ClaimDto[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentDto | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [reviseModalOpen, setReviseModalOpen] = useState(false);
  const [newPremium, setNewPremium] = useState('');
  const [reviseNote, setReviseNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Agent kontrolü
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'AGENT') {
      navigate('/login');
      return;
    }
    fetchCurrentAgent();
    fetchAgentStats();
    fetchOffers();
    fetchCustomers();
  }, [navigate]);

  // Fetch agent-specific data when current agent is loaded
  useEffect(() => {
    if (currentAgent?.id) {
      fetchClaims();
      fetchPayments();
    }
  }, [currentAgent]);

  const fetchCurrentAgent = async () => {
    try {
      const agent = await getCurrentAgent();
      setCurrentAgent(agent);
    } catch (error) {
      console.error('Error fetching current agent:', error);
      setCurrentAgent(null);
    }
  };

  const fetchAgentStats = async () => {
    setStatsLoading(true);
    try {
      const myStats = await getMyAgentStatistics();
      setAgentStats(myStats);
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      setAgentStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const offersData = await getAllOffers();
      // Filter only PENDING offers for the agent
      const pendingOffers = offersData.filter(offer => offer.status === 'PENDING');
      setOffers(pendingOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchClaims = async () => {
    if (!currentAgent?.id) return;
    setClaimsLoading(true);
    try {
      const claimsData = await getClaimsByAgent(currentAgent.id);
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!currentAgent?.id) return;
    setPaymentsLoading(true);
    try {
      const paymentsData = await getPaymentsByAgent(currentAgent.id);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const customersData = await getMyCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      const updateRequest = {
        offerId: offerId,
        status: 'ACCEPTED' as const
      };
      
      const updatedOffer = await updateOfferStatus(updateRequest);
      
      // Update the offers state with the updated offer
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === offerId ? updatedOffer : offer
        )
      );
      
      console.log('Offer accepted successfully');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      const updateRequest = {
        offerId: offerId,
        status: 'REJECTED' as const
      };
      
      await updateOfferStatus(updateRequest);
      
      // Remove from offers list since it's no longer pending
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer.id !== offerId)
      );
      
      console.log('Offer rejected successfully');
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Failed to reject offer. Please try again.');
    }
  };

  const handleReviseOffer = (offerId: number) => {
    setSelectedOfferId(offerId);
    setReviseModalOpen(true);
    setNewPremium('');
    setReviseNote('');
  };

  const handleSubmitRevision = async () => {
    if (!selectedOfferId || !newPremium) {
      alert('Please enter a new premium amount');
      return;
    }

    try {
      const premium = parseFloat(newPremium);
      if (isNaN(premium) || premium <= 0) {
        alert('Please enter a valid premium amount');
        return;
      }

      await reviseOfferPremium(selectedOfferId, premium, reviseNote);
      
      // Remove from offers list and refresh
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer.id !== selectedOfferId)
      );
      
      setReviseModalOpen(false);
      setSelectedOfferId(null);
      setNewPremium('');
      setReviseNote('');
      
      alert('Premium revised successfully! Customer will be notified.');
    } catch (error) {
      console.error('Error revising premium:', error);
      alert('Failed to revise premium. Please try again.');
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    if (!currentAgent?.id) return;
    try {
      const updatedClaim = await approveClaim(claimId, currentAgent.id);
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimId ? updatedClaim : claim
        )
      );
      alert('Claim approved successfully');
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve claim. Please try again.');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!currentAgent?.id) return;
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      const updatedClaim = await rejectClaim(claimId, currentAgent.id, reason);
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimId ? updatedClaim : claim
        )
      );
      alert('Claim rejected successfully');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Failed to reject claim. Please try again.');
    }
  };

  const handleApprovePayment = async (paymentId: number) => {
    if (!currentAgent?.id) return;
    try {
      const updatedPayment = await approvePayment(paymentId, currentAgent.id);
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? updatedPayment : payment
        )
      );
      alert('Payment approved successfully');
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    if (!currentAgent?.id) return;
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      const updatedPayment = await rejectPayment(paymentId, currentAgent.id, reason);
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? updatedPayment : payment
        )
      );
      alert('Payment rejected successfully');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
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
      ) : agentStats && agentStats.totalPolicies !== undefined ? (
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
                {agentStats.totalPolicies || 0}
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
                {agentStats.totalClaims || 0}
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
                {agentStats.totalPayments || 0}
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
                ₺{(agentStats.totalPremium || 0).toFixed(2)}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💎</div>
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
                {(agentStats.successRate || 0).toFixed(1)}%
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
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                My Customers
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                Manage your assigned customers and their information
              </p>
            </div>

            {customersLoading ? (
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
            ) : customers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}>
                  No Customers Assigned
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  You don't have any customers assigned to you yet.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {customers.map((customer) => (
                  <div key={customer.id} style={{
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
                        👤
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: customer.customerType === "INDIVIDUAL" ? '#dbeafe' : '#fef3c7',
                        color: customer.customerType === "INDIVIDUAL" ? '#1e40af' : '#92400e'
                      }}>
                        {customer.customerType}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '1rem'
                    }}>
                      {customer.customerType === 'INDIVIDUAL' 
                        ? `${customer.firstName || 'N/A'} ${customer.lastName || 'N/A'}` 
                        : customer.companyName || 'N/A'}
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer Number:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.customerNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Email:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.email || 'N/A'}</span>
                      </div>
                      {customer.phoneNumber && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Phone:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.phoneNumber}</span>
                        </div>
                      )}
                      {customer.city && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Location:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {customer.city}{customer.country && `, ${customer.country}`}
                          </span>
                        </div>
                      )}
                      {customer.address && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Address:</div>
                          <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{customer.address}</div>
                        </div>
                      )}
                    </div>

                    <div style={{
                      padding: '0.75rem 1rem',
                      background: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#0c4a6e'
                    }}>
                      Assigned Customer
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'policies':
        return (
          <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>My Policies</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        );
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
                Offer Management
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                Review and manage insurance offers from your customers
              </p>
            </div>

            {offersLoading ? (
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
                  No Offers Available
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  There are currently no insurance offers pending your review.
                </p>
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
                        background: offer.status === "PENDING" ? '#fef3c7' : offer.status === "ACCEPTED" ? '#dcfce7' : offer.status === "REJECTED" ? '#fee2e2' : '#e0e7ff',
                        color: offer.status === "PENDING" ? '#92400e' : offer.status === "ACCEPTED" ? '#166534' : offer.status === "REJECTED" ? '#991b1b' : '#3730a3'
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
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {offer.customer.firstName} {offer.customer.lastName}
                        </span>
                      </div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          style={{
                            flex: 1,
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
                            ✅ Accept
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)',
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
                            ❌ Reject
                          </button>
                        </div>
                        <button
                          onClick={() => handleReviseOffer(offer.id)}
                          style={{
                            width: '100%',
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
                          📝 Revise Premium
                        </button>
                      </div>
                    )}
                    
                    {offer.status === 'ACCEPTED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Accepted - Policy can be created by customer
                      </div>
                    )}
                    
                    {offer.status === 'REJECTED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Rejected
                      </div>
                    )}
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
                Claims Review
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                Review and process insurance claims from your customers
              </p>
            </div>

            {claimsLoading ? (
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}>
                  No Claims to Review
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  There are currently no claims pending your review.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        🔧
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: claim.status === "PENDING" ? '#fef3c7' : claim.status === "APPROVED" ? '#dcfce7' : claim.status === "REJECTED" ? '#fee2e2' : '#e0e7ff',
                        color: claim.status === "PENDING" ? '#92400e' : claim.status === "APPROVED" ? '#166534' : claim.status === "REJECTED" ? '#991b1b' : '#3730a3'
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
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {claim.customer.firstName} {claim.customer.lastName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{claim.policy.policyNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Claim Amount:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>₺{claim.claimAmount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Incident Date:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {new Date(claim.incidentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description:</div>
                        <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{claim.description}</div>
                      </div>
                      {claim.rejectionReason && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                          <div style={{ color: '#991b1b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rejection Reason:</div>
                          <div style={{ color: '#991b1b', fontSize: '0.875rem' }}>{claim.rejectionReason}</div>
                        </div>
                      )}
                    </div>

                    {(claim.status === 'PENDING' || claim.status === 'IN_REVIEW') && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleApproveClaim(claim.id)}
                          style={{
                            flex: 1,
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
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectClaim(claim.id)}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)',
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
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    
                    {claim.status === 'APPROVED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Claim Approved
                      </div>
                    )}
                    
                    {claim.status === 'REJECTED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Claim Rejected
                      </div>
                    )}
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
                Payment Approvals
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                Review and approve payment requests from your customers
              </p>
            </div>

            {paymentsLoading ? (
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}>
                  No Payments to Review
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  There are currently no payments pending your approval.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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
                        💰
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: payment.status === "PENDING" ? '#fef3c7' : payment.status === "APPROVED" ? '#dcfce7' : payment.status === "REJECTED" ? '#fee2e2' : payment.status === "PAID" ? '#dbeafe' : '#e0e7ff',
                        color: payment.status === "PENDING" ? '#92400e' : payment.status === "APPROVED" ? '#166534' : payment.status === "REJECTED" ? '#991b1b' : payment.status === "PAID" ? '#1e40af' : '#3730a3'
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
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {payment.customer.firstName} {payment.customer.lastName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{payment.policy.policyNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>₺{payment.amount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{payment.policy.insuranceType}</span>
                      </div>
                      {payment.paymentDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment Date:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {payment.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleApprovePayment(payment.id)}
                          style={{
                            flex: 1,
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
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayment(payment.id)}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)',
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
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    
                    {payment.status === 'APPROVED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Payment Approved
                      </div>
                    )}
                    
                    {payment.status === 'REJECTED' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Payment Rejected
                      </div>
                    )}

                    {payment.status === 'PAID' && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Payment Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            { id: 'offers', label: 'Pending Offers', icon: '📄' },
            { id: 'claims', label: 'Claims Review', icon: '🔧' },
            { id: 'payments', label: 'Payment Approvals', icon: '💰' },
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

      {/* Premium Revision Modal */}
      {reviseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Revise Premium
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                New Premium Amount (₺)
              </label>
              <input
                type="number"
                step="0.01"
                value={newPremium}
                onChange={(e) => setNewPremium(e.target.value)}
                placeholder="Enter new premium amount"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Revision Note (Optional)
              </label>
              <textarea
                value={reviseNote}
                onChange={(e) => setReviseNote(e.target.value)}
                placeholder="Explain the reason for premium revision..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setReviseModalOpen(false);
                  setSelectedOfferId(null);
                  setNewPremium('');
                  setReviseNote('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRevision}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
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
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add spin animation for loading spinners */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 