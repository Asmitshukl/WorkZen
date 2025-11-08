// src/components/payroll/PayrunList.jsx
import React from 'react';
import Badge from '@components/common/Badge';
import { formatCurrency } from '@utils/formatters';

const PayrunList = ({ payruns, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payruns || payruns.length === 0) {
    return <div className="text-center py-12 text-gray-500">No payruns found</div>;
  }

  return (
    <div className="space-y-4">
      {payruns.map((payrun) => (
        <div
          key={payrun.id}
          onClick={() => onSelect?.(payrun)}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(2000, payrun.month - 1).toLocaleString('default', { month: 'long' })} {payrun.year}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Gross: {formatCurrency(payrun.gross)}
                </p>
                <p className="text-sm text-gray-600">
                  Net: {formatCurrency(payrun.net)}
                </p>
                <p className="text-sm text-gray-600">
                  Employer Cost: {formatCurrency(payrun.employer_cost)}
                </p>
              </div>
            </div>
            <Badge status={payrun.status} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PayrunList;