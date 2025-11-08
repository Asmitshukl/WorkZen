// src/pages/employee/EditEmployeePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, updateEmployee } from '@api/employeeAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import EmployeeForm from '@components/employee/EmployeeForm';

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await getEmployeeById(id);
      const employee = response.data;
      setFormData({
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joining_date?.split('T')[0],
        wage: employee.salary_info?.wage,
        dateOfBirth: employee.date_of_birth?.split('T')[0],
        gender: employee.gender,
        maritalStatus: employee.marital_status,
        location: employee.location
      });
    } catch (error) {
      showError('Failed to load employee');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateEmployee(id, formData);
      showSuccess('Employee updated successfully');
      navigate(`/employees/${id}`);
    } catch (error) {
      showError(error.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Edit Employee" subtitle="Update employee information">
        <EmployeeForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          loading={loading}
          submitLabel="Update Employee"
        />
      </Card>
    </div>
  );
};

export default EditEmployeePage;