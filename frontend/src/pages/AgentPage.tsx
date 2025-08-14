import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updateOfferStatus,
  reviseOfferPremium,
  getMyCustomers,
  type CustomerDto,
  type AgentDto,
  getOffersByAgentId,
  getCurrentAgent,
  getMyAgentStatistics,
  approveClaim,
  rejectClaim,
  getPaymentsByAgent,
  type OfferDto,
  type ClaimDto,
  type PaymentDto,
  type AgentStatsDto,
  getMyActivePolicies,
  updatePolicyStatus,
  getPolicyById,
  getPolicyCoverages,
  updateAgentProfile,
  updateAgentUserProfile,
  getClaimsByAgent
} from '../services/agentApi';

export default function AgentPage() {
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'customers' | 'policies' | 'offers' | 'claims' | 'payments' | 'profile'>('dashboard');
  const [agentStats, setAgentStats] = useState<AgentStatsDto | null>(null);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [claims, setClaims] = useState<ClaimDto[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentDto | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [reviseModalOpen, setReviseModalOpen] = useState(false);
  const [newPremium, setNewPremium] = useState('');
  const [reviseNote, setReviseNote] = useState('');
  
  // Policy management states
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [policyCoverages, setPolicyCoverages] = useState<any[]>([]);
  const [policyActionSuccess, setPolicyActionSuccess] = useState<string | null>(null);
  const [policyActionError, setPolicyActionError] = useState<string | null>(null);
  
  // Claim approval states
  const [showClaimApprovalModal, setShowClaimApprovalModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  
  // Claim rejection states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [claimToReject, setClaimToReject] = useState<ClaimDto | null>(null);
  
  // Profile update states
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentAgent();
    fetchAgentStats();
    fetchCustomers();
  }, [navigate]);

  // Fetch agent-specific data when current agent is loaded
  useEffect(() => {
    if (currentAgent?.id) {
      fetchOffers();
      fetchClaims();
      fetchPayments();
      fetchPolicies();
    }
  }, [currentAgent]);

  const fetchCurrentAgent = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
      }
      
      console.log('🔑 Token found, fetching current agent...');
      const agent = await getCurrentAgent();
      console.log('👤 Current agent loaded:', agent);
      setCurrentAgent(agent);
      
      // Initialize profile form with current agent data
      if (agent) {
        setProfileFormData({
          email: agent.user?.email || '',
          phoneNumber: agent.phoneNumber || '',
          address: agent.address || '',
          city: agent.city || '',
          country: agent.country || '',
          postalCode: agent.postalCode || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching current agent:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        console.log('❌ Unauthorized, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }
      setCurrentAgent(null);
    }
  };

  const fetchAgentStats = async () => {
    try {
      const myStats = await getMyAgentStatistics();
      setAgentStats(myStats);
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      setAgentStats(null);
    }
  };

  const fetchOffers = async () => {
    if (!currentAgent?.id) {
      console.log('No current agent ID available');
      return;
    }
    
    setOffersLoading(true);
    try {
      const offersData = await getOffersByAgentId(currentAgent.id);
      // Filter only PENDING offers for the agent
      const pendingOffers = offersData.filter(offer => offer.status === 'PENDING');
      setOffers(pendingOffers);
      console.log('📋 Fetched offers for agent:', offersData);
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
      console.log('🔑 Fetched claims for agent:', claimsData);
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
      console.log('💰 Fetched payments for agent:', paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchPolicies = async () => {
    if (!currentAgent?.id) return;
    setPoliciesLoading(true);
    try {
      const policiesData = await getMyActivePolicies();
      setPolicies(policiesData);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies([]);
    } finally {
      setPoliciesLoading(false);
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
      // Debug authentication state
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      console.log('🔍 handleAcceptOffer - Token exists:', !!token);
      console.log('🔍 handleAcceptOffer - User role:', userRole);
      console.log('🔍 handleAcceptOffer - Token value:', token);
      
      const updateRequest = {
        offerId: offerId,
        status: 'APPROVED' as const
      };
      
      console.log('🔍 handleAcceptOffer - Sending request:', updateRequest);
      const updatedOffer = await updateOfferStatus(updateRequest);
      
      // Update the offers state with the updated offer
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === offerId ? updatedOffer : offer
        )
      );
      
      console.log('✅ Offer accepted successfully');
    } catch (error: any) {
      console.error('❌ Error accepting offer:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      alert('Failed to accept offer. Please try again.');
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      // Debug authentication state
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      console.log('🔍 handleRejectOffer - Token exists:', !!token);
      console.log('🔍 handleRejectOffer - User role:', userRole);
      console.log('🔍 handleRejectOffer - Token value:', token);
      
      const updateRequest = {
        offerId: offerId,
        status: 'REJECTED' as const
      };
      
      console.log('🔍 handleRejectOffer - Sending request:', updateRequest);
      await updateOfferStatus(updateRequest);
      
      // Remove from offers list since it's no longer pending
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer.id !== offerId)
      );
      
      console.log('✅ Offer rejected successfully');
    } catch (error: any) {
      console.error('❌ Error rejecting offer:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
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
    
    // Show modal to get approved amount
    setSelectedClaimId(claimId);
    setApprovedAmount('');
    setShowClaimApprovalModal(true);
  };

  const handleConfirmApproveClaim = async () => {
    if (!currentAgent?.id || !selectedClaimId || !approvedAmount) return;
    
    const amount = parseFloat(approvedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      const updatedClaim = await approveClaim(selectedClaimId, currentAgent.id, amount);
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === selectedClaimId ? updatedClaim : claim
        )
      );
      alert('Claim approved successfully');
      setShowClaimApprovalModal(false);
      setSelectedClaimId(null);
      setApprovedAmount('');
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve claim. Please try again.');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!currentAgent?.id) return;
    
    // Find the claim to reject
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    
    // Set claim to reject and open modal
    setClaimToReject(claim);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!currentAgent?.id || !claimToReject || !rejectReason.trim()) return;

    try {
      const updatedClaim = await rejectClaim(claimToReject.id, currentAgent.id, rejectReason);
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimToReject.id ? updatedClaim : claim
        )
      );
      
      // Close modal and show success message
      setShowRejectModal(false);
      setClaimToReject(null);
      setRejectReason('');
      alert('Claim rejected successfully');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Failed to reject claim. Please try again.');
    }
  };

  // Policy management functions
  const handleViewPolicy = async (policyId: number) => {
    try {
      setPolicyActionError(null);
      
      // Fetch detailed policy information
      const detailedPolicy = await getPolicyById(policyId);
      console.log('🔍 handleViewPolicy - detailed policy:', detailedPolicy);
      console.log('🔍 handleViewPolicy - policy customer:', detailedPolicy.customer);
      console.log('🔍 handleViewPolicy - policy customerName:', detailedPolicy.customerName);
      
      // Fetch policy coverages
      const coverages = await getPolicyCoverages(policyId);
      
      setSelectedPolicy(detailedPolicy);
      setPolicyCoverages(coverages);
      setShowPolicyDetails(true);
      
    } catch (error) {
      console.error('Error viewing policy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error viewing policy. Please try again.';
      setPolicyActionError(errorMessage);
      setTimeout(() => setPolicyActionError(null), 5000);
    }
  };

  // Policy management functions
  const handleUpdatePolicyStatus = async (policyId: number, newStatus: string) => {
    try {
      setPolicyActionError(null);
      
      await updatePolicyStatus(policyId, newStatus);
      
      // Update local state
      setPolicies(prevPolicies => 
        prevPolicies.map(policy => 
          policy.id === policyId ? { ...policy, status: newStatus } : policy
        )
      );
      
      // Update selected policy if it's the one being viewed
      if (selectedPolicy && selectedPolicy.id === policyId) {
        setSelectedPolicy((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
      
      setPolicyActionSuccess(`Policy status updated to ${newStatus} successfully!`);
      setTimeout(() => setPolicyActionSuccess(null), 5000);
      
    } catch (error) {
      console.error('Error updating policy status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error updating policy status. Please try again.';
      setPolicyActionError(errorMessage);
      setTimeout(() => setPolicyActionError(null), 5000);
    }
  };

  // Profile management functions
  const handleProfileUpdate = async () => {
    try {
      // Validate required fields
      if (!profileFormData.email) {
        alert('Please fill in the required field (Email)');
        return;
      }

      if (!currentAgent?.id) {
        alert('Agent ID not found. Please try again.');
        return;
      }

      // Update agent profile information
      const agentUpdateData = {
        email: profileFormData.email,
        phoneNumber: profileFormData.phoneNumber,
        address: profileFormData.address,
        city: profileFormData.city,
        country: profileFormData.country,
        postalCode: profileFormData.postalCode
      };

      await updateAgentProfile(currentAgent.id, agentUpdateData);

      // Update user information if user exists
      if (currentAgent.user?.id) {
        const userUpdateData = {
          firstName: currentAgent.user.firstName, // Keep existing firstName
          lastName: currentAgent.user.lastName,   // Keep existing lastName
          email: profileFormData.email,
          phoneNumber: profileFormData.phoneNumber
        };

        await updateAgentUserProfile(currentAgent.user.id, userUpdateData);
      }
      
      alert('Profile updated successfully!');
      setShowProfileUpdate(false);
      
      // Refresh agent data
      await fetchCurrentAgent();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const openProfileUpdate = () => {
    if (currentAgent) {
      setProfileFormData({
        email: currentAgent.user?.email || '',
        phoneNumber: currentAgent.phoneNumber || '',
        address: currentAgent.address || '',
        city: currentAgent.city || '',
        country: currentAgent.country || '',
        postalCode: currentAgent.postalCode || ''
      });
    }
    setShowProfileUpdate(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('agentNumber');
    navigate('/login');
  };

  const renderDashboard = () => (
    <div>
      {/* Page Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title text-2xl">Agent Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your customers and policies.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-6">
        {/* My Policies */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="text-sm text-gray-500 mb-1">My Policies</div>
              <div className="text-2xl font-bold text-blue-600">{policies.length}</div>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        {/* My Customers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="text-sm text-gray-500 mb-1">My Customers</div>
              <div className="text-2xl font-bold text-green-600">{customers.length}</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        
        {/* Pending Offers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="text-sm text-gray-500 mb-1">Pending Offers</div>
              <div className="text-2xl font-bold text-orange-600">{offers.length}</div>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        {/* Total Payments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Payments</div>
              <div className="text-2xl font-bold text-purple-600">
                €{payments
                  .filter(payment => payment.status === 'SUCCESS' || payment.status === 'PAID')
                  .reduce((sum, payment) => sum + (payment.amount || 0), 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Performance Statistics Section */}
      {agentStats && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Performance Statistics</h2>
          </div>
          <div className="grid grid-cols-3">
            {/* Total Policies */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Policies</div>
                  <div className="text-xl font-bold">{agentStats.totalPolicies || 0}</div>
                </div>
              </div>
            </div>

            {/* Total Claims */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🔑
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Claims</div>
                  <div className="text-xl font-bold">{agentStats.totalClaims || 0}</div>
                </div>
              </div>
            </div>

            {/* Total Offers */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  📝
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Offers</div>
                  <div className="text-xl font-bold">{agentStats.totalOffers || 0}</div>
                </div>
              </div>
            </div>

            {/* Approved Policies */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  ✅
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Approved Policies</div>
                  <div className="text-xl font-bold">{agentStats.approvedPolicies || 0}</div>
                </div>
              </div>
            </div>

            {/* Total Premium */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  💰
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Premium</div>
                  <div className="text-xl font-bold">€{(agentStats.totalPremium || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Total Claim Paid */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  💸
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Claim Paid</div>
                  <div className="text-xl font-bold">€{(agentStats.totalClaimPaid || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  📈
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
                  <div className="text-xl font-bold">{(agentStats.conversionRate || 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* No Claim Policy Rate */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🛡️
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">No Claim Rate</div>
                  <div className="text-xl font-bold">{(agentStats.noClaimPolicyRate || 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Net Profitability */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Net Profitability</div>
                  <div className="text-xl font-bold">{(agentStats.netProfitability || 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🏆
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Performance Score</div>
                  <div className="text-xl font-bold">{(agentStats.performanceScore || 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <button 
            onClick={() => setCurrentModule('customers')}
            className="btn btn-primary"
          >
            <span>👥</span>
            View Customers
          </button>

          <button 
            onClick={() => {
              setCurrentModule('policies');
              fetchPolicies();
            }}
            className="btn btn-primary"
          >
            <span>📋</span>
            Manage Policies
          </button>

          <button 
            onClick={() => setCurrentModule('offers')}
            className="btn btn-primary"
          >
            <span>📄</span>
            Review Offers
          </button>

          <button 
            onClick={() => setCurrentModule('claims')}
            className="btn btn-primary"
          >
            <span>🔧</span>
            Claims Review
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
                        ? `${customer.user?.firstName || 'N/A'} ${customer.user?.lastName || 'N/A'}` 
                        : customer.companyName || 'N/A'}
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer Number:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.customerNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Email:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.user?.email || customer.email || 'N/A'}</span>
                      </div>
                      {(customer.user?.phoneNumber || customer.phoneNumber) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Phone:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{customer.user?.phoneNumber || customer.phoneNumber}</span>
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
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                Policy Management
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                Manage and monitor your customers' insurance policies
              </p>
            </div>

            {/* Success/Error Messages */}
            {policyActionSuccess && (
              <div style={{
                padding: '1rem',
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #10b981',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>✅</span>
                {policyActionSuccess}
              </div>
            )}

            {policyActionError && (
              <div style={{
                padding: '1rem',
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>❌</span>
                {policyActionError}
              </div>
            )}

            {policiesLoading ? (
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
                  No Policies Found
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  You don't have any policies assigned to you yet. Policies will appear here once customers convert their approved offers.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {policies.map((policy) => (
                  <div key={policy.id} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
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
                    {/* Status indicator bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: policy.status === "ACTIVE" ? '#10b981' : 
                                policy.status === "EXPIRED" ? '#f59e0b' : 
                                policy.status === "CANCELLED" ? '#ef4444' : '#6b7280'
                    }}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: policy.status === "ACTIVE" ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                  policy.status === "EXPIRED" ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                  policy.status === "CANCELLED" ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        {policy.status === "ACTIVE" ? "✅" : 
                         policy.status === "EXPIRED" ? "⏰" : 
                         policy.status === "CANCELLED" ? "❌" : "📄"}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: policy.status === "ACTIVE" ? '#dcfce7' : 
                                  policy.status === "EXPIRED" ? '#fef3c7' : 
                                  policy.status === "CANCELLED" ? '#fee2e2' : '#e0e7ff',
                        color: policy.status === "ACTIVE" ? '#166534' : 
                              policy.status === "EXPIRED" ? '#92400e' : 
                              policy.status === "CANCELLED" ? '#991b1b' : '#3730a3'
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
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {policy.customer?.firstName} {policy.customer?.lastName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{policy.insuranceType}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Premium:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>€{policy.premium}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Start Date:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>End Date:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleViewPolicy(policy.id)}
                        style={{
                          padding: '0.75rem 2rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Policy Details Modal */}
            {showPolicyDetails && selectedPolicy && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  position: 'relative'
                }}>
                  {/* Close button */}
                  <button
                    onClick={() => setShowPolicyDetails(false)}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    ✕
                  </button>
                  
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '1.5rem'
                  }}>
                    Policy Details
                  </h2>
                  
                  {/* Policy Information */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Policy Number:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedPolicy.policyNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Status:</span>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: selectedPolicy.status === "ACTIVE" ? '#dcfce7' : 
                                  selectedPolicy.status === "EXPIRED" ? '#fef3c7' : 
                                  selectedPolicy.status === "CANCELLED" ? '#fee2e2' : '#e0e7ff',
                        color: selectedPolicy.status === "ACTIVE" ? '#166534' : 
                              selectedPolicy.status === "EXPIRED" ? '#92400e' : 
                              selectedPolicy.status === "CANCELLED" ? '#991b1b' : '#3730a3'
                      }}>
                        {selectedPolicy.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Customer:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {selectedPolicy.customerName || `${selectedPolicy.customer?.firstName || ''} ${selectedPolicy.customer?.lastName || ''}`.trim() || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Insurance Type:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedPolicy.insuranceType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Premium:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>€{selectedPolicy.premium}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Start Date:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {selectedPolicy.startDate ? new Date(selectedPolicy.startDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>End Date:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {selectedPolicy.endDate ? new Date(selectedPolicy.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Policy Coverages */}
                  {policyCoverages && policyCoverages.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: '1rem'
                      }}>
                        Coverages
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                      }}>
                        {policyCoverages.map((coverage: any) => (
                          <div key={coverage.id} style={{
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                              {coverage.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {coverage.description}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#1e293b', marginTop: '0.5rem' }}>
                              €{coverage.basePrice}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    {selectedPolicy.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdatePolicyStatus(selectedPolicy.id, 'ACTIVE')}
                        style={{
                          padding: '0.75rem 1.5rem',
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
                        ✅ Activate Policy
                      </button>
                    )}
                    
                    {selectedPolicy.status !== 'EXPIRED' && (
                      <button
                        onClick={() => handleUpdatePolicyStatus(selectedPolicy.id, 'EXPIRED')}
                        style={{
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
                        ⏰ Mark as Expired
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowPolicyDetails(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                        background: offer.status === "PENDING" ? '#fef3c7' : offer.status === "APPROVED" ? '#dcfce7' : offer.status === "REJECTED" ? '#fee2e2' : '#e0e7ff',
                        color: offer.status === "PENDING" ? '#92400e' : offer.status === "APPROVED" ? '#166534' : offer.status === "REJECTED" ? '#991b1b' : '#3730a3'
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
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>€{offer.totalPremium}</span>
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
                    
                    {offer.status === 'APPROVED' && (
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
                        Approved - Policy can be created by customer
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
                                background: claim.status === "SUBMITTED" ? '#fef3c7' : claim.status === "APPROVED" ? '#dcfce7' : claim.status === "REJECTED" ? '#fee2e2' : '#e0e7ff',
        color: claim.status === "SUBMITTED" ? '#92400e' : claim.status === "APPROVED" ? '#166534' : claim.status === "REJECTED" ? '#991b1b' : '#3730a3'
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
                          {claim.customer?.firstName && claim.customer?.lastName 
                            ? `${claim.customer.firstName} ${claim.customer.lastName}`
                            : claim.customer?.firstName || claim.customer?.lastName || 'N/A'
                          }
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{claim.policy?.policyNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Claim Amount:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          €{(claim.estimatedAmount || claim.approvedAmount || 0).toFixed(2)}
                        </span>
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

                    {(claim.status === 'SUBMITTED' || claim.status === 'IN_REVIEW' || claim.status === 'ADDITIONAL_INFO_REQUIRED') && (
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
                Customer Payments
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0
              }}>
                View all payments made by your customers for insurance policies
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
                  No Customer Payments
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  Your customers haven't made any payments yet. Payments will appear here once customers pay for their insurance policies.
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
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '1rem'
                    }}>
                      Payment #{payment.id}
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Customer:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {payment.customerName || 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Policy:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{payment.policyNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>€{payment.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{payment.insuranceType || 'N/A'}</span>
                      </div>
                      {payment.transactionReference && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Transaction Ref:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                            {payment.transactionReference}
                          </span>
                        </div>
                      )}
                      {payment.paymentDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment Date:</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Created:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '0.75rem 1rem',
                      background: payment.status === 'SUCCESS' ? '#dcfce7' : 
                                payment.status === 'PAID' ? '#dcfce7' :
                                payment.status === 'PENDING' ? '#fef3c7' : 
                                payment.status === 'APPROVED' ? '#dbeafe' : 
                                payment.status === 'FAILED' ? '#fee2e2' : '#fee2e2',
                      color: payment.status === 'SUCCESS' ? '#166534' : 
                            payment.status === 'PAID' ? '#166534' : 
                            payment.status === 'PENDING' ? '#92400e' : 
                            payment.status === 'APPROVED' ? '#1e40af' : 
                            payment.status === 'FAILED' ? '#991b1b' : '#991b1b',
                      border: payment.status === 'SUCCESS' ? '1px solid #10b981' : 
                             payment.status === 'PAID' ? '1px solid #10b981' : 
                             payment.status === 'PENDING' ? '1px solid #f59e0b' : 
                             payment.status === 'APPROVED' ? '1px solid #3b82f6' : 
                             payment.status === 'FAILED' ? '1px solid #dc2626' : '1px solid #dc2626',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      {payment.status === 'SUCCESS' ? '✅ Payment Successful' : 
                       payment.status === 'PAID' ? '✅ Payment Completed' : 
                       payment.status === 'PENDING' ? '⏳ Payment Pending' : 
                       payment.status === 'APPROVED' ? '✅ Payment Approved' : 
                       payment.status === 'FAILED' ? '❌ Payment Failed' : '❌ Payment Rejected'}
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
                Manage your agent profile and personal information
              </p>
            </div>

            {currentAgent ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem'
              }}>
                {/* Current Profile Info */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '0.5rem'
                    }}>
                      Current Profile
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      Your current agent profile information
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Agent Number:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.agentNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Name:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {currentAgent.user?.firstName || currentAgent.name} {currentAgent.user?.lastName || ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Email:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Phone:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.phoneNumber || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Address:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.address || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>City:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.city || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Country:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.country || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Postal Code:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentAgent.postalCode || 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={openProfileUpdate}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}>
                  Profile Not Loaded
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem'
                }}>
                  Unable to load your agent profile. Please try refreshing the page.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-title">
            Insurceed - Agent Portal
          </div>
          <div className="header-actions">
            <span style={{ color: '#e2e8f0' }}>
              Welcome, {currentAgent?.name || 'Agent'}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ color: 'white', borderColor: 'white' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'customers', label: 'My Customers', icon: '👥' },
            { id: 'policies', label: 'Policies', icon: '📋' },
            { id: 'offers', label: 'Pending Offers', icon: '📄' },
            { id: 'claims', label: 'Claims Review', icon: '🔧' },
            { id: 'payments', label: 'Payments', icon: '💰' },
            { id: 'profile', label: 'My Profile', icon: '👤' }
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => setCurrentModule(module.id as any)}
              className={`nav-tab ${currentModule === module.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '0.5rem' }}>{module.icon}</span>
              {module.label}
            </button>
          ))}
        </div>

        {/* Module Content */}
        {renderModuleContent()}
      </div>

      {/* Profile Update Modal */}
      {showProfileUpdate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Update Profile</h3>
              <button 
                onClick={() => setShowProfileUpdate(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            {/* Profile Form */}
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={profileFormData.email}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={profileFormData.phoneNumber}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  value={profileFormData.address}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={profileFormData.city}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={profileFormData.country}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  value={profileFormData.postalCode}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Enter postal code"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setShowProfileUpdate(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Revision Modal */}
      {reviseModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Revise Premium</h3>
              <button 
                onClick={() => setReviseModalOpen(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">New Premium Amount (€)</label>
              <input
                type="number"
                value={newPremium}
                onChange={(e) => setNewPremium(e.target.value)}
                placeholder="Enter new premium amount"
                className="form-input"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Revision Note (Optional)</label>
              <textarea
                value={reviseNote}
                onChange={(e) => setReviseNote(e.target.value)}
                placeholder="Explain the reason for premium revision..."
                rows={3}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setReviseModalOpen(false);
                  setSelectedOfferId(null);
                  setNewPremium('');
                  setReviseNote('');
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRevision}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Approval Modal */}
      {showClaimApprovalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Approve Claim</h3>
              <button 
                onClick={() => setShowClaimApprovalModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Approved Amount (€)</label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Enter approved amount"
                className="form-input"
                step="0.01"
                min="0"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setShowClaimApprovalModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproveClaim}
                className="btn btn-success"
                style={{ flex: 1 }}
              >
                ✅ Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Rejection Modal */}
      {showRejectModal && claimToReject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reject Claim</h3>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            {/* Claim Details */}
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="card-title">Claim Details</h4>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <strong>Claim Number:</strong> {claimToReject.claimNumber}
                </div>
                <div>
                  <strong>Policy Number:</strong> {claimToReject.policy?.policyNumber || 'N/A'}
                </div>
                <div>
                  <strong>Customer:</strong> {claimToReject.customer?.firstName && claimToReject.customer?.lastName 
                    ? `${claimToReject.customer.firstName} ${claimToReject.customer.lastName}`
                    : claimToReject.customer?.firstName || claimToReject.customer?.lastName || 'N/A'
                  }
                </div>
                <div>
                  <strong>Claim Amount:</strong> €{claimToReject.estimatedAmount || 0}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this claim..."
                rows={4}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn btn-danger"
                style={{ flex: 1 }}
                disabled={!rejectReason.trim()}
              >
                ❌ Reject Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 