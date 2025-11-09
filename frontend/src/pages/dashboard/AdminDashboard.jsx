// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllEmployees } from '@api/employeeAPI';
import { getAllPayruns } from '@api/payrollAPI';
import { getAllTimeOffRequests } from '@api/timeoffAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import EmployeeCard from '@components/employee/EmployeeCard';
import { Users, CheckCircle, XCircle, Clock, AlertCircle, Building } from 'lucide-react';
import { formatCurrency } from '@utils/formatters';
import { getISTTime } from '@utils/timeZone';

const AdminDashboard = () => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    leave: 0,
    absent: 0,
    not_checked_in: 0,
    departments: [],
    recentPayruns: [],
    warnings: {
      employeesWithoutBank: 0,
      employeesWithoutManager: 0
    }
  });
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAttendanceStatus = (employee) => {
    if (!employee.last_checkin_time) {
      const currentTime = getISTTime();
      const startOfDay = new Date(currentTime);
      startOfDay.setHours(10, 0, 0, 0); // 10 AM cutoff time
      
      if (currentTime > startOfDay) {
        return 'absent';
      }
      return 'not_checked_in';
    }

    if (employee.leave_status === 'approved') {
      return 'leave';
    }

    const checkinTime = new Date(employee.last_checkin_time);
    const currentTime = getISTTime();
    
    if (checkinTime.toDateString() === currentTime.toDateString()) {
      return 'present';
    }

    return 'absent';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize variables
      let recentPayruns = [];
      let pendingTimeOffs = 0;
      let uniqueDepartments = [];
      
      // Fetch employees data
      const employeesRes = await getAllEmployees();
      
      if (!employeesRes || employeesRes.success === false) {
        throw new Error('Failed to fetch employee data');
      }
      
      const employeesList = employeesRes?.data || [];
      const nonAdminEmployees = employeesList.filter(emp => 
        emp.role?.toLowerCase() !== 'admin'
      );

      // Process attendance and calculate stats
      const statusCounts = {
        present: 0,
        absent: 0,
        leave: 0,
        not_checked_in: 0
      };

      uniqueDepartments = [...new Set(nonAdminEmployees.map(emp => emp.department))].filter(Boolean);

      // Update employee statuses
      nonAdminEmployees.forEach(emp => {
        const status = getAttendanceStatus(emp);
        emp.attendance_status = status;
        statusCounts[status]++;
      });

      // Fetch payroll data
      try {
        const payrollRes = await getAllPayruns();
        if (payrollRes?.success && payrollRes?.data) {
          recentPayruns = payrollRes.data.slice(0, 5);
        }
      } catch (err) {
        console.error('Failed to fetch payroll data:', err);
        showError('Failed to load payroll information');
      }

      // Fetch pending time off requests
      try {
        const timeOffRes = await getAllTimeOffRequests({ status: 'Pending' });
        if (timeOffRes?.success) {
          pendingTimeOffs = timeOffRes?.data?.length || 0;
        }
      } catch (err) {
        console.error('Failed to fetch time off requests:', err);
        showError('Failed to load time off information');
      }

      // Calculate warnings
      const employeesWithoutBank = nonAdminEmployees.filter(emp => !emp.bank_details).length;
      const employeesWithoutManager = nonAdminEmployees.filter(emp => !emp.manager_id).length;

      // Update all stats at once
      setStats({
        totalEmployees: nonAdminEmployees.length,
        present: statusCounts.present,
        leave: statusCounts.leave,
        absent: statusCounts.absent,
        not_checked_in: statusCounts.not_checked_in,
        pendingTimeOffs,
        departments: uniqueDepartments,
        recentPayruns,
        warnings: {
          employeesWithoutBank,
          employeesWithoutManager
        }
      });

      setEmployees(nonAdminEmployees);
      return true;

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showError('Failed to load dashboard data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (employees.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Users className="h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">No employees found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Employee Attendance Overview</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Present</p>
              <p className="text-xl font-semibold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-xl font-semibold text-gray-900">{stats.leave}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-xl font-semibold text-gray-900">{stats.departments.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {stats.departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees
          .filter(emp => selectedDepartment === 'all' || emp.department === selectedDepartment)
          .map((employee) => (
          <Card 
            key={employee.id} 
            className="relative hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            {/* Attendance Status Badge */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center px-2 py-1 rounded-full ${
                employee.attendance_status === 'present' ? 'text-green-600 bg-green-50' :
                employee.attendance_status === 'leave' ? 'text-blue-600 bg-blue-50' :
                employee.attendance_status === 'absent' ? 'text-red-600 bg-red-50' :
                'text-yellow-600 bg-yellow-50'
              }`}>
                {employee.attendance_status === 'present' ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : employee.attendance_status === 'leave' ? (
                  <Clock className="w-4 h-4 mr-1" />
                ) : employee.attendance_status === 'absent' ? (
                  <XCircle className="w-4 h-4 mr-1" />
                ) : (
                  <Clock className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {employee.attendance_status === 'present' ? 'Present' :
                   employee.attendance_status === 'leave' ? 'On Leave' :
                   employee.attendance_status === 'absent' ? 'Absent' :
                   'Not Checked In'}
                </span>
              </div>
            </div>

            <div className="mt-2">
              {/* Employee Avatar */}
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {employee.avatar ? (
                  <img 
                    src={employee.avatar} 
                    alt={employee.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Employee Details */}
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.designation}</p>
              
              {/* Additional Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <p>ID: {employee.employee_id}</p>
                  <p>Department: {employee.department}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Warnings */}
      {(stats.warnings.employeesWithoutBank > 0 || stats.warnings.employeesWithoutManager > 0) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-yellow-900">Action Required</h3>
              <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                {stats.warnings.employeesWithoutBank > 0 && (
                  <li>• {stats.warnings.employeesWithoutBank} employee(s) without bank details</li>
                )}
                {stats.warnings.employeesWithoutManager > 0 && (
                  <li>• {stats.warnings.employeesWithoutManager} employee(s) without assigned manager</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Payruns */}
      <Card title="Recent Payruns">
        {stats.recentPayruns.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No payruns generated yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentPayruns.map((payrun) => (
              <div 
                key={payrun.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {payrun.month}/{payrun.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    Net: {formatCurrency(payrun.net)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payrun.status === 'Done' ? 'bg-green-100 text-green-800' :
                  payrun.status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {payrun.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;