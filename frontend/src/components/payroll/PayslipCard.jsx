import React from 'react';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import { formatCurrency } from '@utils/formatters';

const PayslipCard = ({ payslip, onView, onDownload }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {new Date(2000, payslip.payroll.month - 1).toLocaleString('default', { month: 'long' })} {payslip.payroll.year}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {payslip.salary_structure}
          </p>
        </div>
        <Badge status={payslip.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gross Wage:</span>
          <span className="font-medium">{formatCurrency(payslip.gross_wage)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Deductions:</span>
          <span className="font-medium text-red-600">-{formatCurrency(payslip.total_deductions)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
          <span>Net Wage:</span>
          <span className="text-green-600">{formatCurrency(payslip.net_wage)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onView?.(payslip)} className="flex-1">
          View Details
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDownload?.(payslip.id)} className="flex-1">
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default PayslipCard;