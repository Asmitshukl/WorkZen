// src/components/attendance/AttendanceStats.jsx
import React from 'react';
import Card from '@components/common/Card';
import { Calendar, CheckCircle, XCircle, Plane } from 'lucide-react';

const AttendanceStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Days',
      value: stats.totalDays || 0,
      icon: Calendar,
      color: 'gray',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600'
    },
    {
      title: 'Present',
      value: stats.presentDays || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'On Leave',
      value: stats.leaveDays || 0,
      icon: Plane,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Absent',
      value: stats.absentDays || 0,
      icon: XCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceStats;