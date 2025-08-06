import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../components/RegistrationForm';

export default function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      // Tarihi LocalDateTime formatına çevir
      let formattedDateOfBirth = null;
      if (data.customer.dateOfBirth) {
        // Tarih string'ini al ve saat bilgisini ekle (00:00:00)
        const dateStr = data.customer.dateOfBirth;
        formattedDateOfBirth = `${dateStr}T00:00:00`;
      }

      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          phoneNumber: data.phoneNumber,
          customer: {
            customerType: data.customer.customerType,
            nationalId: data.customer.nationalId,
            dateOfBirth: formattedDateOfBirth,
            companyName: data.customer.companyName,
            taxNumber: data.customer.taxNumber,
            companyRegistrationNumber: data.customer.companyRegistrationNumber,
            address: data.customer.address,
            city: data.customer.city,
            country: data.customer.country,
            postalCode: data.customer.postalCode,
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        alert('Registration successful! Redirecting to login page...');
        // Login sayfasına yönlendir
        navigate('/login');
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        alert('Registration failed: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationForm onSubmit={handleSubmit} loading={loading} />
  );
} 