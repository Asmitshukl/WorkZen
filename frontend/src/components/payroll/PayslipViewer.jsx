import React from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { formatCurrency, getMonthName } from '@utils/formatters';
import { Download, Calendar, User } from 'lucide-react';

const PayslipViewer = ({ payslip, onDownload, downloading }) => {
  if (!payslip) return null;

  const employee = payslip.employee;
  const payroll = payslip.payroll;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Salary Slip</h2>
            <p className="text-blue-100 mt-2">
              For the month of {getMonthName(payroll.month)} {payroll.year}
            </p>
          </div>
          <Button 
            variant="outline" 
            icon={Download} 
            onClick={onDownload}
            loading={downloading}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Employee Details */}
      <Card title="Employee Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Employee Name</p>
              <p className="font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Designation</p>
            <p className="font-semibold text-gray-900">{employee.designation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-semibold text-gray-900">{employee.department || 'N/A'}</p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pay Period</p>
              <p className="font-semibold text-gray-900">
                {new Date(payslip.pay_period_start).toLocaleDateString()} - {new Date(payslip.pay_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Details */}
      <Card title="Attendance Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Working Days</p>
            <p className="text-2xl font-bold text-green-700">{payslip.attendance_days}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Paid Leave</p>
            <p className="text-2xl font-bold text-blue-700">{payslip.paid_time_off_days}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Unpaid Leave</p>
            <p className="text-2xl font-bold text-orange-700">{payslip.unpaid_leave_days || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Total Days</p>
            <p className="text-2xl font-bold text-purple-700">{payslip.total_payable_days}</p>
          </div>
        </div>
      </Card>

      {/* Earnings and Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings */}
        <Card title="Earnings">
          <div className="space-y-3">
            {payslip.earnings && payslip.earnings.length > 0 ? (
              <>
                {payslip.earnings.map((earning, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{earning.component}</p>
                      {earning.percentage > 0 && (
                        <p className="text-xs text-gray-500">{earning.percentage}%</p>
                      )}
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(earning.amount)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                  <p className="font-bold text-gray-900">Total Earnings</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(payslip.gross_wage)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No earnings data</p>
            )}
          </div>
        </Card>

        {/* Deductions */}
        <Card title="Deductions">
          <div className="space-y-3">
            {payslip.deductions && payslip.deductions.length > 0 ? (
              <>
                {payslip.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-gray-900">{deduction.component}</p>
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(deduction.amount)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                  <p className="font-bold text-gray-900">Total Deductions</p>
                  <p className="text-xl font-bold text-red-600">
                    -{formatCurrency(payslip.total_deductions)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No deductions</p>
            )}
          </div>
        </Card>
      </div>

      {/* Net Salary */}
      <Card>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-700 font-medium mb-1">Net Payable Salary</p>
              <p className="text-sm text-green-600">Amount to be credited to your account</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-700">
                {formatCurrency(payslip.net_wage)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          This is a system-generated payslip and does not require a signature.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          For any queries, please contact the HR department.
        </p>
      </div>
    </div>
  );
};

export default PayslipViewer;