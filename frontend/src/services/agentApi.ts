import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interfaces
export interface OfferDto {
  id: number;
  offerNumber: string;
  totalPremium: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  customer: { id: string; firstName: string; lastName: string; email: string; };
  insuranceType: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferUpdateRequest {
  offerId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  note?: string;
}

export interface CustomerDto {
  id: string;
  customerNumber: string;
  customerType: 'INDIVIDUAL' | 'CORPORATE';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  assignedAgentId?: string;
}

export interface PolicyDto {
  id: number;
  policyNumber: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  premium: number;
  insuranceType: string;
  customer: { id: string; firstName: string; lastName: string; };
  agent?: { id: string; name: string; };
}

export interface AgentDto {
  id: string;
  agentNumber: string;
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  totalCustomersServed: number;
  totalPoliciesSold: number;

  successRate: number;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  isActive: boolean;
}

export interface AgentStatsDto {
  agentName: string;
  agentNumber: string;
  totalPolicies: number;
  totalClaims: number;
  totalPayments: number;
  totalPremium: number;

  successRate: number;
}

// Offer Management
export const getAllOffers = async (): Promise<OfferDto[]> => {
  const response = await axiosInstance.get('/api/v1/agent/offers');
  return response.data.data;
};

export const updateOfferStatus = async (request: OfferUpdateRequest): Promise<OfferDto> => {
  const response = await axiosInstance.post('/api/v1/agent/offers/update-status', request);
  return response.data.data;
};

// Customer Management
export const getMyCustomers = async (): Promise<CustomerDto[]> => {
  const response = await axiosInstance.get('/api/v1/agent/my-customers');
  return response.data.data;
};



// Policy Management
export const getMyActivePolicies = async (): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get('/api/v1/agent/active-policies');
  return response.data.data;
};

export const getMyExpiredPolicies = async (): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get('/api/v1/agent/expired-policies');
  return response.data.data;
};

export const assignPolicyToAgent = async (policyId: number, agentId: string): Promise<PolicyDto> => {
  const response = await axiosInstance.post(`/api/v1/agent/policies/${policyId}/assign/${agentId}`);
  return response.data.data;
};

// Agent Profile
export const getAgentProfile = async (agentId: string): Promise<AgentDto> => {
  const response = await axiosInstance.get(`/api/v1/agent/profile/${agentId}`);
  return response.data.data;
};

export const updateAgentProfile = async (agentId: string, agentData: Partial<AgentDto>): Promise<AgentDto> => {
  const response = await axiosInstance.put(`/api/v1/agent/profile/${agentId}`, agentData);
  return response.data.data;
};

// Agent Statistics
export const getMyCustomersCount = async (): Promise<number> => {
  const response = await axiosInstance.get('/api/v1/agent/statistics/customers-count');
  return response.data.data;
};

export const getMyActivePoliciesCount = async (): Promise<number> => {
  const response = await axiosInstance.get('/api/v1/agent/statistics/active-policies-count');
  return response.data.data;
};

export const getMyPendingClaimsCount = async (): Promise<number> => {
  const response = await axiosInstance.get('/api/v1/agent/statistics/pending-claims-count');
  return response.data.data;
};

// Statistics
// Get individual agent statistics (uses current authenticated agent)
export const getMyAgentStatistics = async (): Promise<AgentStatsDto> => {
  const response = await axiosInstance.get('/api/v1/agent/statistics');
  return response.data.data;
};

// Get all agent statistics (admin endpoint)
export const getAgentStatistics = async (): Promise<AgentStatsDto[]> => {
  const response = await axiosInstance.get('/api/v1/admin/agent-statistics');
  return response.data.data;
};

// Claim Management Interfaces
export interface ClaimDto {
  id: string;
  claimNumber: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  claimAmount: number;
  approvedAmount?: number;
  description: string;
  incidentDate: string;
  createdAt: string;
  rejectionReason?: string;
  policy: {
    id: number;
    policyNumber: string;
    insuranceType: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaymentDto {
  id: number;
  paymentNumber: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  paymentDate?: string;
  createdAt: string;
  policy: {
    id: number;
    policyNumber: string;
    insuranceType: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Claims Management (using existing backend endpoints)
export const getClaimsByAgent = async (agentId: string): Promise<ClaimDto[]> => {
  const response = await axiosInstance.get(`/api/v1/claims/agent/${agentId}`);
  return response.data.data;
};

export const approveClaim = async (claimId: string, agentId: string): Promise<ClaimDto> => {
  const response = await axiosInstance.put(`/api/v1/claims/${claimId}/approve/${agentId}`);
  return response.data.data;
};

export const rejectClaim = async (claimId: string, agentId: string, reason: string): Promise<ClaimDto> => {
  const response = await axiosInstance.put(`/api/v1/claims/${claimId}/reject/${agentId}?reason=${encodeURIComponent(reason)}`);
  return response.data.data;
};

// Payments Management (placeholder - endpoints may not exist yet)
export const getPaymentsByAgent = async (agentId: string): Promise<PaymentDto[]> => {
  try {
    const response = await axiosInstance.get(`/api/v1/payments/agent/${agentId}`);
    return response.data.data;
  } catch (error) {
    console.warn('Payment endpoints not available yet');
    return [];
  }
};

export const approvePayment = async (paymentId: number, agentId: string): Promise<PaymentDto> => {
  const response = await axiosInstance.put(`/api/v1/payments/${paymentId}/approve/${agentId}`);
  return response.data.data;
};

export const rejectPayment = async (paymentId: number, agentId: string, reason: string): Promise<PaymentDto> => {
  const response = await axiosInstance.put(`/api/v1/payments/${paymentId}/reject/${agentId}?reason=${encodeURIComponent(reason)}`);
  return response.data.data;
};

// Premium Revision (placeholder - endpoint may not exist yet)
export const reviseOfferPremium = async (offerId: number, newPremium: number, note?: string): Promise<OfferDto> => {
  try {
    const response = await axiosInstance.put(`/api/v1/agent/offers/${offerId}/revise-premium`, {
      newPremium,
      note
    });
    return response.data.data;
  } catch (error) {
    console.warn('Premium revision endpoint not available yet');
    throw error;
  }
};

// Get current agent info from token
export const getCurrentAgent = async (): Promise<AgentDto> => {
  const response = await axiosInstance.get('/api/v1/agent/current');
  return response.data.data;
}; 