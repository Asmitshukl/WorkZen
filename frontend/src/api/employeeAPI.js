// src/api/employeeAPI.js
import api from './axios';

export const getAllEmployees = async (params = {}) => {
  return await api.get('/employees', { params });
};

export const getEmployeeById = async (id) => {
  return await api.get(`/employees/${id}`);
};

export const createEmployee = async (data) => {
  return await api.post('/employees', data);
};

export const updateEmployee = async (id, data) => {
  return await api.put(`/employees/${id}`, data);
};

export const deleteEmployee = async (id) => {
  return await api.delete(`/employees/${id}`);
};

export const getMyProfile = async () => {
  return await api.get('/employees/me/profile');
};

export const updateMyProfile = async (data) => {
  return await api.put('/employees/me/profile', data);
};