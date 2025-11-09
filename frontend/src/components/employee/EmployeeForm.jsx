import React from 'react';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import DatePicker from '@components/common/DatePicker';
import Button from '@components/common/Button';
import { DEPARTMENTS, DESIGNATIONS, GENDERS, MARITAL_STATUS, ROLES } from '@utils/constants';

const EmployeeForm = ({ formData, onChange, onSubmit, errors, loading, submitLabel = 'Save' }) => {
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));
  const designationOptions = DESIGNATIONS.map(d => ({ value: d, label: d }));
  const genderOptions = GENDERS.map(g => ({ value: g, label: g }));
  const maritalOptions = MARITAL_STATUS.map(m => ({ value: m, label: m }));
  
  // Role options - exclude Admin from selection
  const roleOptions = [
    { value: ROLES.HR_OFFICER, label: 'HR Officer' },
    { value: ROLES.PAYROLL_OFFICER, label: 'Payroll Officer' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.EMPLOYEE, label: 'Employee' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName || ''}
          onChange={onChange}
          error={errors?.firstName}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName || ''}
          onChange={onChange}
          error={errors?.lastName}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={onChange}
          error={errors?.email}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={onChange}
          error={errors?.phone}
          maxLength={10}
          required
        />
        <Select
          label="Department"
          name="department"
          value={formData.department || ''}
          onChange={onChange}
          options={departmentOptions}
        />
        <Select
          label="Designation"
          name="designation"
          value={formData.designation || ''}
          onChange={onChange}
          options={designationOptions}
        />
        <Select
          label="Role"
          name="role"
          value={formData.role || ROLES.EMPLOYEE}
          onChange={onChange}
          options={roleOptions}
          error={errors?.role}
          helperText="Select the employee's role in the system"
          required
        />
        <DatePicker
          label="Joining Date"
          name="joiningDate"
          value={formData.joiningDate || ''}
          onChange={onChange}
          error={errors?.joiningDate}
          required
        />
        <Input
          label="Monthly Wage (₹)"
          name="wage"
          type="number"
          value={formData.wage || ''}
          onChange={onChange}
          error={errors?.wage}
        />
        <DatePicker
          label="Date of Birth"
          name="dateOfBirth"
          value={formData.dateOfBirth || ''}
          onChange={onChange}
          max={new Date().toISOString().split('T')[0]}
        />
        <Select
          label="Gender"
          name="gender"
          value={formData.gender || ''}
          onChange={onChange}
          options={genderOptions}
        />
        <Select
          label="Marital Status"
          name="maritalStatus"
          value={formData.maritalStatus || ''}
          onChange={onChange}
          options={maritalOptions}
        />
        <Input
          label="Location"
          name="location"
          value={formData.location || ''}
          onChange={onChange}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;