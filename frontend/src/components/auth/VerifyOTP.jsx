// src/components/auth/VerifyOTP.jsx
import React, { useState } from 'react';
import { verifyOTP } from '@api/authAPI';
import { useNotification } from '@hooks/useNotification';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { Shield } from 'lucide-react';

const VerifyOTP = ({ email, onSuccess, onResend }) => {
  const { showSuccess, showError } = useNotification();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      showError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      await verifyOTP({ email, otp });
      showSuccess('OTP verified successfully');
      onSuccess?.();
    } catch (error) {
      showError(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Verify OTP</h3>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      <Input
        label="OTP Code"
        name="otp"
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
        required
      />

      <div className="space-y-3">
        <Button type="submit" fullWidth loading={loading}>
          Verify OTP
        </Button>
        
        {onResend && (
          <button
            type="button"
            onClick={onResend}
            className="w-full text-sm text-blue-600 hover:text-blue-700"
          >
            Didn't receive the code? Resend
          </button>
        )}
      </div>
    </form>
  );
};

export default VerifyOTP;