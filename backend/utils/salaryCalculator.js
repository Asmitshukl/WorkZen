const { query } = require('../config/database');
const { eachDayOfInterval, isWeekend } = require('date-fns');

class SalaryCalculator {
  static async calculateWorkedDays(employeeId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const attendanceSql = `
      SELECT COUNT(*) as count
      FROM attendance
      WHERE employee_id = $1
      AND date BETWEEN $2 AND $3
      AND status = 'Present'
    `;
    
    const attResult = await query(attendanceSql, [employeeId, startStr, endStr]);
    const attendanceDays = parseInt(attResult.rows[0].count);
    
    const paidLeaveSql = `
      SELECT start_date, end_date
      FROM time_offs
      WHERE employee_id = $1
      AND status = 'Approved'
      AND time_off_type IN ('Paid Time Off', 'Sick Time Off')
      AND (
        (start_date BETWEEN $2 AND $3) OR
        (end_date BETWEEN $2 AND $3) OR
        (start_date <= $2 AND end_date >= $3)
      )
    `;
    
    const paidResult = await query(paidLeaveSql, [employeeId, startStr, endStr]);
    
    let paidLeaveDays = 0;
    paidResult.rows.forEach(leave => {
      const start = new Date(leave.start_date) > startDate ? new Date(leave.start_date) : startDate;
      const end = new Date(leave.end_date) < endDate ? new Date(leave.end_date) : endDate;
      
      const days = eachDayOfInterval({ start, end });
      paidLeaveDays += days.filter(day => !isWeekend(day)).length;
    });
    
    const unpaidLeaveSql = `
      SELECT start_date, end_date
      FROM time_offs
      WHERE employee_id = $1
      AND status = 'Approved'
      AND time_off_type = 'Unpaid Leave'
      AND (
        (start_date BETWEEN $2 AND $3) OR
        (end_date BETWEEN $2 AND $3) OR
        (start_date <= $2 AND end_date >= $3)
      )
    `;
    
    const unpaidResult = await query(unpaidLeaveSql, [employeeId, startStr, endStr]);
    
    let unpaidLeaveDays = 0;
    unpaidResult.rows.forEach(leave => {
      const start = new Date(leave.start_date) > startDate ? new Date(leave.start_date) : startDate;
      const end = new Date(leave.end_date) < endDate ? new Date(leave.end_date) : endDate;
      
      const days = eachDayOfInterval({ start, end });
      unpaidLeaveDays += days.filter(day => !isWeekend(day)).length;
    });
    
    const totalPayableDays = attendanceDays + paidLeaveDays;
    
    return {
      attendance: attendanceDays,
      paidTimeOff: paidLeaveDays,
      unpaidLeave: unpaidLeaveDays,
      totalDays: totalPayableDays
    };
  }
  
  static calculateProRataSalary(monthlySalary, totalDays, workingDaysInMonth = 22) {
    const dailyRate = monthlySalary / workingDaysInMonth;
    return dailyRate * totalDays;
  }
  
  static async calculateSalaryComponents(employeeId, proRataSalary, fullSalary) {
    const componentsSql = `
      SELECT * FROM salary_components
      WHERE salary_info_id = (SELECT id FROM salary_info WHERE employee_id = $1)
      AND component_type = 'earning'
      ORDER BY name
    `;
    
    const result = await query(componentsSql, [employeeId]);
    
    const earnings = result.rows.map(comp => ({
      component: comp.name,
      percentage: parseFloat(comp.percentage),
      amount: (parseFloat(comp.amount) / fullSalary) * proRataSalary
    }));
    
    return earnings;
  }
  
  static async calculateDeductions(employeeId, proRataSalary, fullSalary) {
    const componentsSql = `
      SELECT * FROM salary_components
      WHERE salary_info_id = (SELECT id FROM salary_info WHERE employee_id = $1)
      AND component_type = 'deduction'
      ORDER BY name
    `;
    
    const result = await query(componentsSql, [employeeId]);
    
    const deductions = result.rows.map(comp => ({
      component: comp.name,
      amount: (parseFloat(comp.amount) / fullSalary) * proRataSalary
    }));
    
    return deductions;
  }
}

module.exports = SalaryCalculator;
