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

export interface AdminDashboardDto {
  totalCustomers: number;
  totalAgents: number;
  totalPolicies: number;
  totalClaims: number;
  totalOffers: number;
  totalPayments: number;
  pendingOffers: number;
  pendingClaims: number;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  active: boolean;
  createdAt: string;
}

export interface AgentDto {
  id: string;
  agentNumber: string;
  user: UserDto;
  specialization: string;
  licenseNumber: string;
  active: boolean;
  createdAt: string;
}

export interface CustomerDto {
  id: string;
  customerNumber: string;
  customerType: 'INDIVIDUAL' | 'CORPORATE';
  user: UserDto;
  nationalId?: string;
  dateOfBirth?: string;
  companyName?: string;
  taxNumber?: string;
  companyRegistrationNumber?: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
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
  agentId?: string;
  agentName?: string;
  createdAt: string;
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  description: string;
  incidentDate: string;
  status: string;
  policyId: number;
  customerName?: string;
  agentName?: string;
  estimatedAmount?: number;
  approvedAmount?: number;
  createdAt: string;
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
  agentId?: string;
  agentName?: string;
  createdAt: string;
}

export interface PaymentDto {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  policyId: number;
  customerName?: string;
  transactionReference: string;
  createdAt: string;
}

export interface CreateAgentRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
}

export interface UpdateAgentRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
  active: boolean;
}

// Admin Dashboard
export const getAdminDashboard = async (): Promise<AdminDashboardDto> => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

// User Management
export const getAllUsers = async (): Promise<UserDto[]> => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

export const getUserById = async (userId: string): Promise<UserDto> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data.data;
};

export const createUser = async (request: CreateAgentRequest): Promise<UserDto> => {
  const response = await api.post('/admin/users', request);
  return response.data.data;
};

export const updateUser = async (userId: string, request: any): Promise<UserDto> => {
  const response = await api.put(`/admin/users/${userId}`, request);
  return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

// Agent Management
export const getAllAgents = async (): Promise<AgentDto[]> => {
  const response = await api.get('/admin/agents');
  return response.data.data;
};

export const getAgentById = async (agentId: string): Promise<AgentDto> => {
  const response = await api.get(`/admin/agents/${agentId}`);
  return response.data.data;
};

export const createAgent = async (request: CreateAgentRequest): Promise<AgentDto> => {
  const response = await api.post('/admin/agents', request);
  return response.data.data;
};

export const updateAgent = async (agentId: string, request: UpdateAgentRequest): Promise<AgentDto> => {
  const response = await api.put(`/admin/agents/${agentId}`, request);
  return response.data.data;
};

export const deleteAgent = async (agentId: string): Promise<void> => {
  await api.delete(`/admin/agents/${agentId}`);
};

// Customer Management
export const getAllCustomers = async (): Promise<CustomerDto[]> => {
  const response = await api.get('/admin/customers');
  return response.data.data;
};

export const getCustomerById = async (customerId: string): Promise<CustomerDto> => {
  const response = await api.get(`/admin/customers/${customerId}`);
  return response.data.data;
};

// Policy Management
export const getAllPolicies = async (): Promise<PolicyDto[]> => {
  const response = await api.get('/admin/policies');
  return response.data.data;
};

export const getPolicyById = async (policyId: number): Promise<PolicyDto> => {
  const response = await api.get(`/policies/${policyId}`);
  return response.data.data;
};

// Claim Management
export const getAllClaims = async (): Promise<ClaimDto[]> => {
  const response = await api.get('/admin/claims');
  return response.data.data;
};

export const getClaimById = async (claimId: string): Promise<ClaimDto> => {
  const response = await api.get(`/claims/${claimId}`);
  return response.data.data;
};

// Offer Management
export const getAllOffers = async (): Promise<OfferDto[]> => {
  const response = await api.get('/offers');
  return response.data.data;
};

export const getOfferById = async (offerId: number): Promise<OfferDto> => {
  const response = await api.get(`/offers/${offerId}`);
  return response.data.data;
};

// Payment Management
export const getAllPayments = async (): Promise<PaymentDto[]> => {
  const response = await api.get('/admin/payments');
  return response.data.data;
};

export const getPaymentById = async (paymentId: string): Promise<PaymentDto> => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data.data;
};

export default api; 