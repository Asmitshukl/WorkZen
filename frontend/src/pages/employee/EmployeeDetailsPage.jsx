// src/pages/employee/EmployeeDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '@api/employeeAPI';
import { useNotification } from '@hooks/useNotification';
import EmployeeDetails from '@components/employee/EmployeeDetails';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { formatDate } from '@utils/formatters';

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await getEmployeeById(id);
      setEmployee(response.data);
    } catch (error) {
      showError('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (!employee) return <div className="text-center py-12">Employee not found</div>;

  return (
    <EmployeeDetails 
      employee={employee} 
      onEdit={() => navigate(`/employees/${id}/edit`)} 
    />
  );
};

export default EmployeeDetailsPage;