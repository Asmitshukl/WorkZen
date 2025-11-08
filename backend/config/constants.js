module.exports = {
  ROLES: {
    ADMIN: 'Admin',
    HR_OFFICER: 'HR Officer',
    PAYROLL_OFFICER: 'Payroll Officer',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employee'
  },
  
  ATTENDANCE_STATUS: {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    ON_LEAVE: 'On Leave'
  },
  
  TIMEOFF_TYPES: {
    PAID: 'Paid Time Off',
    SICK: 'Sick Time Off',
    UNPAID: 'Unpaid Leave'
  },
  
  TIMEOFF_STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  },
  
  PAYSLIP_STATUS: {
    DRAFT: 'Draft',
    COMPUTED: 'Computed',
    VALIDATED: 'Validated',
    DONE: 'Done',
    CANCELLED: 'Cancelled'
  },
  
  EMPLOYEE_STATUS: {
    PRESENT: { status: 'present', icon: 'green_dot', color: '#10B981' },
    ABSENT: { status: 'absent', icon: 'yellow_dot', color: '#F59E0B' },
    ON_LEAVE: { status: 'on_leave', icon: 'airplane', color: '#3B82F6' }
  }
};