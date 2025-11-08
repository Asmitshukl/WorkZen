const { query } = require('../config/database');
const { eachDayOfInterval, isWeekend } = require('date-fns');

class TimeOff {
  static async create(timeOffData) {
    const start = new Date(timeOffData.startDate);
    const end = new Date(timeOffData.endDate);
    const allDays = eachDayOfInterval({ start, end });
    const workingDays = allDays.filter(day => !isWeekend(day)).length;
    
    const sql = `
      INSERT INTO time_offs (
        employee_id, time_off_type, start_date, end_date, days, reason, attachment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await query(sql, [
      timeOffData.employeeId,
      timeOffData.timeOffType,
      timeOffData.startDate,
      timeOffData.endDate,
      workingDays,
      timeOffData.reason || null,
      timeOffData.attachment || null
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
             ) as employee,
             json_build_object(
               'id', u.id,
               'login_id', u.login_id,
               'email', u.email
             ) as approved_by_user
      FROM time_offs t
      INNER JOIN employees e ON t.employee_id = e.id
      LEFT JOIN users u ON t.approved_by = u.id
      WHERE t.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  static async findByEmployee(employeeId, status = null) {
    let sql = `
      SELECT * FROM time_offs
      WHERE employee_id = $1
    `;
    
    const values = [employeeId];
    
    if (status) {
      sql += ` AND status = $2`;
      values.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, values);
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
    const sql = `DELETE FROM time_offs WHERE id = $1 AND status = 'Pending' RETURNING *`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  static async checkAvailableBalance(employeeId, timeOffType, requestedDays) {
    const sql = `
      SELECT paid_time_off, sick_time_off
      FROM salary_info
      WHERE employee_id = $1
    `;
    
    const result = await query(sql, [employeeId]);
    
    if (result.rows.length === 0) return { available: false, balance: 0 };
    
    const balance = result.rows[0];
    let available = 0;
    
    if (timeOffType === 'Paid Time Off') {
      available = balance.paid_time_off;
    } else if (timeOffType === 'Sick Time Off') {
      available = balance.sick_time_off;
    } else {
      return { available: true, balance: Infinity }; 
    }
    
    return {
      available: available >= requestedDays,
      balance: available
    };
  }
  
  static async deductFromAllocation(employeeId, timeOffType, days) {
    if (timeOffType === 'Unpaid Leave') return;
    
    const field = timeOffType === 'Paid Time Off' ? 'paid_time_off' : 'sick_time_off';
    
    const sql = `
      UPDATE salary_info
      SET ${field} = ${field} - $1
      WHERE employee_id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [days, employeeId]);
    return result.rows[0];
  }
  
  static async restoreAllocation(employeeId, timeOffType, days) {
    if (timeOffType === 'Unpaid Leave') return;
    
    const field = timeOffType === 'Paid Time Off' ? 'paid_time_off' : 'sick_time_off';
    
    const sql = `
      UPDATE salary_info
      SET ${field} = ${field} + $1
      WHERE employee_id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [days, employeeId]);
    return result.rows[0];
  }
}

module.exports = TimeOff;

