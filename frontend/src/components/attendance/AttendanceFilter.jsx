// src/components/attendance/AttendanceFilter.jsx
import React from 'react';
import Select from '@components/common/Select';

const AttendanceFilter = ({ month, year, onMonthChange, onYearChange }) => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  return (
    <div className="flex gap-4">
      <Select
        value={month}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
        options={months}
      />
      <Select
        value={year}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        options={years}
      />
    </div>
  );
};

export default AttendanceFilter;