// src/pages/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllEmployees } from '@api/employeeAPI';
import SalaryStatement from '@components/reports/SalaryStatement';
import AttendanceReport from '@components/reports/AttendanceReport';
import CostReport from '@components/reports/CostReport';

const ReportsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('salary');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to load employees');
    }
  };

  const tabs = [
    { id: 'salary', label: 'Salary Statement' },
    { id: 'attendance', label: 'Attendance Report' },
    { id: 'cost', label: 'Cost Report' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-600">Generate various reports and analytics</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'salary' && <SalaryStatement employees={employees} />}
        {activeTab === 'attendance' && <AttendanceReport employees={employees} />}
        {activeTab === 'cost' && <CostReport />}
      </div>
    </div>
  );
};

export default ReportsPage;