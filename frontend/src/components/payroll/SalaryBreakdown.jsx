import React from 'react';
import Card from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';

const SalaryBreakdown = ({ payslip }) => {
  if (!payslip) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Earnings">
        <div className="space-y-3">
          {payslip.earnings?.map((earning, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{earning.component}</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(earning.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t font-semibold">
            <span>Total Earnings</span>
            <span className="text-green-600">{formatCurrency(payslip.gross_wage)}</span>
          </div>
        </div>
      </Card>

      <Card title="Deductions">
        <div className="space-y-3">
          {payslip.deductions?.map((deduction, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{deduction.component}</span>
              <span className="text-sm font-medium text-red-600">
                -{formatCurrency(deduction.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t font-semibold">
            <span>Total Deductions</span>
            <span className="text-red-600">-{formatCurrency(payslip.total_deductions)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalaryBreakdown;