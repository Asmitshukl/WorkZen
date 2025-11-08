import React from 'react';
import { getStatusColor } from '@utils/helpers';

const Badge = ({ status, text, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status || text)} ${className}`}>
      {text || status}
    </span>
  );
};

export default Badge;