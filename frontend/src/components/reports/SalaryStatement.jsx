import React, { useState } from 'react';
import { getSalaryStatement } from '@api/reportAPI';
import { useNotification } from '@hooks/useNotification';
import Select from '@components/common/Select';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';

const SalaryStatement = ({ employees }) => {
  const { showError } = useNotification();
  const [employeeId, setEmployeeId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const employeeOptions = employees?.map(e => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`
  })) || [];

  const years = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: y.toString() };
  });

  const handleGenerate = async () => {
    if (!employeeId) {
      showError('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      const response = await getSalaryStatement({ employeeId, year });
      setData(response.data);
    } catch (error) {
      showError('Failed to generate salary statement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Salary Statement">
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={employeeOptions}
            placeholder="Select Employee"
            required
          />
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            options={years}
          />
        </div>

        <Button onClick={handleGenerate} loading={loading}>
          Generate Report
        </Button>

        {/* Report Data */}
        {data && (
          <div className="mt-6 space-y-6">
            {/* Employee Info */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {data.employee?.name || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Designation:</span> {data.employee?.designation || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Department:</span> {data.employee?.department || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Financial Year</p>
                  <p className="text-2xl font-bold text-blue-700">{year}</p>
                </div>
              </div>
            </div>

            {/* Monthly Data Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HRA
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowances
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.monthlyData && data.monthlyData.length > 0 ? (
                    data.monthlyData.map((month, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.month_name || `Month ${month.month}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                          {formatCurrency(month.basic || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                          {formatCurrency(month.hra || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                          {formatCurrency(month.allowances || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          -{formatCurrency(month.deductions || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                          {formatCurrency(month.net || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No salary data available for this period
                      </td>
                    </tr>
                  )}
                  
                  {/* Total Row */}
                  {data.yearlyTotals && (
                    <tr className="bg-blue-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Annual Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(data.yearlyTotals.basic || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(data.yearlyTotals.hra || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(data.yearlyTotals.allowances || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-700">
                        -{formatCurrency(data.yearlyTotals.deductions || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-700">
                        {formatCurrency(data.yearlyTotals.net || 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Cards */}
            {data.yearlyTotals && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-2">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-800">
                    {formatCurrency(
                      (data.yearlyTotals.basic || 0) + 
                      (data.yearlyTotals.hra || 0) + 
                      (data.yearlyTotals.allowances || 0)
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Annual gross salary</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-2">Total Deductions</p>
                  <p className="text-3xl font-bold text-red-800">
                    {formatCurrency(data.yearlyTotals.deductions || 0)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Tax, PF, and other deductions</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-2">Net Take Home</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {formatCurrency(data.yearlyTotals.net || 0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Annual net salary</p>
                </div>
              </div>
            )}

            {/* Download/Print Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => window.print()}
              >
                Print Statement
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  // Add export to CSV functionality if needed
                  alert('Export functionality coming soon!');
                }}
              >
                Export to PDF
              </Button>
            </div>
          </div>
        )}

        {/* No Data Selected State */}
        {!data && !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No statement generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select an employee and year to generate salary statement.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalaryStatement;