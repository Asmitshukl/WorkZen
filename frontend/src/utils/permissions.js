// src/utils/permissions.js (Update getNavigationItems)
export const getNavigationItems = (role) => {
  const allItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: 'people',
      roles: ['Admin', 'HR Officer']
    },
    {
      name: 'Attendance',
      icon: 'calendar',
      roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee'],
      children: [
        {
          name: 'My Attendance',
          path: '/attendance/my',
          roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
        },
        {
          name: 'Manage Attendance',
          path: '/attendance/manage',
          roles: ['Admin', 'HR Officer']
        }
      ]
    },
    {
      name: 'Time Off',
      icon: 'flight',
      roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee'],
      children: [
        {
          name: 'My Requests',
          path: '/timeoff/my',
          roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
        },
        {
          name: 'Request Time Off',
          path: '/timeoff',
          roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
        },
        {
          name: 'Approve Requests',
          path: '/timeoff/approve',
          roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager']
        }
      ]
    },
    {
      name: 'Payroll',
      icon: 'money',
      roles: ['Admin', 'Payroll Officer', 'HR Officer', 'Manager', 'Employee'],
      children: [
        {
          name: 'My Payslips',
          path: '/payroll/my-payslips',
          roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
        },
        {
          name: 'Manage Payroll',
          path: '/payroll',
          roles: ['Admin', 'Payroll Officer']
        }
      ]
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'chart',
      roles: ['Admin', 'HR Officer', 'Payroll Officer']
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: 'person',
      roles: ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee']
    }
  ];

  // Filter items based on role
  const filterItems = (items) => {
    return items
      .filter(item => !item.roles || item.roles.includes(role))
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: filterItems(item.children)
          };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0);
  };

  return filterItems(allItems);
};