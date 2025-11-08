// src/api/attendanceAPI.js
import api from './axios';

export const checkIn = async () => {
  return await api.post('/attendance/check-in');
};

export const checkOut = async () => {
  return await api.post('/attendance/check-out');
};

export const getMyAttendance = async (params = {}) => {
  return await api.get('/attendance/my-attendance', { params });
};

export const getAllAttendance = async (params = {}) => {
  return await api.get('/attendance/all', { params });
};

export const getAttendanceByDate = async (date) => {
  return await api.get(`/attendance/${date}`);
};

export const updateAttendance = async (id, data) => {
  return await api.put(`/attendance/${id}`, data);
};