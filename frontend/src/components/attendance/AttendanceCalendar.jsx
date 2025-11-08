// src/components/attendance/AttendanceCalendar.jsx
import React from 'react';
import { getStatusColor } from '@utils/helpers';

const AttendanceCalendar = ({ attendance, month, year }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getAttendanceForDate = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance?.find(a => a.date === dateStr);
  };

  const renderDay = (day) => {
    if (!day) return <div className="p-2 h-20"></div>;
    
    const record = getAttendanceForDate(day);
    const isWeekend = new Date(year, month - 1, day).getDay() % 6 === 0;
    
    return (
      <div
        className={`p-2 h-20 border border-gray-200 ${
          isWeekend ? 'bg-gray-50' : 'bg-white'
        } ${record ? getStatusColor(record.status).replace('text-', 'border-l-4 border-l-') : ''}`}
      >
        <div className="text-sm font-medium text-gray-700">{day}</div>
        {record && (
          <div className="mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(record.status)}`}>
              {record.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-7 gap-0">
        {days.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-700 bg-gray-100 border-b">
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => (
          <div key={idx}>
            {renderDay(day)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceCalendar;