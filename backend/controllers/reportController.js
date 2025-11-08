const { query } = require('../config/database');
const Employee = require('../models/Employee');
const Payslip = require('../models/Payslip');

exports.getSalaryStatement = async (req, res) => {
  try {
    const { employeeId, year } = req.query;

    if (!employeeId || !year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and year are required'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const payslips = await Payslip.findByEmployee(employeeId, 12);
    const filteredPayslips = payslips.filter(p => p.payroll && p.payroll.year == year);

    
    const monthlyData = filteredPayslips.map(p => ({
      month: p.payroll.month,
      month_name: getMonthName(p.payroll.month),
      basic: parseFloat(p.basic_wage),
      hra: p.earnings.find(e => e.component === 'House Rent Allowance')?.amount || 0,
      allowances: p.earnings.reduce((sum, e) => {
        if (!['Basic Salary', 'House Rent Allowance'].includes(e.component)) {
          return sum + parseFloat(e.amount);
        }
        return sum;
      }, 0),
      deductions: parseFloat(p.total_deductions),
      net: parseFloat(p.net_wage)
    }));

    const yearlyTotals = monthlyData.reduce((acc, month) => ({
      basic: acc.basic + month.basic,
      hra: acc.hra + month.hra,
      allowances: acc.allowances + month.allowances,
      deductions: acc.deductions + month.deductions,
      net: acc.net + month.net
    }), { basic: 0, hra: 0, allowances: 0, deductions: 0, net: 0 });

    res.json({
      success: true,
      data: {
        employee: {
          name: `${employee.first_name} ${employee.last_name}`,
          designation: employee.designation,
          joiningDate: employee.joining_date,
          department: employee.department
        },
        year,
        monthlyData,
        yearlyTotals,
        monthlyAverage: {
          basic: yearlyTotals.basic / monthlyData.length,
          hra: yearlyTotals.hra / monthlyData.length,
          allowances: yearlyTotals.allowances / monthlyData.length,
          deductions: yearlyTotals.deductions / monthlyData.length,
          net: yearlyTotals.net / monthlyData.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    let sql = `
      SELECT 
        e.id as employee_id,
        e.first_name,
        e.last_name,
        e.department,
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE a.status = 'Present') as present_days,
        COUNT(*) FILTER (WHERE a.status = 'Absent') as absent_days,
        COUNT(*) FILTER (WHERE a.status = 'On Leave') as leave_days,
        COALESCE(SUM(a.work_hours), 0) as total_work_hours,
        COALESCE(AVG(a.work_hours) FILTER (WHERE a.status = 'Present'), 0) as avg_work_hours
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id
      WHERE e.is_active = TRUE
    `;

    const values = [];
    let paramCount = 1;

    if (employeeId) {
      sql += ` AND e.id = $${paramCount}`;
      values.push(employeeId);
      paramCount++;
    }

    if (month && year) {
      sql += ` AND EXTRACT(MONTH FROM a.date) = $${paramCount} AND EXTRACT(YEAR FROM a.date) = $${paramCount + 1}`;
      values.push(month, year);
      paramCount += 2;
    }

    sql += ' GROUP BY e.id, e.first_name, e.last_name, e.department ORDER BY e.first_name, e.last_name';

    const result = await query(sql, values);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEmployerCostReport = async (req, res) => {
  try {
    const { year } = req.query;

    let sql = `
      SELECT month, year, employer_cost, gross, net
      FROM payrolls
      WHERE status = 'Done'
    `;

    const values = [];
    if (year) {
      sql += ' AND year = $1';
      values.push(year);
    }

    sql += ' ORDER BY year DESC, month DESC LIMIT 12';

    const result = await query(sql, values);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        period: `${row.month}/${row.year}`,
        month: row.month,
        year: row.year,
        employerCost: parseFloat(row.employer_cost),
        gross: parseFloat(row.gross),
        net: parseFloat(row.net)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEmployeeCountReport = async (req, res) => {
  try {
    const sql = `
      SELECT 
        EXTRACT(MONTH FROM joining_date) as month,
        EXTRACT(YEAR FROM joining_date) as year,
        COUNT(*) as count
      FROM employees
      WHERE is_active = TRUE
      GROUP BY EXTRACT(YEAR FROM joining_date), EXTRACT(MONTH FROM joining_date)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `;

    const result = await query(sql);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        period: `${row.month}/${row.year}`,
        month: parseInt(row.month),
        year: parseInt(row.year),
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

module.exports = exports;
