// src/api/payrollAPI.js
import api from './axios';

export const generatePayrun = async (data) => {
  return await api.post('/payroll/generate-payrun', data);
};

export const getAllPayruns = async () => {
  return await api.get('/payroll/payruns');
};

export const getPayrunById = async (id) => {
  return await api.get(`/payroll/payrun/${id}`);
};

export const validatePayrun = async (id) => {
  return await api.post(`/payroll/validate-payrun/${id}`);
};

export const getPayslipById = async (id) => {
  return await api.get(`/payroll/payslip/${id}`);
};

export const getMyPayslips = async () => {
  return await api.get('/payroll/my-payslips');
};

export const downloadPayslipPDF = async (id) => {
  const response = await fetch(`${api.defaults.baseURL}/payroll/payslip/${id}/pdf`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to download payslip');
  }
  
  const blob = await response.blob();
  return blob;
};

export const getDashboardStats = async () => {
  return await api.get('/payroll/dashboard-stats');
};