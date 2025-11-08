import React, { useState } from 'react';
import { getEmployerCostReport } from '@api/reportAPI';
import { useNotification } from '@hooks/useNotification';
import Select from '@components/common/Select';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CostReport = () => {
  const { showError } = useNotification();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: y.toString() };
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await getEmployerCostReport({ year });
      setData(response.data);
    } catch (error) {
      showError('Failed to generate cost report');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  return (
    <Card title="Employer Cost Report">
      <div className="space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
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
        </div>

        {data && data.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-2">Total Employer Cost</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(data.reduce((sum, item) => sum + item.employerCost, 0))}
                </p>
                <p className="text-xs text-blue-600 mt-1">Last 12 months</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <p className="text-sm text-green-600 font-medium mb-2">Total Net Payroll</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(data.reduce((sum, item) => sum + item.net, 0))}
                </p>
                <p className="text-xs text-green-600 mt-1">Employee salaries</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-2">Average Monthly Cost</p>
                <p className="text-3xl font-bold text-purple-700">
                  {formatCurrency(data.reduce((sum, item) => sum + item.employerCost, 0) / data.length)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Per month</p>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Gross Payroll
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Net Payroll
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Employer Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => {
                    const prevItem = data[index + 1];
                    const trend = prevItem ? calculateTrend(item.employerCost, prevItem.employerCost) : null;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(item.gross)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {formatCurrency(item.net)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          {formatCurrency(item.employerCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {trend !== null ? (
                            <div className={`flex items-center justify-end ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(trend).toFixed(1)}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(data.reduce((sum, item) => sum + item.gross, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      {formatCurrency(data.reduce((sum, item) => sum + item.net, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(data.reduce((sum, item) => sum + item.employerCost, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Cost Breakdown Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 mb-2">Employee Benefits & Contributions</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(
                      data.reduce((sum, item) => sum + (item.employerCost - item.net), 0)
                    )}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    PF, Insurance, and other benefits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 mb-2">Cost per Employee (Avg)</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(
                      data.reduce((sum, item) => sum + item.employerCost, 0) / data.length
                    )}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Monthly average employer cost
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No cost data available for the selected year
          </div>
        )}
      </div>
    </Card>
  );
};

export default CostReport;