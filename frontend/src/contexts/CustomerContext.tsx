import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/customerApi';

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
  fetchCustomer: () => Promise<void>;
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
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('CustomerContext - fetchCustomer called');
    console.log('CustomerContext - token exists:', !!token);
    console.log('CustomerContext - userRole:', userRole);
    
    if (!token || userRole !== 'CUSTOMER') {
      console.log('CustomerContext - No token or wrong role, clearing state');
      setCustomer(null);
      setCustomerId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('CustomerContext - Making API call to /api/v1/customer/current');
      const response = await axiosInstance.get('/api/v1/customer/current');

      console.log('CustomerContext - API call successful');
      const customerData = response.data.data;
      
      console.log('CustomerContext - Customer data received:', customerData);
      setCustomer(customerData);
      setCustomerId(customerData.id);
      localStorage.setItem('customerId', customerData.id);
      console.log('CustomerContext - Customer ID set to:', customerData.id);
      
    } catch (err: any) {
      console.error('CustomerContext - Error fetching customer:', err);
      
      if (err.response?.status === 401) {
        console.log('CustomerContext - 401 Unauthorized, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('customerId');
        setCustomer(null);
        setCustomerId(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('CustomerContext - useEffect triggered');
    console.log('CustomerContext - token exists:', !!token);
    console.log('CustomerContext - userRole:', userRole);
    
    if (token && userRole === 'CUSTOMER') {
      console.log('CustomerContext - Valid token and role found, fetching customer data');
      fetchCustomer();
    }
  }, []);

  // Listen for storage changes (when login happens)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      console.log('CustomerContext - Storage change detected');
      console.log('CustomerContext - token exists:', !!token);
      console.log('CustomerContext - userRole:', userRole);
      
      if (token && userRole === 'CUSTOMER') {
        console.log('CustomerContext - Valid token and role found after storage change');
        fetchCustomer();
      } else {
        console.log('CustomerContext - No token or wrong role after storage change, clearing state');
        setCustomer(null);
        setCustomerId(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: CustomerContextType = {
    customer,
    customerId,
    loading,
    error,
    fetchCustomer,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}; 