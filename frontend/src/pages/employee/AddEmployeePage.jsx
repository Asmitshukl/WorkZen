// src/pages/employees/AddEmployeePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "@api/employeeAPI";
import { useNotification } from "@hooks/useNotification";
import { validateEmployeeForm } from "@utils/validators";
import Card from "@components/common/Card";
import EmployeeForm from "@components/employee/EmployeeForm";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user edits
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateEmployeeForm(formData);
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await createEmployee(formData);
      showSuccess(
        "Employee created successfully. Login credentials sent to email."
      );
      navigate("/employees");
    } catch (error) {
      showError(error?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card
        title="Add New Employee"
        subtitle="Create a new employee account"
        className="shadow-md"
      >
        <EmployeeForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          loading={loading}
          submitLabel="Create Employee"
        />
      </Card>
    </div>
  );
};

export default AddEmployeePage;
