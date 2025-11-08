import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SetupAdminPage from './pages/auth/SetupAdminPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import HRDashboard from './pages/dashboard/HRDashboard';

// Employee Pages
import EmployeesPage from './pages/employee/EmployeesPage';
import AddEmployeePage from './pages/employee/AddEmployeePage';
import EditEmployeePage from './pages/employee/EditEmployeePage';
import EmployeeDetailsPage from './pages/employee/EmployeeDetailsPage';
import MyProfilePage from './pages/employee/MyProfilePage';

// Attendance Pages
import MyAttendancePage from './pages/attendance/MyAttendancePage';
import AttendancePage from './pages/attendance/AttendancePage';
import AttendanceManagementPage from './pages/attendance/AttendanceManagementPage';

// Time Off Pages
import MyTimeOffPage from './pages/timeoff/MyTimeOffPage';
import TimeOffPage from './pages/timeoff/TimeOffPage';
import ApproveTimeOffPage from './pages/timeoff/ApproveTimeOffPage';

// Payroll Pages
import PayrollPage from './pages/payroll/PayrollPage';
import PayrunDetailsPage from './pages/payroll/PayrunDetailsPage';
import MyPayslipsPage from './pages/payroll/MyPayslipsPage';
import PayslipViewPage from './pages/payroll/PayslipViewPage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Other
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'HR Officer':
        return <HRDashboard />;
      case 'Payroll Officer':
        return <AdminDashboard />;
      case 'Manager':
        return <EmployeeDashboard />;
      case 'Employee':
        return <EmployeeDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-admin" element={<SetupAdminPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Dashboard */}
        <Route path="/dashboard" element={getDashboardComponent()} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Profile & Settings */}
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Employees - Admin & HR */}
        <Route path="/employees" element={
          <PrivateRoute roles={['Admin', 'HR Officer']}>
            <EmployeesPage />
          </PrivateRoute>
        } />
        <Route path="/employees/add" element={
          <PrivateRoute roles={['Admin', 'HR Officer']}>
            <AddEmployeePage />
          </PrivateRoute>
        } />
        <Route path="/employees/:id" element={
          <PrivateRoute roles={['Admin', 'HR Officer']}>
            <EmployeeDetailsPage />
          </PrivateRoute>
        } />
        <Route path="/employees/:id/edit" element={
          <PrivateRoute roles={['Admin', 'HR Officer']}>
            <EditEmployeePage />
          </PrivateRoute>
        } />

        {/* Attendance */}
        <Route path="/attendance/my" element={<MyAttendancePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/manage" element={
          <PrivateRoute roles={['Admin', 'HR Officer']}>
            <AttendanceManagementPage />
          </PrivateRoute>
        } />

        {/* Time Off */}
        <Route path="/timeoff/my" element={<MyTimeOffPage />} />
        <Route path="/timeoff" element={<TimeOffPage />} />
        <Route path="/timeoff/approve" element={
          <PrivateRoute roles={['Admin', 'HR Officer', 'Manager']}>
            <ApproveTimeOffPage />
          </PrivateRoute>
        } />

        {/* Payroll */}
        <Route path="/payroll/my-payslips" element={<MyPayslipsPage />} />
        <Route path="/payroll/payslip/:id" element={<PayslipViewPage />} />
        <Route path="/payroll" element={
          <PrivateRoute roles={['Admin', 'Payroll Officer']}>
            <PayrollPage />
          </PrivateRoute>
        } />
        <Route path="/payroll/payrun/:id" element={
          <PrivateRoute roles={['Admin', 'Payroll Officer']}>
            <PayrunDetailsPage />
          </PrivateRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <PrivateRoute roles={['Admin', 'HR Officer', 'Payroll Officer']}>
            <ReportsPage />
          </PrivateRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;