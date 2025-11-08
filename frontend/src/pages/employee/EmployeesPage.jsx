// src/pages/employee/EmployeesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEmployees } from '@api/employeeAPI';
import { useNotification } from '@hooks/useNotification';
import { useDebounce } from '@hooks/useDebounce';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import Badge from '@components/common/Badge';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import { DEPARTMENTS } from '@utils/constants';
import { formatDate } from '@utils/formatters';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (departmentFilter) params.department = departmentFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await getAllEmployees(params);
      setEmployees(response.data || []);
    } catch (error) {
      showError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your organization's employees</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/employees/add')}>
          Add Employee
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
          
          <Select
            placeholder="Filter by Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={departmentOptions}
          />
          
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No employees found</p>
            <Button className="mt-4" onClick={() => navigate('/employees/add')}>
              Add First Employee
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joining Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.designation || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(employee.joining_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={employee.is_active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => navigate(`/employees/${employee.id}/edit`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeesPage;