// src/components/reports/AttendanceReport.jsx
import React, { useState } from 'react';
import { getAttendanceSummary } from '@api/reportAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import Select from '@components/common/Select';
import Button from '@components/common/Button';

const AttendanceReport = ({ employees }) => {
  const { showError } = useNotification();
  const [filters, setFilters] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceSummary(filters);
      setData(response.data);
    } catch (error) {
      showError('Failed to generate attendance report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Attendance Report">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Employee (Optional)"
            value={filters.employeeId}
            onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            options={[
              { value: '', label: 'All Employees' },
              ...(employees?.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` })) || [])
            ]}
          />
          <Select
            label="Month"
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: new Date(2000, i).toLocaleString('default', { month: 'long' })
            }))}
          />
          <Select
            label="Year"
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
            options={Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return { value: y, label: y.toString() };
            })}
          />
        </div>

        <Button onClick={handleGenerate} loading={loading}>
          Generate Report
        </Button>

        {data && data.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Days</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Leave</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Work Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.first_name} {record.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{record.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{record.total_days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">{record.present_days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">{record.absent_days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">{record.leave_days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{parseFloat(record.total_work_hours).toFixed(2)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AttendanceReport;