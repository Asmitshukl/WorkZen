// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllEmployees } from '@api/employeeAPI';
import { getDashboardStats } from '@api/payrollAPI';
import { getAllTimeOffRequests } from '@api/timeoffAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import { Users, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@utils/formatters';

const AdminDashboard = () => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTimeOffs: 0,
    recentPayruns: [],
    warnings: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [employeesRes, payrollStatsRes, timeOffRes] = await Promise.all([
        getAllEmployees(),
        getDashboardStats(),
        getAllTimeOffRequests({ status: 'Pending' })
      ]);

      setStats({
        totalEmployees: employeesRes.count || 0,
        activeEmployees: employeesRes.data?.filter(e => e.is_active).length || 0,
        pendingTimeOffs: timeOffRes.count || 0,
        recentPayruns: payrollStatsRes.data?.recentPayruns || [],
        warnings: payrollStatsRes.data?.warnings || {}
      });
    } catch (error) {
      showError('Failed to load dashboard data');
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your organization</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
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

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTimeOffs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Recent Payruns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentPayruns.length}</p>
            </div>
          </div>
        </Card>
      </div>

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