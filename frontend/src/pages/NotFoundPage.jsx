// src/pages/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-6">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;