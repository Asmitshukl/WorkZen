// src/pages/payroll/PayrollPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPayruns } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import PayrunGenerator from '@components/payroll/PayrunGenerator';
import PayrunList from '@components/payroll/PayrunList';

const PayrollPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayruns();
  }, []);

  const fetchPayruns = async () => {
    try {
      const response = await getAllPayruns();
      setPayruns(response.data || []);
    } catch (error) {
      showError('Failed to load payruns');
    } finally {
      setLoading(false);
    }
  };

  const handlePayrunSelect = (payrun) => {
    navigate(`/payroll/payrun/${payrun.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600">Generate and manage employee payruns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <PayrunGenerator onSuccess={fetchPayruns} />
        </div>
        <div className="lg:col-span-2">
          <Card title="Payruns">
            <PayrunList 
              payruns={payruns} 
              loading={loading} 
              onSelect={handlePayrunSelect}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;