// src/pages/payroll/PayrunDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPayrunById, validatePayrun } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import PayrunDetails from '@components/payroll/PayrunDetails';

const PayrunDetailsPage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [payrun, setPayrun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchPayrun();
  }, [id]);

  const fetchPayrun = async () => {
    try {
      const response = await getPayrunById(id);
      setPayrun(response.data);
    } catch (error) {
      showError('Failed to load payrun');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setValidating(true);
      await validatePayrun(id);
      showSuccess('Payrun validated and payslips sent to employees');
      fetchPayrun();
    } catch (error) {
      showError('Failed to validate payrun');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payrun) {
    return <div className="text-center py-12">Payrun not found</div>;
  }

  return (
    <PayrunDetails 
      payrun={payrun} 
      onValidate={handleValidate}
      validating={validating}
    />
  );
};

export default PayrunDetailsPage;