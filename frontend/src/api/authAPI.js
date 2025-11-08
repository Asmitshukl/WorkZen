// src/api/authAPI.js
import api from './axios';

export const setupAdmin = async (data) => {
  return await api.post('/auth/setup-admin', data);
};

export const verifyOTP = async (data) => {
  return await api.post('/auth/verify-otp', data);
};

export const requestLoginOTP = async (email) => {
  return await api.post('/auth/request-login-otp', { email });
};

export const login = async (data) => {
  return await api.post('/auth/login', data);
};

export const changePassword = async (data) => {
  return await api.post('/auth/change-password', data);
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const logout = async () => {
  return await api.post('/auth/logout');
};