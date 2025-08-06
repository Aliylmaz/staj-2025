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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customer: {
    customerType: 'INDIVIDUAL' | 'CORPORATE';
    address: string;
    city: string;
    country: string;
    postalCode: string;
    nationalId?: string;
    dateOfBirth?: string;
    companyName?: string;
    taxNumber?: string;
    companyRegistrationNumber?: string;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
    active: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication
export const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', request);
  return response.data.data;
};

export const registerCustomer = async (request: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/register-customer', request);
  return response.data.data;
};

export const refreshToken = async (request: RefreshTokenRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/refresh-token', request);
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const forgotPassword = async (request: ForgotPasswordRequest): Promise<void> => {
  await api.post('/auth/forgot-password', request);
};

export const resetPassword = async (request: ResetPasswordRequest): Promise<void> => {
  await api.post('/auth/reset-password', request);
};

export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  await api.put('/auth/change-password', request);
};

export default api; 