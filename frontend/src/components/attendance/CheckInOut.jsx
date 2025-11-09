// src/components/attendance/CheckInOut.jsx
import React, { useState, useEffect } from 'react';
import { checkIn, checkOut, getMyAttendance } from '@api/attendanceAPI';
import { useNotification } from '@hooks/useNotification';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { Clock, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { formatTime } from '@utils/formatters';
import { getISTTime, getTodayDateIST, isWorkingHours, getWorkingHoursMessage } from '@utils/timeZone';

const CheckInOut = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(getISTTime());
  const [outsideWorkingHours, setOutsideWorkingHours] = useState(!isWorkingHours());

  useEffect(() => {
    fetchTodayAttendance();
    const timer = setInterval(() => {
      const istTime = getISTTime();
      setCurrentTime(istTime);
      setOutsideWorkingHours(!isWorkingHours());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const istDate = getISTTime();
      const response = await getMyAttendance({
        month: istDate.getMonth() + 1,
        year: istDate.getFullYear()
      });

      // Support axios response shape: response.data.records
      const payload = response?.data ?? response;
      const todayStr = getTodayDateIST();
      const records = payload?.records ?? [];
      const todayRecord = records.find(r => r.date === todayStr) || null;
      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (loading) return;

    try {
      if (!isWorkingHours()) {
        showError(getWorkingHoursMessage());
        return;
      }

      if (todayAttendance?.check_in) {
        showError('You have already checked in today');
        return;
      }

      setLoading(true);

      // Safety timeout: if API doesn't respond within 15s, treat as failure
      const response = await Promise.race([
        checkIn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 15000))
      ]);

      // Accept axios response or truthy response
      const ok = response && (response.status === 200 || response.status === 201 || response.data);
      if (!ok) {
        throw new Error('Check-in failed');
      }

      showSuccess('Checked in successfully');
      await fetchTodayAttendance();
    } catch (error) {
      console.error('handleCheckIn error:', error);
      showError(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading) return;

    try {
      if (!todayAttendance?.check_in) {
        showError('You need to check in first');
        return;
      }

      if (todayAttendance?.check_out) {
        showError('You have already checked out today');
        return;
      }

      setLoading(true);

      const response = await Promise.race([
        checkOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 15000))
      ]);

      const ok = response && (response.status === 200 || response.status === 201 || response.data);
      if (!ok) {
        throw new Error('Check-out failed');
      }

      showSuccess('Checked out successfully');
      await fetchTodayAttendance();
    } catch (error) {
      console.error('handleCheckOut error:', error);
      showError(error.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="text-center">
        <div className="mb-6">
          <Clock className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h3 className="text-3xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: true 
            })}
          </h3>
          <p className="text-gray-600 mt-2">
            {currentTime.toLocaleDateString('en-IN', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {todayAttendance ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Check In</p>
                <p className="text-xl font-bold text-green-600">
                  {todayAttendance.check_in ? formatTime(todayAttendance.check_in) : '-'}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Check Out</p>
                <p className="text-xl font-bold text-blue-600">
                  {todayAttendance.check_out ? formatTime(todayAttendance.check_out) : '-'}
                </p>
              </div>
            </div>

            {!todayAttendance.check_in ? (
              <Button 
                onClick={handleCheckIn} 
                loading={loading}
                icon={LogIn}
                size="lg"
                fullWidth
              >
                Check In
              </Button>
            ) : !todayAttendance.check_out ? (
              <Button 
                onClick={handleCheckOut} 
                loading={loading}
                variant="danger"
                icon={LogOut}
                size="lg"
                fullWidth
              >
                Check Out
              </Button>
            ) : (
              <Badge status="Done" text="Attendance Marked for Today" className="text-lg py-3" />
            )}
          </div>
        ) : (
          <Button 
            onClick={handleCheckIn} 
            loading={loading}
            icon={LogIn}
            size="lg"
            fullWidth
          >
            Check In
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CheckInOut;