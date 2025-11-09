// src/utils/timeZone.js

const IST_OFFSET = 330; // IST is UTC+5:30 (330 minutes)

export const getISTTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (IST_OFFSET * 60000));
};

export const formatToIST = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (IST_OFFSET * 60000));
};

export const getTodayDateIST = () => {
  const istDate = getISTTime();
  return istDate.toISOString().split('T')[0];
};

export const isWorkingHours = () => {
  const ist = getISTTime();
  const hours = ist.getHours();
  return hours >= 9 && hours < 18; // 9 AM to 6 PM IST
};

export const getWorkingHoursMessage = () => {
  const ist = getISTTime();
  const hours = ist.getHours();
  
  if (hours < 9) {
    return 'Working hours start at 9:00 AM IST';
  } else if (hours >= 18) {
    return 'Working hours are from 9:00 AM to 6:00 PM IST';
  }
  return '';
};