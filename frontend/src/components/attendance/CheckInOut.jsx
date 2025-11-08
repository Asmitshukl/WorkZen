// src/components/attendance/CheckInOut.jsx
import React, { useState, useEffect } from 'react';
import { checkIn, checkOut, getMyAttendance } from '@api/attendanceAPI';
import { useNotification } from '@hooks/useNotification';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { formatTime } from '@utils/formatters';

const CheckInOut = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date();
      const response = await getMyAttendance({
        month: today.getMonth() + 1,
        year: today.getFullYear()
      });
      
      const todayStr = today.toISOString().split('T')[0];
      const todayRecord = response.data?.records?.find(r => r.date === todayStr);
      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await checkIn();
      showSuccess('Checked in successfully');
      fetchTodayAttendance();
    } catch (error) {
      showError(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await checkOut();
      showSuccess('Checked out successfully');
      fetchTodayAttendance();
    } catch (error) {
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