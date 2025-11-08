const { query, transaction } = require('../config/database');

class Employee {
  static async create(employeeData) {
    const sql = `
      INSERT INTO employees (
        first_name, last_name, email, phone, company, department, 
        designation, manager_id, location, joining_date, date_of_birth,
        gender, marital_status, residing_address, nationality
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    
    const result = await query(sql, [
      employeeData.firstName,
      employeeData.lastName,
      employeeData.email,
      employeeData.phone,
      employeeData.company || 'Odoo India',
      employeeData.department || null,
      employeeData.designation || null,
      employeeData.managerId || null,
      employeeData.location || null,
      employeeData.joiningDate,
      employeeData.dateOfBirth || null,
      employeeData.gender || null,
      employeeData.maritalStatus || null,
      employeeData.residingAddress || null,
      employeeData.nationality || null
    ]);
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const sql = `
      SELECT e.*,
             json_build_object(
               'id', m.id,
               'first_name', m.first_name,
               'last_name', m.last_name,
               'email', m.email
             ) as manager,
             json_build_object(
               'wage', si.wage,
               'wage_type', si.wage_type,
               'days_per_week', si.days_per_week,
               'break_time', si.break_time,
               'paid_time_off', si.paid_time_off,
               'sick_time_off', si.sick_time_off
             ) as salary_info,
             json_build_object(
               'account_number', bd.account_number,
               'bank_name', bd.bank_name,
               'ifsc_code', bd.ifsc_code,
               'pan_no', bd.pan_no,
               'uan_no', bd.uan_no,
               'emp_code', bd.emp_code
             ) as bank_details
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN salary_info si ON e.id = si.employee_id
      LEFT JOIN bank_details bd ON e.id = bd.employee_id
      WHERE e.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length > 0) {
      const employee = result.rows[0];
      
      // Get salary components
      if (employee.salary_info && employee.salary_info.wage) {
        const componentsSql = `
          SELECT * FROM salary_components
          WHERE salary_info_id = (SELECT id FROM salary_info WHERE employee_id = $1)
          ORDER BY component_type, name
        `;
        const componentsResult = await query(componentsSql, [id]);
        employee.salary_components = componentsResult.rows;
      }
      
      const certSql = `SELECT * FROM certifications WHERE employee_id = $1 ORDER BY issued_date DESC`;
      const certResult = await query(certSql, [id]);
      employee.certifications = certResult.rows;
      
      return employee;
    }
    
