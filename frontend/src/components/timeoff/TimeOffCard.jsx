// src/components/timeoff/TimeOffCard.jsx
import React from 'react';
import Badge from '@components/common/Badge';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@utils/formatters';

const TimeOffCard = ({ timeOff, showEmployee = false }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{timeOff.time_off_type}</h4>
          {showEmployee && timeOff.employee && (
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <User className="w-4 h-4 mr-1" />
              {timeOff.employee.first_name} {timeOff.employee.last_name}
            </div>
          )}
        </div>
        <Badge status={timeOff.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(timeOff.start_date)} - {formatDate(timeOff.end_date)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Duration:</span> {timeOff.days} day(s)
        </div>
        {timeOff.reason && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Reason:</span> {timeOff.reason}
          </div>
        )}
        {timeOff.status === 'Rejected' && timeOff.rejection_reason && (
          <div className="text-sm text-red-600 mt-2">
            <span className="font-medium">Rejection Reason:</span> {timeOff.rejection_reason}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeOffCard;