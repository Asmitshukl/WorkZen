import React, { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { checkIn, checkOut, getMyAttendance } from '@api/attendanceAPI';
import { getMyTimeOffRequests } from '@api/timeoffAPI';
import { getMyPayslips } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import { Calendar, Clock, DollarSign, Plane } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@utils/formatters';
import { getISTTime, getTodayDateIST } from '@utils/timeZone';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(() => {
    // Try to get initial state from localStorage
    const saved = localStorage.getItem('todayAttendance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only use saved state if it's from today
        if (parsed.date === getTodayDateIST()) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved attendance:', e);
      }
    }
    return null;
  });
  const [stats, setStats] = useState({
    attendance: null,
    timeOff: [],
    payslips: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (skipAttendance = false) => {
    try {
      const loadingState = !skipAttendance;
      if (loadingState) setLoading(true);
      setIsRefreshing(true);
      
      const istDate = getISTTime();
      const todayStr = getTodayDateIST();
      
      const [attendanceRes, timeOffRes, payslipsRes] = await Promise.all([
        getMyAttendance({ 
          month: istDate.getMonth() + 1, 
          year: istDate.getFullYear() 
        }),
        getMyTimeOffRequests(),
        getMyPayslips()
      ]);

      setStats({
        attendance: attendanceRes.data?.stats,
        timeOff: timeOffRes.data?.slice(0, 3) || [],
        payslips: payslipsRes.data?.slice(0, 3) || []
      });

      // Only update attendance if not skipped and we don't have an optimistic update in progress
      if (!skipAttendance) {
        const todayRecord = attendanceRes.data?.records?.find(r => r.date === todayStr);
        
        if (todayRecord) {
          // Ensure we preserve check-in/check-out state properly
          const newAttendance = {
            ...todayRecord,
            check_in: todayRecord.check_in || null,
            check_out: todayRecord.check_out || null,
            date: todayStr
          };
          
          console.debug('[EmployeeDashboard] Updating attendance from fetch:', newAttendance);
          
          // Only update if the state is different
          setTodayAttendance(prev => {
            if (!prev || 
                prev.check_in !== newAttendance.check_in || 
                prev.check_out !== newAttendance.check_out) {
              return newAttendance;
            }
            return prev;
          });
        } else {
          // If no record exists for today, explicitly set to null
          setTodayAttendance(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    finally {
      if (!skipAttendance) setLoading(false);
      setIsRefreshing(false);
      console.debug('[EmployeeDashboard] fetchDashboardData finished, skipAttendance=', skipAttendance);
    }
  };

  const refreshInBackground = async () => {
    if (isRefreshing) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchDashboardData(true); // Skip attendance update
  };

  const handleCheckIn = async () => {
    if (loading || isRefreshing) return;

    try {
      setLoading(true);
      const res = await checkIn();
      console.debug('[EmployeeDashboard] Check-in response:', res.data);

      // Try to extract check-in timestamp from response, fall back to now
      const checkInTime = res?.data?.check_in || res?.data?.record?.check_in || res?.data?.attendance?.check_in || new Date().toISOString();
      
      const newAttendance = {
        ...(todayAttendance || {}),
        date: getTodayDateIST(),
        check_in: checkInTime,
        check_out: null // Ensure check_out is null when checking in
      };
      
      console.debug('[EmployeeDashboard] Setting attendance to:', newAttendance);
      // Save to localStorage and state
      localStorage.setItem('todayAttendance', JSON.stringify(newAttendance));
      setTodayAttendance(newAttendance);

      showSuccess('Checked in successfully');
      refreshInBackground().catch(console.error);
    } catch (error) {
      console.error('[EmployeeDashboard] Check-in error:', error);
      showError(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading || isRefreshing) return;

    try {
      if (!todayAttendance?.check_in) {
        showError('You need to check in first');
        return;
      }

      setLoading(true);
      const res = await checkOut();
      console.debug('[EmployeeDashboard] Check-out response:', res.data);

      const checkOutTime = res?.data?.check_out || res?.data?.record?.check_out || res?.data?.attendance?.check_out || new Date().toISOString();

      const newAttendance = {
        ...todayAttendance,
        date: getTodayDateIST(),
        check_out: checkOutTime
      };

      console.debug('[EmployeeDashboard] Setting attendance to:', newAttendance);
      // Save to localStorage and state
      localStorage.setItem('todayAttendance', JSON.stringify(newAttendance));
      setTodayAttendance(newAttendance);

      showSuccess('Checked out successfully');
      refreshInBackground().catch(console.error);
    } catch (error) {
      console.error('[EmployeeDashboard] Check-out error:', error);
      showError(error.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.employee?.first_name}!</p>
      </div>

      {/* Check In/Out Section */}
      <Card title="Attendance Today">
        <div className="flex items-center justify-between">
          <div>
            {todayAttendance?.check_in ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">Checked In: {formatTime(todayAttendance.check_in)}</span>
                </div>
                {todayAttendance?.check_out && (
                  <div className="flex items-center text-blue-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">Checked Out: {formatTime(todayAttendance.check_out)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">You haven't checked in today</p>
            )}
          </div>

          <div className="space-x-2">
            {!todayAttendance?.check_in ? (
              <Button onClick={handleCheckIn} loading={loading}>Check In</Button>
            ) : !todayAttendance?.check_out ? (
              <Button onClick={handleCheckOut} loading={loading} variant="danger">Check Out</Button>
            ) : (
              <Badge status="Done" text="Completed for Today" />
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendance?.presentDays || 0} Days</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Leave Taken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendance?.leaveDays || 0} Days</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Last Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.payslips[0] ? formatCurrency(stats.payslips[0].net_wage) : '-'}
              </p>
              <p className="text-xs text-gray-500">Net Pay</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Recent Time Off">
          {stats.timeOff.length > 0 ? (
            <div className="space-y-3">
              {stats.timeOff.map((timeOff) => (
                <div key={timeOff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{timeOff.time_off_type}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(timeOff.start_date)} - {formatDate(timeOff.end_date)}
                    </p>
                  </div>
                  <Badge status={timeOff.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No time off requests</p>
          )}
        </Card>

        <Card title="Recent Payslips">
          {stats.payslips.length > 0 ? (
            <div className="space-y-3">
              {stats.payslips.map((payslip) => (
                <div key={payslip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payslip.payroll.month}/{payslip.payroll.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      Net: {formatCurrency(payslip.net_wage)}
                    </p>
                  </div>
                  <Badge status={payslip.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No payslips available</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;