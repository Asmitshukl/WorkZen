// src/pages/timeoff/MyTimeOffPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTimeOffRequests } from '@api/timeoffAPI';
import { useNotification } from '@hooks/useNotification';
import Button from '@components/common/Button';
import TimeOffList from '@components/timeoff/TimeOffList';

const MyTimeOffPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeOffs();
  }, []);

  const fetchTimeOffs = async () => {
    try {
      const response = await getMyTimeOffRequests();
      setTimeOffs(response.data || []);
    } catch (error) {
      showError('Failed to load time off requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Time Off</h1>
          <p className="text-gray-600">Manage your leave requests</p>
        </div>
        <Button onClick={() => navigate('/timeoff')}>Request Time Off</Button>
      </div>

      <TimeOffList timeOffs={timeOffs} loading={loading} />
    </div>
  );
};

export default MyTimeOffPage;