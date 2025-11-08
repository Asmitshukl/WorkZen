import React, { createContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  }, []);

  const showInfo = useCallback((message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  }, []);

  const showWarning = useCallback((message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
};