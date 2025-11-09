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
    <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&display=swap');
        
        .sketch-card {
          font-family: 'Patrick Hand', cursive;
          background: white;
          border: 3px solid #2d2d2d;
          border-radius: 8px;
          box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.15);
          position: relative;
        }
        
        .sketch-card::before {
          content: '★';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          color: #d1d5db;
        }
        
        .sketch-card::after {
          content: '♥';
          position: absolute;
          bottom: 15px;
          left: 20px;
          font-size: 20px;
          color: #fca5a5;
        }
        
        .sketch-title {
          font-family: 'Caveat', cursive;
          font-size: 2.5rem;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }
        
        .sketch-subtitle {
          font-family: 'Patrick Hand', cursive;
          font-size: 14px;
          color: #6b7280;
        }
        
        .sketch-input {
          font-family: 'Patrick Hand', cursive;
          border: 2px solid #2d2d2d;
          border-radius: 6px;
          padding: 12px 16px;
          font-size: 16px;
          background: white;
          transition: all 0.2s;
        }
        
        .sketch-input:focus {
          outline: none;
          border-color: #2d2d2d;
          box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.1);
        }
        
        .sketch-input.error {
          border-color: #ef4444;
        }
        
        .sketch-button {
          font-family: 'Patrick Hand', cursive;
          background: #2d2d2d;
          color: white;
          border: 3px solid #2d2d2d;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .sketch-label {
          font-family: 'Patrick Hand', cursive;
          font-size: 16px;
          font-weight: 600;
          color: #2d2d2d;
          margin-bottom: 6px;
          display: block;
        }
        
        .sketch-error {
          font-family: 'Patrick Hand', cursive;
          color: #ef4444;
          font-size: 14px;
          margin-top: 4px;
        }
        
        .sketch-link {
          font-family: 'Patrick Hand', cursive;
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
        }
        
        .sketch-link:hover {
          color: #2563eb;
        }
      `}</style>
      
      <div className="sketch-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="sketch-title text-gray-900 mb-2">
            Setup Admin Account
          </h1>
          <p className="sketch-subtitle">Create the first admin account for your organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sketch-label">
              Company Name *
            </label>
            <input
              name="companyName"
              type="text"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleChange}
              className={`sketch-input w-full ${errors.companyName ? 'error' : ''}`}
              required
            />
            {errors.companyName && (
              <p className="sketch-error">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="sketch-label">
              Full Name *
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={`sketch-input w-full ${errors.name ? 'error' : ''}`}
              required
            />
            {errors.name && (
              <p className="sketch-error">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="sketch-label">
              Email *
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`sketch-input w-full ${errors.email ? 'error' : ''}`}
              required
            />
            {errors.email && (
              <p className="sketch-error">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="sketch-label">
              Phone Number *
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              className={`sketch-input w-full ${errors.phone ? 'error' : ''}`}
              required
            />
            {errors.phone && (
              <p className="sketch-error">{errors.phone}</p>
            )}
          </div>

          <button
            type="submit"
            className="sketch-button w-full"
            disabled={loading}
          >
            Create Admin Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ fontFamily: 'Patrick Hand, cursive', color: '#6b7280' }}>
            Already have an account?{' '}
            <a href="/login" className="sketch-link font-medium">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupAdminPage;