import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPayslips } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import PayslipCard from '@components/payroll/PayslipCard';
import { downloadPayslipPDF } from '@api/payrollAPI';

const MyPayslipsPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const response = await getMyPayslips();
      setPayslips(response.data || []);
    } catch (error) {
      showError('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payslip) => {
    navigate(`/payroll/payslip/${payslip.id}`);
  };

  const handleDownload = async (payslipId) => {
    try {
      const blob = await downloadPayslipPDF(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${payslipId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError('Failed to download payslip');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-gray-600">View and download your salary slips</p>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No payslips available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payslips.map((payslip) => (
              <PayslipCard
                key={payslip.id}
                payslip={payslip}
                onView={handleView}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyPayslipsPage;