import React from 'react';
import Input from '@components/common/Input';
import Textarea from '@components/common/Textarea';
import Button from '@components/common/Button';
import { Mail, Phone, MapPin } from 'lucide-react';

const ProfileEdit = ({ formData, onChange, onSubmit, onCancel, loading, errors = {} }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone || ''}
            onChange={onChange}
            error={errors.phone}
            icon={Phone}
            maxLength={10}
          />
          <Input
            label="Personal Email"
            name="personalEmail"
            type="email"
            placeholder="Enter your personal email"
            value={formData.personalEmail || ''}
            onChange={onChange}
            error={errors.personalEmail}
            icon={Mail}
          />
        </div>
        <div className="mt-6">
          <Textarea
            label="Address"
            name="residingAddress"
            placeholder="Enter your residential address"
            value={formData.residingAddress || ''}
            onChange={onChange}
            error={errors.residingAddress}
            rows={3}
          />
        </div>
      </div>

      {/* About Me */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
        <Textarea
          label="Bio"
          name="about"
          placeholder="Tell us about yourself..."
          value={formData.about || ''}
          onChange={onChange}
          error={errors.about}
          rows={5}
          maxLength={500}
          helperText="Maximum 500 characters"
        />
      </div>

      {/* Interests & Hobbies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests & Hobbies</h3>
        <Textarea
          label="Your Interests"
          name="interests"
          placeholder="e.g., Reading, Sports, Music, Travel..."
          value={formData.interests || ''}
          onChange={onChange}
          error={errors.interests}
          rows={3}
        />
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <Input
          label="Your Skills"
          name="skills"
          type="text"
          placeholder="Enter skills separated by commas"
          value={formData.skills || ''}
          onChange={onChange}
          error={errors.skills}
          helperText="Separate skills with commas, e.g., JavaScript, React, Node.js"
        />
      </div>

      {/* Bank Details (Optional) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Account Number"
            name="accountNumber"
            type="text"
            placeholder="Enter account number"
            value={formData.accountNumber || ''}
            onChange={onChange}
            error={errors.accountNumber}
          />
          <Input
            label="Bank Name"
            name="bankName"
            type="text"
            placeholder="Enter bank name"
            value={formData.bankName || ''}
            onChange={onChange}
            error={errors.bankName}
          />
          <Input
            label="IFSC Code"
            name="ifscCode"
            type="text"
            placeholder="Enter IFSC code"
            value={formData.ifscCode || ''}
            onChange={onChange}
            error={errors.ifscCode}
          />
          <Input
            label="PAN Number"
            name="panNo"
            type="text"
            placeholder="Enter PAN number"
            value={formData.panNo || ''}
            onChange={onChange}
            error={errors.panNo}
            maxLength={10}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProfileEdit;