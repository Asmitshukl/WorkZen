// src/utils/formatters.js

// Format date to DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Format time to HH:MM AM/PM
export const formatTime = (datetime) => {
  if (!datetime) return '-';
  
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format datetime
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '-';
  
  return `${formatDate(datetime)} ${formatTime(datetime)}`;
};

// Format currency (INR)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  
  const num = parseFloat(amount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Format work hours
export const formatWorkHours = (hours) => {
  if (!hours || isNaN(hours)) return '0h 0m';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  return `${h}h ${m}m`;
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  const cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
};

// Get month name
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[month - 1] || '';
};

// Get month short name
export const getMonthShort = (month) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months[month - 1] || '';
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format name (First Last)
export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return '-';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Get initials
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatWorkHours,
  formatPhone,
  getMonthName,
  getMonthShort,
  formatFileSize,
  capitalizeFirst,
  formatName,
  getInitials,
  formatPercentage,
  truncateText,
  formatRelativeTime
};