    return null;
  }
  
  static async findByEmail(email) {
    const sql = `SELECT * FROM employees WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0];
  }
  
  static async findAll(filters = {}) {
    let sql = `
      SELECT e.*,
             json_build_object(
               'id', m.id,
               'first_name', m.first_name,
               'last_name', m.last_name
             ) as manager
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (filters.search) {
      sql += ` AND (e.first_name ILIKE $${paramCount} OR e.last_name ILIKE $${paramCount} OR e.email ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    
    if (filters.department) {
      sql += ` AND e.department = $${paramCount}`;
      values.push(filters.department);
      paramCount++;
    }
    
    if (filters.isActive !== undefined) {
      sql += ` AND e.is_active = $${paramCount}`;
      values.push(filters.isActive);
      paramCount++;
    } else {
      sql += ' AND e.is_active = TRUE';
    }
    
    sql += ' ORDER BY e.first_name, e.last_name';
    
    const result = await query(sql, values);
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
      UPDATE employees 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  static async updateBankDetails(employeeId, bankData) {
    const checkSql = `SELECT id FROM bank_details WHERE employee_id = $1`;
    const checkResult = await query(checkSql, [employeeId]);
    
    if (checkResult.rows.length > 0) {
      const sql = `
        UPDATE bank_details
        SET account_number = $1, bank_name = $2, ifsc_code = $3, 
            pan_no = $4, uan_no = $5, emp_code = $6
        WHERE employee_id = $7
        RETURNING *
      `;
      
      const result = await query(sql, [
        bankData.accountNumber || null,
        bankData.bankName || null,
        bankData.ifscCode || null,
        bankData.panNo || null,
        bankData.uanNo || null,
        bankData.empCode || null,
        employeeId
      ]);
      
      return result.rows[0];
    } else {
      const sql = `
        INSERT INTO bank_details (
          employee_id, account_number, bank_name, ifsc_code, pan_no, uan_no, emp_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await query(sql, [
        employeeId,
        bankData.accountNumber || null,
        bankData.bankName || null,
        bankData.ifscCode || null,
        bankData.panNo || null,
        bankData.uanNo || null,
        bankData.empCode || null
      ]);
      
      return result.rows[0];
    }
  }
  
  static async calculateSalaryComponents(employeeId, wage) {
    return await transaction(async (client) => {
      const checkSql = `SELECT id FROM salary_info WHERE employee_id = $1`;
      const checkResult = await client.query(checkSql, [employeeId]);
      
      let salaryInfoId;
      
      if (checkResult.rows.length > 0) {
        salaryInfoId = checkResult.rows[0].id;
        await client.query(
          `UPDATE salary_info SET wage = $1 WHERE id = $2`,
          [wage, salaryInfoId]
        );
      } else {
        const insertResult = await client.query(
          `INSERT INTO salary_info (employee_id, wage) VALUES ($1, $2) RETURNING id`,
          [employeeId, wage]
        );
        salaryInfoId = insertResult.rows[0].id;
      }
      
      await client.query(
        `DELETE FROM salary_components WHERE salary_info_id = $1`,
        [salaryInfoId]
      );
      
      const components = [
        // Earnings
        { name: 'Basic Salary', percentage: 50.00, amount: wage * 0.50, type: 'earning', description: 'Define basic salary from company cost, compute it based on monthly wages.' },
        { name: 'House Rent Allowance', percentage: 50.00, amount: wage * 0.50 * 0.50, type: 'earning', description: 'HRA provided to employees = 50% of basic salary.' },
        { name: 'Standard Allowance', percentage: 16.67, amount: wage * 0.1667, type: 'earning', description: 'A predetermined fixed amount provided to employees as part of their salary.' },
        { name: 'Performance Bonus', percentage: 8.33, amount: wage * 0.0833, type: 'earning', description: 'Variable amount paid during payroll, defined by the company and calculated as a % of basic salary.' },
        { name: 'Leave Travel Allowance', percentage: 8.33, amount: wage * 0.0833, type: 'earning', description: 'Paid by the company to employees to cover travel expenses, calculated as % of basic salary.' },
        { name: 'Fixed Allowance', percentage: 11.67, amount: wage * 0.1167, type: 'earning', description: 'Fixed portion of wages determined after calculating all salary components.' },
        
        { name: 'PF Employee', percentage: 12.00, amount: wage * 0.50 * 0.12, type: 'deduction', description: 'PF calculated based on basic salary.' },
        { name: 'PF Employer', percentage: 12.00, amount: wage * 0.50 * 0.12, type: 'deduction', description: 'PF calculated based on basic salary.' },
        { name: 'Professional Tax', percentage: 0, amount: 200, type: 'deduction', description: 'Deducted from gross salary.' }
      ];
      
      for (const comp of components) {
        await client.query(
          `INSERT INTO salary_components (salary_info_id, name, percentage, amount, description, component_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [salaryInfoId, comp.name, comp.percentage, comp.amount, comp.description, comp.type]
        );
      }
      
      return true;
    });
  }
  
  static async getStatus(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    
    const sql = `
      SELECT status FROM attendance
      WHERE employee_id = $1 AND date = $2
    `;
    
    const result = await query(sql, [employeeId, today]);
    
    if (result.rows.length > 0) {
      const status = result.rows[0].status;
      if (status === 'Present') {
        return { status: 'present', icon: 'green_dot', color: '#10B981' };
      } else if (status === 'On Leave') {
        return { status: 'on_leave', icon: 'airplane', color: '#3B82F6' };
      }
    }
    
    return { status: 'absent', icon: 'yellow_dot', color: '#F59E0B' };
  }
  
  static async countWithoutBank() {
    const sql = `
      SELECT COUNT(*) as count
      FROM employees e
      LEFT JOIN bank_details bd ON e.id = bd.employee_id
      WHERE e.is_active = TRUE AND bd.id IS NULL
    `;
    
    const result = await query(sql);
    return parseInt(result.rows[0].count);
  }
  
  static async countWithoutManager() {
    const sql = `
      SELECT COUNT(*) as count
      FROM employees
      WHERE is_active = TRUE AND manager_id IS NULL
    `;
    
    const result = await query(sql);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Employee;
