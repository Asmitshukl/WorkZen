// src/pages/timeoff/TimeOffPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestTimeOff } from '@api/timeoffAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import TimeOffForm from '@components/timeoff/TimeOffForm';

const TimeOffPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestTimeOff(formData);
      showSuccess('Time off request submitted successfully');
      navigate('/timeoff/my');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Request Time Off">
        <TimeOffForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default TimeOffPage;