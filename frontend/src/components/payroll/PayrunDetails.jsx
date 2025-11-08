import React from 'react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import { formatCurrency, getMonthName } from '@utils/formatters';
import { Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

const PayrunDetails = ({ payrun, onValidate, validating }) => {
  if (!payrun) return null;

  const totalEmployees = payrun.payslips?.length || 0;
  const canValidate = payrun.status === 'Computed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Payrun - {getMonthName(payrun.month)} {payrun.year}
          </h2>
          <p className="text-gray-600 mt-1">Review payroll details and validate</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge status={payrun.status} />
          {canValidate && (
            <Button 
              onClick={onValidate} 
              loading={validating}
              icon={CheckCircle}
            >
              Validate & Send Payslips
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Gross Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(payrun.gross)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Net Amount</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(payrun.net)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Employer Cost</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(payrun.employer_cost)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payslips List */}
      <Card title="Employee Payslips">
        {!payrun.payslips || payrun.payslips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payslips found for this payrun
          </div>
        ) : (
          <div className="space-y-3">
            {payrun.payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-4">
                    {payslip.employee?.first_name?.[0]}{payslip.employee?.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {payslip.employee?.first_name} {payslip.employee?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{payslip.employee?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Gross</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(payslip.gross_wage)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Deductions</p>
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(payslip.total_deductions)}
                    </p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-sm text-gray-600">Net Salary</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(payslip.net_wage)}
                    </p>
                  </div>
                  <Badge status={payslip.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Breakdown Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Payroll Summary">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Employees</span>
              <span className="font-semibold">{totalEmployees}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Gross Payroll</span>
              <span className="font-semibold">{formatCurrency(payrun.gross)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Deductions</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(parseFloat(payrun.gross) - parseFloat(payrun.net))}
              </span>
            </div>
            <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
              <span className="font-semibold text-gray-900">Net Payroll</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(payrun.net)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Employer Contribution">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Employee Salaries</span>
              <span className="font-semibold">{formatCurrency(payrun.net)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Employer PF & Benefits</span>
              <span className="font-semibold">
                {formatCurrency(parseFloat(payrun.employer_cost) - parseFloat(payrun.net))}
              </span>
            </div>
            <div className="flex justify-between py-3 bg-orange-50 px-3 rounded-lg">
              <span className="font-semibold text-gray-900">Total Cost to Company</span>
              <span className="font-bold text-orange-600 text-lg">
                {formatCurrency(payrun.employer_cost)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PayrunDetails;