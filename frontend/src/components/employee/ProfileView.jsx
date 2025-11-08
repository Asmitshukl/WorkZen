import React from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit } from 'lucide-react';
import { formatDate, formatCurrency } from '@utils/formatters';

const ProfileView = ({ profile, onEdit }) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-lg text-gray-600 mt-1">{profile.designation || 'Employee'}</p>
            <p className="text-sm text-gray-500 mt-1">{profile.department || 'N/A'}</p>
          </div>
        </div>
        <Button icon={Edit} onClick={onEdit}>
          Edit Profile
        </Button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contact Information">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Work Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            {profile.personal_email && (
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Personal Email</p>
                  <p className="font-medium">{profile.personal_email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              </div>
            </div>
            {profile.residing_address && (
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{profile.residing_address}</p>
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
                <p className="font-medium">{profile.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-medium">{profile.designation || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Joining Date</p>
                <p className="font-medium">{formatDate(profile.joining_date)}</p>
              </div>
            </div>
            {profile.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* About Me */}
      {profile.about && (
        <Card title="About Me">
          <p className="text-gray-700 leading-relaxed">{profile.about}</p>
        </Card>
      )}

      {/* Interests & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.interests && (
          <Card title="Interests">
            <p className="text-gray-700">{profile.interests}</p>
          </Card>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
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

      {/* Salary Information */}
      {profile.salary_info && (
        <Card title="Compensation & Benefits">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Monthly Salary</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(profile.salary_info.wage)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Paid Time Off</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {profile.salary_info.paid_time_off} <span className="text-sm">days</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Sick Leave</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {profile.salary_info.sick_time_off} <span className="text-sm">days</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Work Week</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">
                {profile.salary_info.days_per_week} <span className="text-sm">days</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Personal Information */}
      {(profile.date_of_birth || profile.gender || profile.marital_status) && (
        <Card title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.date_of_birth && (
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
              </div>
            )}
            {profile.gender && (
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{profile.gender}</p>
              </div>
            )}
            {profile.marital_status && (
              <div>
                <p className="text-sm text-gray-600">Marital Status</p>
                <p className="font-medium">{profile.marital_status}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileView;