const { query } = require('../config/database');
const { eachDayOfInterval, isWeekend } = require('date-fns');

class TimeOff {
  static async create(timeOffData) {
    const { employeeId, timeOffType, startDate, endDate, reason, attachment } = timeOffData;
    
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays = eachDayOfInterval({ start, end });
    const workingDays = allDays.filter(day => !isWeekend(day)).length;
    
    const sql = `
      INSERT INTO time_offs (
        employee_id, time_off_type, start_date, end_date, 
        days, reason, attachment, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
      RETURNING *
    `;
    
    const result = await query(sql, [
      employeeId,
      timeOffType,
      startDate,
      endDate,
      workingDays,
      reason || null,
      attachment || null
    ]);
    
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, 
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department
             ) as employee
      FROM time_offs t
      INNER JOIN employees e ON t.employee_id = e.id
      WHERE t.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async findByEmployee(employeeId) {
    const sql = `
      SELECT * FROM time_offs
      WHERE employee_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await query(sql, [employeeId]);
    return result.rows;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT t.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department
             ) as employee
      FROM time_offs t
      INNER JOIN employees e ON t.employee_id = e.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (filters.status) {
      sql += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }
    
    if (filters.employeeId) {
      sql += ` AND t.employee_id = $${paramCount}`;
      values.push(filters.employeeId);
      paramCount++;
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const result = await query(sql, values);
    return result.rows;
  }

  static async approve(id, approvedBy) {
    const sql = `
      UPDATE time_offs
      SET status = 'Approved',
          approved_by = $1,
          approval_date = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [approvedBy, id]);
    return result.rows[0];
  }

  static async reject(id, approvedBy, reason) {
    const sql = `
      UPDATE time_offs
      SET status = 'Rejected',
          approved_by = $1,
          approval_date = NOW(),
          rejection_reason = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [approvedBy, reason, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const sql = `
      DELETE FROM time_offs
      WHERE id = $1 AND status = 'Pending'
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async checkAvailableBalance(employeeId, timeOffType, requestedDays) {
    // Get employee's salary info for leave balance
    const balanceSql = `
      SELECT paid_time_off, sick_time_off
      FROM salary_info
      WHERE employee_id = $1
    `;
    
    const balanceResult = await query(balanceSql, [employeeId]);
    
    if (balanceResult.rows.length === 0) {
      return { available: false, balance: 0, message: 'No leave allocation found' };
    }
    
    const { paid_time_off, sick_time_off } = balanceResult.rows[0];
    
    // Get used leaves for current year
    const currentYear = new Date().getFullYear();
    const usedSql = `
      SELECT SUM(days) as used_days
      FROM time_offs
      WHERE employee_id = $1
      AND time_off_type = $2
      AND status = 'Approved'
      AND EXTRACT(YEAR FROM start_date) = $3
    `;
    
    const usedResult = await query(usedSql, [employeeId, timeOffType, currentYear]);
    const usedDays = parseInt(usedResult.rows[0]?.used_days || 0);
    
    let totalBalance = 0;
    if (timeOffType === 'Paid Time Off') {
      totalBalance = paid_time_off;
    } else if (timeOffType === 'Sick Time Off') {
      totalBalance = sick_time_off;
    } else {
      // Unpaid leave - always available
      return { available: true, balance: 'Unlimited' };
    }
    
    const availableBalance = totalBalance - usedDays;
    
    return {
      available: availableBalance >= requestedDays,
      balance: availableBalance,
      requested: requestedDays,
      message: availableBalance >= requestedDays 
        ? 'Sufficient balance' 
        : `Insufficient balance. Available: ${availableBalance}, Requested: ${requestedDays}`
    };
  }

  static async deductFromAllocation(employeeId, timeOffType, days) {
    // This is handled by the approval process
    // The balance check is done before approval
    // No actual deduction from salary_info table needed as we calculate dynamically
    return true;
  }
}

module.exports = TimeOff;