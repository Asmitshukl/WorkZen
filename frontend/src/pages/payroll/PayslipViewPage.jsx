// src/pages/payroll/PayslipViewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPayslipById, downloadPayslipPDF } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import PayslipViewer from '@components/payroll/PayslipViewer';

const PayslipViewPage = () => {
  const { id } = useParams();
  const { showError } = useNotification();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchPayslip();
  }, [id]);

  const fetchPayslip = async () => {
    try {
      const response = await getPayslipById(id);
      setPayslip(response.data);
    } catch (error) {
      showError('Failed to load payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await downloadPayslipPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError('Failed to download payslip');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payslip) {
    return <div className="text-center py-12">Payslip not found</div>;
  }

  return (
    <PayslipViewer 
      payslip={payslip} 
      onDownload={handleDownload}
      downloading={downloading}
    />
  );
};

export default PayslipViewPage;