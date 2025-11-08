import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@components/common/Badge';
import { Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { formatDate } from '@utils/formatters';

const EmployeeCard = ({ employee }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/employees/${employee.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
            {employee.first_name?.[0]}{employee.last_name?.[0]}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-gray-600">{employee.designation || 'Employee'}</p>
          </div>
        </div>
        <Badge status={employee.is_active ? 'Active' : 'Inactive'} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {employee.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {employee.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          {employee.department || 'N/A'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Joined: {formatDate(employee.joining_date)}
        </div>
      </div>
    </div>
  );
};
export default EmployeeCard;
