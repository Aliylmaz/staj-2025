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
  totalCommissionEarned: number;
  monthlyCommission: number;
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
  totalCommission: number;
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
export const getAllCustomers = async (): Promise<CustomerDto[]> => {
  const response = await axiosInstance.get('/api/v1/agent/customers');
  return response.data.data;
};

export const getMyCustomers = async (agentId: string): Promise<CustomerDto[]> => {
  const response = await axiosInstance.get(`/api/v1/agent/my-customers/${agentId}`);
  return response.data.data;
};

export const assignCustomerToAgent = async (customerId: string, agentId: string): Promise<CustomerDto> => {
  const response = await axiosInstance.post(`/api/v1/agent/customers/${customerId}/assign/${agentId}`);
  return response.data.data;
};

export const removeCustomerFromAgent = async (customerId: string, agentId: string): Promise<CustomerDto> => {
  const response = await axiosInstance.delete(`/api/v1/agent/customers/${customerId}/remove/${agentId}`);
  return response.data.data;
};

// Policy Management
export const getMyPolicies = async (agentId: string): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get(`/api/v1/agent/policies/${agentId}`);
  return response.data.data;
};

export const getMyActivePolicies = async (agentId: string): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get(`/api/v1/agent/active-policies/${agentId}`);
  return response.data.data;
};

export const getMyExpiredPolicies = async (agentId: string): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get(`/api/v1/agent/expired-policies/${agentId}`);
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
export const getMyCustomersCount = async (agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/statistics/customers-count/${agentId}`);
  return response.data.data;
};

export const getMyActivePoliciesCount = async (agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/statistics/active-policies-count/${agentId}`);
  return response.data.data;
};

export const getMyPendingClaimsCount = async (agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/statistics/pending-claims-count/${agentId}`);
  return response.data.data;
};

export const getMyMonthlyCommission = async (agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/statistics/monthly-commission/${agentId}`);
  return response.data.data;
};

export const getMyTotalCommission = async (agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/statistics/total-commission/${agentId}`);
  return response.data.data;
};

// Commission Tracking
export const getCommissionForPolicy = async (policyId: number, agentId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/v1/agent/commission/policy/${policyId}/${agentId}`);
  return response.data.data;
};

export const getPoliciesForCommissionCalculation = async (
  agentId: string, 
  month: string, 
  year: string
): Promise<PolicyDto[]> => {
  const response = await axiosInstance.get(`/api/v1/agent/commission/policies/${agentId}?month=${month}&year=${year}`);
  return response.data.data;
}; 

export const getAgentStatistics = async (): Promise<AgentStatsDto[]> => {
  const response = await axiosInstance.get('/api/v1/dashboard/agent-statistics');
  return response.data.data;
}; 