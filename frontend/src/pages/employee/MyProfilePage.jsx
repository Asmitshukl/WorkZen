import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '@api/employeeAPI';
import { useNotification } from '@hooks/useNotification';
import { useAuth } from '@hooks/useAuth';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { formatDate } from '@utils/formatters';

const MyProfilePage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    residingAddress: '',
    personalEmail: '',
    about: '',
    interests: '',
    skills: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile();
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        residingAddress: response.data.residing_address || '',
        personalEmail: response.data.personal_email || '',
        about: response.data.about || '',
        interests: response.data.interests || '',
        skills: response.data.skills?.join(', ') || ''
      });
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateMyProfile({
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      });
      
      showSuccess('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        {!editMode && (
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Basic Information Card */}
      <Card title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="font-medium">{profile?.designation || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Joining Date</p>
              <p className="font-medium">{formatDate(profile?.joining_date)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Editable Information Card */}
      <Card title="Personal Details">
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Email
              </label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="residingAddress"
                value={formData.residingAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Me
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Reading, Sports, Music..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="JavaScript, React, Node.js..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditMode(false);
                  fetchProfile();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="font-medium">{profile?.phone || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Personal Email</p>
              <p className="font-medium">{profile?.personal_email || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="font-medium">{profile?.residing_address || 'Not provided'}</p>
            </div>

            {profile?.about && (
              <div>
                <p className="text-sm text-gray-600 mb-1">About</p>
                <p className="font-medium text-gray-700">{profile.about}</p>
              </div>
            )}

            {profile?.interests && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Interests</p>
                <p className="font-medium">{profile.interests}</p>
              </div>
            )}

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Salary Information Card (Read Only) */}
      {profile?.salary_info && (
        <Card title="Salary Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Monthly Wage</p>
              <p className="text-xl font-bold text-gray-900">₹{parseFloat(profile.salary_info.wage).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Time Off</p>
              <p className="text-xl font-bold text-gray-900">{profile.salary_info.paid_time_off} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sick Time Off</p>
              <p className="text-xl font-bold text-gray-900">{profile.salary_info.sick_time_off} days</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyProfilePage;