import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AgentDashboardDto {
  totalCustomers: number;
  totalPolicies: number;
  totalClaims: number;
  totalOffers: number;
  pendingOffers: number;
  pendingClaims: number;
}

export interface AgentDto {
  id: string;
  agentNumber: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  specialization: string;
  licenseNumber: string;
  active: boolean;
}

export interface OfferDto {
  id: number;
  offerNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  totalPremium: number;
  insuranceType: string;
  note?: string;
  customerId: string;
  customerName?: string;
  createdAt: string;
  coverages?: CoverageDto[];
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  description: string;
  incidentDate: string;
  status: string;
  policyId: number;
  customerName?: string;
  estimatedAmount?: number;
  approvedAmount?: number;
  createdAt: string;
}

export interface PolicyDto {
  id: number;
  policyNumber: string;
  startDate: string;
  endDate: string;
  premium: number;
  status: string;
  insuranceType: string;
  customerId: string;
  customerName?: string;
}

export interface CoverageDto {
  id: number;
  code: string;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
}

// Agent Profile
export const getAgent = async (agentId: string): Promise<AgentDto> => {
  const response = await api.get(`/agent/${agentId}`);
  return response.data.data;
};

export const getCurrentAgent = async (): Promise<AgentDto> => {
  const response = await api.get('/agent/current');
  return response.data.data;
};

// Agent Dashboard
export const getAgentDashboard = async (agentId: string): Promise<AgentDashboardDto> => {
  const response = await api.get(`/agent/${agentId}/dashboard`);
  return response.data.data;
};

// Offers Management
export const getOffersByAgent = async (agentId: string): Promise<OfferDto[]> => {
  const response = await api.get(`/offers/agent/${agentId}`);
  return response.data.data;
};

export const approveOffer = async (offerId: number, agentId: string): Promise<OfferDto> => {
  const response = await api.put(`/offers/${offerId}/approve?agentId=${agentId}`);
  return response.data.data;
};

export const rejectOffer = async (offerId: number, agentId: string, reason: string): Promise<OfferDto> => {
  const response = await api.put(`/offers/${offerId}/reject?agentId=${agentId}&reason=${encodeURIComponent(reason)}`);
  return response.data.data;
};

export const getOfferById = async (offerId: number): Promise<OfferDto> => {
  const response = await api.get(`/offers/${offerId}`);
  return response.data.data;
};

// Claims Management
export const getClaimsByAgent = async (agentId: string): Promise<ClaimDto[]> => {
  const response = await api.get(`/claims/agent/${agentId}`);
  return response.data.data;
};

export const approveClaim = async (claimId: string, agentId: string): Promise<ClaimDto> => {
  const response = await api.put(`/claims/${claimId}/approve?agentId=${agentId}`);
  return response.data.data;
};

export const rejectClaim = async (claimId: string, agentId: string, reason: string): Promise<ClaimDto> => {
  const response = await api.put(`/claims/${claimId}/reject?agentId=${agentId}&reason=${encodeURIComponent(reason)}`);
  return response.data.data;
};

export const getClaimById = async (claimId: string): Promise<ClaimDto> => {
  const response = await api.get(`/claims/${claimId}`);
  return response.data.data;
};

// Policies Management
export const getPoliciesByAgent = async (agentId: string): Promise<PolicyDto[]> => {
  const response = await api.get(`/policies/agent/${agentId}`);
  return response.data.data;
};

export const getPolicyById = async (policyId: number): Promise<PolicyDto> => {
  const response = await api.get(`/policies/${policyId}`);
  return response.data.data;
};

// Coverages
export const getCoverages = async (): Promise<CoverageDto[]> => {
  const response = await api.get('/coverages');
  return response.data.data;
};

export default api; 