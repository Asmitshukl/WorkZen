// src/api/reportAPI.js
import api from './axios';

export const getSalaryStatement = async (params) => {
  return await api.get('/reports/salary-statement', { params });
};

export const getAttendanceSummary = async (params) => {
  return await api.get('/reports/attendance-summary', { params });
};

export const getEmployerCostReport = async (params) => {
  return await api.get('/reports/employer-cost', { params });
};

export const getEmployeeCountReport = async () => {
  return await api.get('/reports/employee-count');
};