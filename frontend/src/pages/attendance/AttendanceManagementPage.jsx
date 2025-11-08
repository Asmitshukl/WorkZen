// src/pages/attendance/AttendanceManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllAttendance } from '@api/attendanceAPI';
import { useNotification } from '@hooks/useNotification';
import AttendanceTable from '@components/attendance/AttendanceTable';
import Card from '@components/common/Card';
import DatePicker from '@components/common/DatePicker';

const AttendanceManagementPage = () => {
  const { showError } = useNotification();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await getAllAttendance({ date: selectedDate });
      setAttendance(response.data || []);
    } catch (error) {
      showError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Attendance</h1>
        <DatePicker
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <Card>
        <AttendanceTable data={attendance} loading={loading} showEmployee={true} />
      </Card>
    </div>
  );
};

export default AttendanceManagementPage;