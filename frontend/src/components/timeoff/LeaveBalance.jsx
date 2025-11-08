import React from 'react';
import Card from '@components/common/Card';
import { Calendar, Plane, Heart } from 'lucide-react';

const LeaveBalance = ({ balances }) => {
  if (!balances) return null;

  const leaveTypes = [
    {
      type: 'Paid Time Off',
      balance: balances.paid_time_off || 0,
      icon: Calendar,
      color: 'blue',
      description: 'Vacation and personal days'
    },
    {
      type: 'Sick Time Off',
      balance: balances.sick_time_off || 0,
      icon: Heart,
      color: 'red',
      description: 'Medical and health-related leave'
    },
    {
      type: 'Unpaid Leave',
      balance: 'Unlimited',
      icon: Plane,
      color: 'gray',
      description: 'Unpaid time off (subject to approval)'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-50 to-blue-100',
        text: 'text-blue-700',
        icon: 'text-blue-500',
        badge: 'bg-blue-600'
      },
      red: {
        bg: 'from-red-50 to-red-100',
        text: 'text-red-700',
        icon: 'text-red-500',
        badge: 'bg-red-600'
      },
      gray: {
        bg: 'from-gray-50 to-gray-100',
        text: 'text-gray-700',
        icon: 'text-gray-500',
        badge: 'bg-gray-600'
      }
    };
    return colors[color] || colors.gray;
  };

  return (
    <Card title="Leave Balance">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveTypes.map((leave, index) => {
          const colors = getColorClasses(leave.color);
          const Icon = leave.icon;

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colors.bg} rounded-lg p-6 transition-transform hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-8 h-8 ${colors.icon}`} />
                {typeof leave.balance === 'number' && (
                  <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                    {leave.balance} days
                  </span>
                )}
              </div>
              
              <h3 className={`font-semibold ${colors.text} text-lg mb-2`}>
                {leave.type}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {leave.description}
              </p>

              {typeof leave.balance === 'number' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Available</span>
                    <span>{leave.balance} days</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className={`${colors.badge} h-2 rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${Math.min((leave.balance / 30) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {leave.balance === 'Unlimited' && (
                <div className="mt-4 text-center">
                  <span className="text-sm font-medium text-gray-600">
                    No limit - Subject to approval
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leave Policy Info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Leave Policy</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Paid Time Off (PTO) can be used for vacation, personal matters, or emergencies</li>
          <li>• Sick Leave is specifically for health-related absences</li>
          <li>• Unpaid Leave requires manager approval and affects salary calculation</li>
          <li>• Unused PTO may be carried forward as per company policy</li>
        </ul>
      </div>
    </Card>
  );
};

export default LeaveBalance;