// src/pages/auth/SetupAdminPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupAdmin } from '@api/authAPI';
import { useNotification } from '@hooks/useNotification';
import { validateEmail, validatePhone, validateName } from '@utils/validators';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { User, Mail, Phone, Building } from 'lucide-react';

const SetupAdminPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name, 'Full name');
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const companyError = validateName(formData.companyName, 'Company name');
    if (companyError) newErrors.companyName = companyError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      await setupAdmin(formData);
      
      showSuccess('Admin account created! Please check your email for OTP and login credentials.');
      navigate('/login');
    } catch (error) {
      showError(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Admin Account</h1>
          <p className="text-gray-600">Create the first admin account for your organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Company Name"
            name="companyName"
            type="text"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            icon={Building}
            required
          />

          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            maxLength={10}
            icon={Phone}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create Admin Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupAdminPage;