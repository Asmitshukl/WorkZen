import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import { Mail, Phone, MapPin, Calendar, Briefcase, User, Edit } from 'lucide-react';
import { formatDate, formatCurrency } from '@utils/formatters';

const EmployeeDetails = ({ employee, onEdit }) => {
  const navigate = useNavigate();

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl">
            {employee.first_name?.[0]}{employee.last_name?.[0]}
          </div>
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-lg text-gray-600">{employee.designation || 'Employee'}</p>
            <div className="mt-2">
              <Badge status={employee.is_active ? 'Active' : 'Inactive'} />
            </div>
          </div>
        </div>
        <Button icon={Edit} onClick={onEdit}>
          Edit Employee
        </Button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contact Information">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{employee.phone}</p>
              </div>
            </div>
            {employee.personal_email && (
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Personal Email</p>
                  <p className="font-medium">{employee.personal_email}</p>
                </div>
              </div>
            )}
            {employee.residing_address && (
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{employee.residing_address}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Employment Details">
          <div className="space-y-4">
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{employee.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-medium">{employee.designation || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Joining Date</p>
                <p className="font-medium">{formatDate(employee.joining_date)}</p>
              </div>
            </div>
            {employee.manager && (
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">
                    {employee.manager.first_name} {employee.manager.last_name}
                  </p>
                </div>
              </div>
            )}
            {employee.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{employee.location}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Personal Information */}
      <Card title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {employee.date_of_birth && (
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
            </div>
          )}
          {employee.gender && (
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{employee.gender}</p>
            </div>
          )}
          {employee.marital_status && (
            <div>
              <p className="text-sm text-gray-600">Marital Status</p>
              <p className="font-medium">{employee.marital_status}</p>
            </div>
          )}
          {employee.nationality && (
            <div>
              <p className="text-sm text-gray-600">Nationality</p>
              <p className="font-medium">{employee.nationality}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Salary Information */}
      {employee.salary_info && (
        <Card title="Salary Information">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Monthly Wage</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(employee.salary_info.wage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Wage Type</p>
              <p className="font-medium">{employee.salary_info.wage_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Time Off</p>
              <p className="font-medium">{employee.salary_info.paid_time_off} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sick Time Off</p>
              <p className="font-medium">{employee.salary_info.sick_time_off} days</p>
            </div>
          </div>
        </Card>
      )}

      {/* Bank Details */}
      {employee.bank_details && employee.bank_details.account_number && (
        <Card title="Bank Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">{employee.bank_details.bank_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium">{employee.bank_details.account_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IFSC Code</p>
              <p className="font-medium">{employee.bank_details.ifsc_code || 'N/A'}</p>
            </div>
            {employee.bank_details.pan_no && (
              <div>
                <p className="text-sm text-gray-600">PAN Number</p>
                <p className="font-medium">{employee.bank_details.pan_no}</p>
              </div>
            )}
            {employee.bank_details.uan_no && (
              <div>
                <p className="text-sm text-gray-600">UAN Number</p>
                <p className="font-medium">{employee.bank_details.uan_no}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* About */}
      {employee.about && (
        <Card title="About">
          <p className="text-gray-700">{employee.about}</p>
        </Card>
      )}

      {/* Skills */}
      {employee.skills && employee.skills.length > 0 && (
        <Card title="Skills">
          <div className="flex flex-wrap gap-2">
            {employee.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDetails;