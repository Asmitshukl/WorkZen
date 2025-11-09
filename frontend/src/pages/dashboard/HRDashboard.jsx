// src/pages/dashboard/HRDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllEmployees } from '@api/employeeAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import EmployeeCard from '@components/employee/EmployeeCard';
import { Users, Briefcase, Building } from 'lucide-react';

const HRDashboard = () => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    absent: 0,
    departments: []
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const employeesRes = await getAllEmployees();
      
      if (employeesRes?.success !== false) {
        // Filter out admin users
        const employeesList = (employeesRes?.data || []).filter(
          emp => emp.role !== 'admin' && emp.role !== 'ADMIN'
        );

        // Calculate stats
        const presentCount = employeesList.filter(emp => 
          emp.attendance_status?.toLowerCase() === 'present'
        ).length;
        
        const leaveCount = employeesList.filter(emp => 
          emp.attendance_status?.toLowerCase() === 'leave'
        ).length;
        
        const absentCount = employeesList.filter(emp => 
          emp.attendance_status?.toLowerCase() === 'absent'
        ).length;

        // Get unique departments
        const departments = [...new Set(employeesList.map(emp => emp.department))].filter(Boolean);

        setStats({
          totalEmployees: employeesList.length,
          presentToday: presentCount,
          onLeave: leaveCount,
          absent: absentCount,
          departments
        });

        setEmployees(employeesList);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-600">Employee Attendance Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-700">{stats.presentToday}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-blue-700">{stats.onLeave}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.absent}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Filter */}
      <div className="flex items-center space-x-4">
        <Building className="w-5 h-5 text-gray-500" />
        <select
          className="form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          {stats.departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees
          .filter(emp => selectedDepartment === 'all' || emp.department === selectedDepartment)
          .map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee}
              onClick={(emp) => console.log('Employee clicked:', emp)}
            />
          ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;