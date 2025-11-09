// src/pages/payroll/PayrollPage.jsx
import React from 'react';
import { useAuth } from '@hooks/useAuth';
import PayrollOfficerDashboard from './PayrollOfficerDashboard';
import MyPayslipsPage from './MyPayslipsPage';

const PayrollPage = () => {
  const { user } = useAuth();
  const isPayrollOfficer = user?.role?.toLowerCase() === 'payroll_officer';

  return (
    <div className="container mx-auto px-4 py-6">
      {isPayrollOfficer ? <PayrollOfficerDashboard /> : <MyPayslipsPage />}
    </div>
  );
};

export default PayrollPage;