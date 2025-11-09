import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Loader from '@components/common/Loader';
import { getAllEmployees } from '@api/employeeAPI';
import { getAllPayruns, generatePayrun } from '@api/payrollAPI';
import { formatCurrency } from '@utils/formatters';
import { getISTTime } from '@utils/timeZone';
import { Calendar, DollarSign, Users, Clock, AlertCircle } from 'lucide-react';
import { useNotification } from '@hooks/useNotification';

const PayrollOfficerDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activePayrun: null,
    pendingPayments: 0,
    totalSalaryPayout: 0,
    recentPayruns: [],
    employeeAttendance: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeesRes = await getAllEmployees();
      if (!employeesRes?.success) {
        throw new Error('Failed to fetch employee data');
      }

      const employeesList = employeesRes.data || [];
      const activeEmployees = employeesList.filter(emp => 
        emp.is_active && emp.role?.toLowerCase() !== 'admin'
      );

      // Calculate attendance stats for current month
      const currentDate = getISTTime();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const employeeAttendance = await Promise.all(
        activeEmployees.map(async (employee) => {
          const daysPresent = employee.attendance?.filter(att => 
            new Date(att.date) >= firstDayOfMonth && att.status === 'present'
          ).length || 0;

          const daysAbsent = employee.attendance?.filter(att => 
            new Date(att.date) >= firstDayOfMonth && att.status === 'absent'
          ).length || 0;

          return {
            id: employee.id,
            name: employee.name,
            department: employee.department,
            baseSalary: employee.salary?.base || 0,
            daysPresent,
            daysAbsent,
            totalWorkingDays: employee.attendance?.length || 0
          };
        })
      );

      // Fetch payruns
      const payrunsRes = await getAllPayruns();
      const payruns = payrunsRes?.data || [];
      const recentPayruns = payruns.slice(0, 5);
      
      // Find active payrun for current month
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const activePayrun = payruns.find(p => 
        p.month === currentMonth && p.year === currentYear
      );

      // Calculate total pending payments
      const totalSalaryPayout = activeEmployees.reduce((total, emp) => 
        total + (emp.salary?.base || 0), 0
      );

      setStats({
        totalEmployees: activeEmployees.length,
        activePayrun,
        pendingPayments: activePayrun ? 0 : activeEmployees.length,
        totalSalaryPayout,
        recentPayruns,
        employeeAttendance
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayrun = async () => {
    try {
      setLoading(true);
      const currentDate = getISTTime();
      const result = await generatePayrun({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });

      if (result.success) {
        showSuccess('Payrun generated successfully');
        fetchDashboardData();
      } else {
        throw new Error(result.message || 'Failed to generate payrun');
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Dashboard</h1>
          <p className="text-gray-600">Manage employee payroll and attendance</p>
        </div>
        {!stats.activePayrun && (
          <Button
            onClick={handleGeneratePayrun}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Generate Monthly Payrun
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.totalEmployees}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Salary Payout</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(stats.totalSalaryPayout)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.pendingPayments}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Payrun</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.activePayrun ? `${stats.activePayrun.month}/${stats.activePayrun.year}` : 'None'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Employee Attendance Overview */}
      <Card title="Employee Attendance & Salary Overview">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.employeeAttendance.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {employee.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">
                      {employee.daysPresent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600 font-medium">
                      {employee.daysAbsent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(employee.baseSalary)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => navigate(`/payroll/employees/${employee.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Payruns */}
      <Card title="Recent Payruns">
        <div className="space-y-4">
          {stats.recentPayruns.map((payrun) => (
            <div 
              key={payrun.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate(`/payroll/payruns/${payrun.id}`)}
            >
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {payrun.month}/{payrun.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(payrun.totalAmount)}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                payrun.status === 'Completed' ? 'bg-green-100 text-green-800' :
                payrun.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {payrun.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings and Alerts */}
      {stats.pendingPayments > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Pending Payroll Actions
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {stats.pendingPayments} employees are pending salary payment for the current month.
                Generate the monthly payrun to process their payments.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PayrollOfficerDashboard;