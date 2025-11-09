import React from 'react';
import TimeOffCard from './TimeOffCard';

const TimeOffList = ({ timeOffs, loading, showEmployee = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!timeOffs || timeOffs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No time off requests found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {timeOffs.map((timeOff) => (
        <TimeOffCard key={timeOff.id} timeOff={timeOff} showEmployee={showEmployee} />
      ))}
    </div>
  );
};

export default TimeOffList;