import { useState, useEffect, useCallback } from 'react';

type CustomerType = 'INDIVIDUAL' | 'CORPORATE';

interface RegistrationFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  customer: {
    customerType: CustomerType;
    nationalId?: string;
    dateOfBirth?: string;
    companyName?: string;
    taxNumber?: string;
    companyRegistrationNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
}

interface RegistrationFormProps {
  onSubmit?: (data: RegistrationFormData) => void;
  loading?: boolean;
}

export default function RegistrationForm({ onSubmit, loading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    customer: {
      customerType: 'INDIVIDUAL',
      nationalId: '',
      dateOfBirth: '',
      companyName: '',
      taxNumber: '',
      companyRegistrationNumber: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const form = document.getElementById('register-form-container');
    if (form) {
      form.animate(
        [
          { opacity: 0, transform: 'translateY(40px) scale(0.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 600, easing: 'cubic-bezier(.4,2,.3,1)', fill: 'forwards' }
      );
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customer.')) {
      const customerField = name.replace('customer.', '');
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Shared field validations
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    // Customer type specific validations
    if (formData.customer.customerType === 'INDIVIDUAL') {
      if (!formData.customer.nationalId?.trim()) newErrors['customer.nationalId'] = 'National ID is required';
      if (!formData.customer.dateOfBirth) newErrors['customer.dateOfBirth'] = 'Date of birth is required';
    } else if (formData.customer.customerType === 'CORPORATE') {
      if (!formData.customer.companyName?.trim()) newErrors['customer.companyName'] = 'Company name is required';
      if (!formData.customer.taxNumber?.trim()) newErrors['customer.taxNumber'] = 'Tax number is required';
      if (!formData.customer.companyRegistrationNumber?.trim()) newErrors['customer.companyRegistrationNumber'] = 'Company registration number is required';
      if (!formData.customer.address?.trim()) newErrors['customer.address'] = 'Address is required';
      if (!formData.customer.city?.trim()) newErrors['customer.city'] = 'City is required';
      if (!formData.customer.country?.trim()) newErrors['customer.country'] = 'Country is required';
      if (!formData.customer.postalCode?.trim()) newErrors['customer.postalCode'] = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Remove empty optional fields
      const cleanData = { ...formData };
      if (cleanData.customer.customerType === 'INDIVIDUAL') {
        delete cleanData.customer.companyName;
        delete cleanData.customer.taxNumber;
        delete cleanData.customer.companyRegistrationNumber;
        delete cleanData.customer.address;
        delete cleanData.customer.city;
        delete cleanData.customer.country;
        delete cleanData.customer.postalCode;
      } else {
        delete cleanData.customer.nationalId;
        delete cleanData.customer.dateOfBirth;
      }

      if (onSubmit) {
        onSubmit(cleanData);
        setIsSubmitting(false);
      } else {
        console.log('Registration form data:', cleanData);
        setIsSubmitting(false);
      }
    }
  };



  const SelectField = ({ 
    label, 
    name, 
    options, 
    required = false,
    error = ''
  }: {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    required?: boolean;
    error?: string;
  }) => (
    <div>
      <label htmlFor={name} style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData.customer.customerType}
        onChange={handleInputChange}
        required={required}
        style={{
          width: '100%',
          padding: '14px 16px',
          marginTop: 10,
          borderRadius: 12,
          border: error ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
          fontSize: 18,
          background: error ? '#fee2e2' : '#f9fafb',
          outline: 'none',
          transition: 'border 0.2s',
        }}
        onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
        onBlur={e => (e.currentTarget.style.border = error ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
      }}
    >
      {/* Blurred background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat',
          filter: 'blur(18px) brightness(0.7)',
          opacity: 0.22,
        }}
      />
      <main
        id="register-form-container"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 600,
          minWidth: 0,
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 28,
          boxShadow: '0 12px 48px 0 rgba(0,0,0,0.18)',
          padding: '3rem 2.5rem 2.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          minHeight: 600,
          margin: '2rem 0',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontWeight: 700, color: '#2563eb', fontSize: 36, letterSpacing: -1 }}>
          Create Account
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 16, marginBottom: 8 }}>
          Join our insurance platform
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Type Selection */}
          <SelectField
            label="Customer Type"
            name="customer.customerType"
            options={[
              { value: 'INDIVIDUAL', label: 'Individual Customer' },
              { value: 'CORPORATE', label: 'Corporate Customer' }
            ]}
            required
            error={errors['customer.customerType']}
          />

          {/* Shared Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="firstName" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                First Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter your first name"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginTop: 10,
                  borderRadius: 12,
                  border: errors.firstName ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                  fontSize: 18,
                  background: errors.firstName ? '#fee2e2' : '#f9fafb',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                onBlur={e => (e.currentTarget.style.border = errors.firstName ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
              />
              {errors.firstName && (
                <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                Last Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter your last name"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginTop: 10,
                  borderRadius: 12,
                  border: errors.lastName ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                  fontSize: 18,
                  background: errors.lastName ? '#fee2e2' : '#f9fafb',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                onBlur={e => (e.currentTarget.style.border = errors.lastName ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
              />
              {errors.lastName && (
                <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="username" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Username <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Choose a username"
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: errors.username ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                fontSize: 18,
                background: errors.username ? '#fee2e2' : '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
              onBlur={e => (e.currentTarget.style.border = errors.username ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
            />
            {errors.username && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: errors.email ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                fontSize: 18,
                background: errors.email ? '#fee2e2' : '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
              onBlur={e => (e.currentTarget.style.border = errors.email ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
            />
            {errors.email && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.email}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="password" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a password"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginTop: 10,
                    borderRadius: 12,
                    border: errors.password ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                    fontSize: 18,
                    background: errors.password ? '#fee2e2' : '#f9fafb',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                  onBlur={e => (e.currentTarget.style.border = errors.password ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                Confirm Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginTop: 10,
                    borderRadius: 12,
                    border: errors.confirmPassword ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                    fontSize: 18,
                    background: errors.confirmPassword ? '#fee2e2' : '#f9fafb',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                  onBlur={e => (e.currentTarget.style.border = errors.confirmPassword ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
              Phone Number <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: 10,
                borderRadius: 12,
                border: errors.phoneNumber ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                fontSize: 18,
                background: errors.phoneNumber ? '#fee2e2' : '#f9fafb',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
              onBlur={e => (e.currentTarget.style.border = errors.phoneNumber ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
            />
            {errors.phoneNumber && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors.phoneNumber}</p>
            )}
          </div>

          {/* Individual Customer Fields */}
          {formData.customer.customerType === 'INDIVIDUAL' && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: 16,
              padding: 20,
              border: '1px solid rgba(59, 130, 246, 0.2)',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 24, marginRight: 12 }}>👤</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e40af', margin: 0 }}>
                  Individual Customer Information
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="customer.nationalId" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    National ID <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.nationalId"
                    name="customer.nationalId"
                    type="text"
                    value={formData.customer.nationalId || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your national ID"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.nationalId'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.nationalId'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.nationalId'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.nationalId'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.nationalId']}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="customer.dateOfBirth" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Date of Birth <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.dateOfBirth"
                    name="customer.dateOfBirth"
                    type="date"
                    value={formData.customer.dateOfBirth || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.dateOfBirth'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.dateOfBirth'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.dateOfBirth'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.dateOfBirth'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.dateOfBirth']}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Corporate Customer Fields */}
          {formData.customer.customerType === 'CORPORATE' && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.05)',
              borderRadius: 16,
              padding: 20,
              border: '1px solid rgba(34, 197, 94, 0.2)',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 24, marginRight: 12 }}>🏢</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#15803d', margin: 0 }}>
                  Corporate Customer Information
                </h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="customer.companyName" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Company Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.companyName"
                    name="customer.companyName"
                    type="text"
                    value={formData.customer.companyName || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.companyName'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.companyName'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.companyName'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.companyName'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.companyName']}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="customer.taxNumber" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Tax Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.taxNumber"
                    name="customer.taxNumber"
                    type="text"
                    value={formData.customer.taxNumber || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter tax number"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.taxNumber'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.taxNumber'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.taxNumber'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.taxNumber'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.taxNumber']}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="customer.companyRegistrationNumber" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                  Company Registration Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="customer.companyRegistrationNumber"
                  name="customer.companyRegistrationNumber"
                  type="text"
                  value={formData.customer.companyRegistrationNumber || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter company registration number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginTop: 10,
                    borderRadius: 12,
                    border: errors['customer.companyRegistrationNumber'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                    fontSize: 18,
                    background: errors['customer.companyRegistrationNumber'] ? '#fee2e2' : '#f9fafb',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                  onBlur={e => (e.currentTarget.style.border = errors['customer.companyRegistrationNumber'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                />
                {errors['customer.companyRegistrationNumber'] && (
                  <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.companyRegistrationNumber']}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="customer.address" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.address"
                    name="customer.address"
                    type="text"
                    value={formData.customer.address || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company address"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.address'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.address'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.address'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.address'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.address']}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="customer.city" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    City <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.city"
                    name="customer.city"
                    type="text"
                    value={formData.customer.city || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter city"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.city'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.city'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.city'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.city'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.city']}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="customer.country" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Country <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.country"
                    name="customer.country"
                    type="text"
                    value={formData.customer.country || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter country"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.country'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.country'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.country'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.country'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.country']}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="customer.postalCode" style={{ fontWeight: 500, color: '#222', fontSize: 17 }}>
                    Postal Code <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="customer.postalCode"
                    name="customer.postalCode"
                    type="text"
                    value={formData.customer.postalCode || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter postal code"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: 10,
                      borderRadius: 12,
                      border: errors['customer.postalCode'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                      fontSize: 18,
                      background: errors['customer.postalCode'] ? '#fee2e2' : '#f9fafb',
                      outline: 'none',
                      transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
                    onBlur={e => (e.currentTarget.style.border = errors['customer.postalCode'] ? '1.5px solid #dc2626' : '1.5px solid #d1d5db')}
                  />
                  {errors['customer.postalCode'] && (
                    <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{errors['customer.postalCode']}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isSubmitting}
            style={{
              width: '100%',
              padding: '16px 0',
              background: (loading || isSubmitting) ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              marginTop: 8,
              boxShadow: '0 2px 8px #dbeafe',
              cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: 0.5,
            }}
          >
            {(loading || isSubmitting) ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {/* Back to Login Link */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a
              href="/login"
              style={{
                color: '#2563eb',
                fontWeight: 500,
                textDecoration: 'none',
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
            >
              ← Back to Login
            </a>
          </div>
        </form>
      </main>
      <style>{`
        html, body, #root {
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        @media (max-width: 600px) {
          #register-form-container {
            max-width: 99vw !important;
            padding: 1.2rem 0.2rem 1.2rem 0.2rem !important;
            min-height: 320px !important;
          }
          h2 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
}