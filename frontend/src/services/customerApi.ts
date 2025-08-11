import axios from 'axios';
import { getValidCustomerId } from '../utils/uuidUtils';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 Axios interceptor - Request URL:', config.url);
    console.log('🔐 Axios interceptor - Request method:', config.method);
    console.log('🔐 Axios interceptor - Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('🔐 Axios interceptor - Token value:', token);
    
    if (token) {
      // Check for common token issues
      if (token.trim() === '') {
        console.error('🔐 Axios interceptor - Token is empty or whitespace only');
      } else if (token.includes('undefined') || token.includes('null')) {
        console.error('🔐 Axios interceptor - Token contains undefined/null values');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Axios interceptor - Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        console.log('🔐 Axios interceptor - Full Authorization header:', config.headers.Authorization);
      }
    } else {
      console.warn('🔐 Axios interceptor - No token found, skipping Authorization header');
    }
    
    console.log('🔐 Axios interceptor - All request headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('🔐 Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Axios response interceptor - Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Axios response interceptor - Error:', error.response?.status, error.response?.data);
    console.error('❌ Axios response interceptor - Error URL:', error.config?.url);
    console.error('❌ Axios response interceptor - Error method:', error.config?.method);
    console.error('❌ Axios response interceptor - Error headers:', error.config?.headers);
    console.error('❌ Axios response interceptor - Full error object:', error);
    
    if (error.response?.status === 401) {
      console.log('❌ Axios response interceptor - 401 Unauthorized, clearing localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('customerId');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('❌ Axios response interceptor - Redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Enums matching backend
export const InsuranceType = {
  VEHICLE: 'VEHICLE',
  HEALTH: 'HEALTH',
  HOME: 'HOME'
} as const;

export const FuelType = {
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
  GAS: 'GAS'
} as const;

export const GearType = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
  SEMI_AUTOMATIC: 'SEMI_AUTOMATIC'
} as const;

export const UsageType = {
  PERSONAL: 'PERSONAL',
  COMMERCIAL: 'COMMERCIAL',
  BUSINESS: 'BUSINESS',
  RENTAL: 'RENTAL'
} as const;

// Request interfaces matching backend
export interface AddVehicleRequest {
  customerId?: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  engineNumber: string;
  fuelType?: keyof typeof FuelType;
  gearType?: keyof typeof GearType;
  usageType?: keyof typeof UsageType;
  kilometers?: number;
  registrationDate?: string;
}

export interface CreateHomeInsuranceDetailRequest {
  address: string;
  buildingAge: number;
  squareMeters: number;
  earthquakeResistance: boolean;
  floorNumber?: number;
  totalFloors?: number;
  customerId?: string;
}

export interface CreateHealthInsuranceDetailRequest {
  CustomerId?: string;
  dateOfBirth: string;
  gender: string;
  medicalHistory?: string;
  height?: number;
  weight?: number;
  smoker?: boolean;
  chronicDiseases?: string;
  currentMedications?: string;
  allergies?: string;
  familyMedicalHistory?: string;
  bloodType?: string;
}

export interface CreateOfferRequest {
  insuranceType: keyof typeof InsuranceType;
  totalPremium?: number;
  note?: string;
  coverageIds?: number[];
  agentId?: string;
  vehicleRequest?: AddVehicleRequest;
  healthDetailRequest?: CreateHealthInsuranceDetailRequest;
  homeDetailRequest?: CreateHomeInsuranceDetailRequest;
}

export interface UpdateIndividualCustomerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface UpdateCorporateCustomerRequest {
  companyName?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface CoverageDto {
  id: number;
  code: string;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
}

export interface PolicyDto {
  id: number;
  policyNumber: string;
  customerId: string;
  insuranceType: string;
  startDate: string;
  endDate: string;
  totalPremium: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferDto {
  id: number;
  offerNumber: string;
  totalPremium: number;
  status: string;
  customer?: any;
  agent?: any;
  note?: string;
  coverages?: CoverageDto[];
  insuranceType?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  convertedAt?: string;
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  policyId: number;
  customerId: string;
  description: string;
  claimDate: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDto {
  id: string;
  paymentNumber: string;
  policyId: number;
  customerId: string;
  amount: number;
  status: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDto {
  id: string;
  documentNumber: string;
  customerId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDto {
  id: string;
  agentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequest {
  policyId: number;
  description: string;
  claimDate: string;
  amount: number;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: string;
}

// API functions
// Policies
export const getMyPolicies = async (): Promise<PolicyDto[]> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  console.log('getMyPolicies - customerId:', customerId);
  const response = await axiosInstance.get(`/customer/${customerId}/policies`);
  return response.data.data;
};

export const getPolicyById = async (policyId: number): Promise<PolicyDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/policies/${policyId}`);
  return response.data.data;
};

// Claims
export const getMyClaims = async (): Promise<ClaimDto[]> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  console.log('getMyClaims - customerId:', customerId);
  const response = await axiosInstance.get(`/customer/${customerId}/claims`);
  return response.data.data;
};

export const getClaimById = async (claimId: string): Promise<ClaimDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/claims/${claimId}`);
  return response.data.data;
};

export const createClaim = async (request: CreateClaimRequest): Promise<ClaimDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.post(`/customer/${customerId}/create-claim`, request);
  return response.data.data;
};

// Offers
export const getMyOffers = async (): Promise<OfferDto[]> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  console.log('getMyOffers - customerId:', customerId);
  const response = await axiosInstance.get(`/customer/${customerId}/get-offers`);
  return response.data.data;
};

export const requestOffer = async (requestData: CreateOfferRequest): Promise<OfferDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  
  const url = `/customer/${customerId}/create-offer`;
  
  console.log('🔍 requestOffer - customerId from localStorage:', customerId);
  console.log('🔍 requestOffer - requestData:', requestData);
  console.log('🔍 requestOffer - token from localStorage:', localStorage.getItem('token'));
  console.log('🔍 requestOffer - URL being called:', url);
  console.log('🔍 requestOffer - Request method: POST');
  
  const response = await axiosInstance.post(url, requestData);
  return response.data.data;
};

export const getOfferById = async (offerId: number): Promise<OfferDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  
  // Use the customer-specific endpoint that includes customer ID validation
  const response = await axiosInstance.get(`/customer/${customerId}/offers/${offerId}`);
  return response.data.data;
};





// Payments
export const getMyPayments = async (): Promise<PaymentDto[]> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/payments`);
  return response.data.data;
};

export const getPaymentById = async (paymentId: string): Promise<PaymentDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/payments/${paymentId}`);
  return response.data.data;
};

