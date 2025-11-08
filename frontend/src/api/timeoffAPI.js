// src/api/timeoffAPI.js
import api from './axios';

export const requestTimeOff = async (data) => {
  return await api.post('/timeoff', data);
};

export const getMyTimeOffRequests = async () => {
  return await api.get('/timeoff/my-requests');
};

export const getAllTimeOffRequests = async (params = {}) => {
  return await api.get('/timeoff/all', { params });
};

export const approveTimeOff = async (id) => {
  return await api.put(`/timeoff/${id}/approve`);
};

export const rejectTimeOff = async (id, reason) => {
  return await api.put(`/timeoff/${id}/reject`, { reason });
};

export const deleteTimeOffRequest = async (id) => {
  return await api.delete(`/timeoff/${id}`);
};