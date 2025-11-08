const { query, transaction } = require('../config/database');

class Payslip {
  static async create(payslipData) {
    return await transaction(async (client) => {
      const sql = `
        INSERT INTO payslips (
          payroll_id, employee_id, pay_period_start, pay_period_end,
          salary_structure, attendance_days, paid_time_off_days, unpaid_leave_days,
          total_payable_days, basic_wage, gross_wage, total_deductions,
          net_wage, employer_cost, generated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      
      const result = await client.query(sql, [
        payslipData.payrollId,
        payslipData.employeeId,
        payslipData.payPeriodStart,
        payslipData.payPeriodEnd,
        payslipData.salaryStructure || 'Regular Pay',
        payslipData.attendanceDays,
        payslipData.paidTimeOffDays,
        payslipData.unpaidLeaveDays || 0,
        payslipData.totalPayableDays,
        payslipData.basicWage,
        payslipData.grossWage,
        payslipData.totalDeductions,
        payslipData.netWage,
        payslipData.employerCost,
        payslipData.generatedBy
      ]);
      
      const payslip = result.rows[0];
      
      if (payslipData.earnings && payslipData.earnings.length > 0) {
        for (const earning of payslipData.earnings) {
          await client.query(
            `INSERT INTO payslip_earnings (payslip_id, component, percentage, amount)
             VALUES ($1, $2, $3, $4)`,
            [payslip.id, earning.component, earning.percentage || 0, earning.amount]
          );
        }
      }
      
      if (payslipData.deductions && payslipData.deductions.length > 0) {
        for (const deduction of payslipData.deductions) {
          await client.query(
            `INSERT INTO payslip_deductions (payslip_id, component, amount)
             VALUES ($1, $2, $3)`,
            [payslip.id, deduction.component, deduction.amount]
          );
        }
      }
      
      return payslip;
    });
  }
  
  static async findById(id) {
    const sql = `
      SELECT p.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department,
               'designation', e.designation
             ) as employee,
             json_build_object(
               'id', pr.id,
               'month', pr.month,
               'year', pr.year,
               'status', pr.status
             ) as payroll
      FROM payslips p
      INNER JOIN employees e ON p.employee_id = e.id
      INNER JOIN payrolls pr ON p.payroll_id = pr.id
      WHERE p.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length > 0) {
      const payslip = result.rows[0];
      
      const earningsSql = `SELECT * FROM payslip_earnings WHERE payslip_id = $1`;
      const earningsResult = await query(earningsSql, [id]);
      payslip.earnings = earningsResult.rows;
      
      const deductionsSql = `SELECT * FROM payslip_deductions WHERE payslip_id = $1`;
      const deductionsResult = await query(deductionsSql, [id]);
      payslip.deductions = deductionsResult.rows;
      
      return payslip;
    }
    
    return null;
  }
  
  static async findByPayroll(payrollId) {
    const sql = `
      SELECT p.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department
             ) as employee
      FROM payslips p
      INNER JOIN employees e ON p.employee_id = e.id
      WHERE p.payroll_id = $1
      ORDER BY e.first_name, e.last_name
    `;
    
    const result = await query(sql, [payrollId]);
    return result.rows;
  }
  
  static async findByEmployee(employeeId, limit = 12) {
    const sql = `
      SELECT p.*,
             json_build_object(
               'month', pr.month,
               'year', pr.year,
               'status', pr.status
             ) as payroll
      FROM payslips p
      INNER JOIN payrolls pr ON p.payroll_id = pr.id
      WHERE p.employee_id = $1
      ORDER BY pr.year DESC, pr.month DESC
      LIMIT $2
    `;
    
    const result = await query(sql, [employeeId, limit]);
    return result.rows;
  }
  
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `
      UPDATE payslips 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  static async delete(id) {
    return await transaction(async (client) => {
      await client.query('DELETE FROM payslip_earnings WHERE payslip_id = $1', [id]);
      await client.query('DELETE FROM payslip_deductions WHERE payslip_id = $1', [id]);
      const result = await client.query('DELETE FROM payslips WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    });
  }
}

module.exports = Payslip;