export const makePayment = async (
  policyId: number,
  request: CreatePaymentRequest
): Promise<PaymentDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.post(`/customer/${customerId}/policies/${policyId}/make-payment`, request);
  return response.data.data;
};

// Documents
export const getMyDocuments = async (): Promise<DocumentDto[]> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/documents`);
  return response.data.data;
};

export const uploadDocument = async (file: File): Promise<DocumentDto> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(`/customer/${customerId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const downloadDocument = async (documentId: number): Promise<Blob> => {
  const customerId = getValidCustomerId();
  if (!customerId) {
    throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
  }
  const response = await axiosInstance.get(`/customer/${customerId}/documents/${documentId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Coverages
export const getCoveragesByInsuranceType = async (insuranceType: keyof typeof InsuranceType): Promise<CoverageDto[]> => {
  const response = await axiosInstance.get(`/coverages/by-insurance-type?type=${insuranceType}`);
  return response.data.data;
};

export const getCoveragesByOfferId = async (offerId: number): Promise<CoverageDto[]> => {
  const response = await axiosInstance.get(`/coverages/by-offer/${offerId}`);
  return response.data.data;
};

// Agents
export const getAllAgents = async (): Promise<AgentDto[]> => {
  try {
    const customerId = getValidCustomerId();
    if (!customerId) {
      throw new Error('Valid Customer ID not found. Please ensure you are logged in and customer data is loaded.');
    }
    const response = await axiosInstance.get(`/customer/${customerId}/agents`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Update customer functions
export const updateIndividualCustomer = async (customerId: string, request: UpdateIndividualCustomerRequest): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/customer/${customerId}/individual`, request);
    return response.data.data;
  } catch (error) {
    console.error('Error updating individual customer:', error);
    throw error;
  }
};

export const updateCorporateCustomer = async (customerId: string, request: UpdateCorporateCustomerRequest): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/customer/${customerId}/corporate`, request);
    return response.data.data;
  } catch (error) {
    console.error('Error updating corporate customer:', error);
    throw error;
  }
};

// Export the axios instance for use in other components
export { axiosInstance }; 