import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../services/customerApi';
import { setCustomerId, clearCustomerId, isCustomerIdReady } from '../utils/uuidUtils';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Customer {
  id: string;
  customerNumber: string;
  customerType: 'INDIVIDUAL' | 'CORPORATE';
  user: User;
  nationalId?: string;
  dateOfBirth?: string;
  companyName?: string;
  taxNumber?: string;
  companyRegistrationNumber?: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface CustomerContextType {
  customer: Customer | null;
  customerId: string | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  fetchCustomer: () => Promise<void>;
  clearCustomer: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: React.ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerId, setCustomerIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Clear customer data
  const clearCustomer = useCallback(() => {
    console.log('🧹 Clearing customer data');
    setCustomer(null);
    setCustomerIdState(null);
    setIsReady(false);
    setLoading(false);
    setError(null);
    clearCustomerId();
  }, []);

  const fetchCustomer = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔄 CustomerContext - fetchCustomer called');
    console.log('🔄 CustomerContext - token exists:', !!token);
    console.log('🔄 CustomerContext - userRole:', userRole);
    
    if (!token || userRole !== 'CUSTOMER') {
      console.log('❌ CustomerContext - No token or wrong role, clearing state');
      clearCustomer();
      return;
    }

    // Check if we already have valid customer data in localStorage
    const storedCustomerId = localStorage.getItem('customerId');
    if (isCustomerIdReady(storedCustomerId)) {
      console.log('✅ CustomerContext - Valid customer ID already in localStorage, skipping fetch');
      setCustomerIdState(storedCustomerId);
      setIsReady(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🌐 CustomerContext - Making API call to /api/v1/customer/current');
      const response = await axiosInstance.get('/api/v1/customer/current');

      console.log('✅ CustomerContext - API call successful');
      const customerData = response.data.data;
      
      console.log('📊 CustomerContext - Customer data received:', customerData);
      
      // Validate customer data
      if (!customerData || !customerData.id) {
        throw new Error('Invalid customer data received from server');
      }

      // Set customer data
      setCustomer(customerData);
      setCustomerIdState(customerData.id);
      
      // Set in localStorage with validation
      const success = setCustomerId(customerData.id);
      if (!success) {
        throw new Error('Failed to set customer ID in localStorage');
      }
      
      setIsReady(true);
      console.log('✅ CustomerContext - Customer ID set and ready:', customerData.id);
      
    } catch (err: any) {
      console.error('❌ CustomerContext - Error fetching customer:', err);
      
      if (err.response?.status === 401) {
        console.log('🔒 CustomerContext - 401 Unauthorized, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        clearCustomer();
        window.location.href = '/login';
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer data');
        setIsReady(false);
      }
    } finally {
      setLoading(false);
    }
  }, [clearCustomer]);

  // Initialize customer data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const storedCustomerId = localStorage.getItem('customerId');
    
    console.log('🚀 CustomerContext - useEffect triggered');
    console.log('🚀 CustomerContext - token exists:', !!token);
    console.log('🚀 CustomerContext - userRole:', userRole);
    console.log('🚀 CustomerContext - stored customerId:', storedCustomerId);
    
    if (token && userRole === 'CUSTOMER') {
      if (isCustomerIdReady(storedCustomerId)) {
        console.log('✅ CustomerContext - Valid stored customer ID found, setting state');
        setCustomerIdState(storedCustomerId);
        setIsReady(true);
      } else {
        console.log('🔄 CustomerContext - No valid customer ID, fetching from API');
        fetchCustomer();
      }
    } else {
      console.log('❌ CustomerContext - No token or wrong role, clearing state');
      clearCustomer();
    }
  }, []); // Empty dependency array to run only once on mount

  const value: CustomerContextType = {
    customer,
    customerId,
    loading,
    error,
    isReady,
    fetchCustomer,
    clearCustomer,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}; 