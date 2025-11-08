const { query } = require('../config/database');

class Attendance {
  static async checkIn(employeeId, date) {
    const checkSql = `SELECT id FROM attendance WHERE employee_id = $1 AND date = $2`;
    const checkResult = await query(checkSql, [employeeId, date]);
    
    if (checkResult.rows.length > 0) {
      // Update existing record
      const sql = `
        UPDATE attendance
        SET check_in = NOW(), status = 'Present'
        WHERE employee_id = $1 AND date = $2
        RETURNING *
      `;
      
      const result = await query(sql, [employeeId, date]);
      return result.rows[0];
    } else {
      // Create new record
      const sql = `
        INSERT INTO attendance (employee_id, date, check_in, status)
        VALUES ($1, $2, NOW(), 'Present')
        RETURNING *
      `;
      
      const result = await query(sql, [employeeId, date]);
      return result.rows[0];
    }
  }
  
  static async checkOut(employeeId, date) {
    const sql = `
      UPDATE attendance
      SET check_out = NOW()
      WHERE employee_id = $1 AND date = $2
      RETURNING *
    `;
    
    const result = await query(sql, [employeeId, date]);
    
    if (result.rows.length > 0) {
      await this.calculateWorkHours(result.rows[0].id);
      
      const updatedSql = `SELECT * FROM attendance WHERE id = $1`;
      const updatedResult = await query(updatedSql, [result.rows[0].id]);
      return updatedResult.rows[0];
    }
    
    return null;
  }
  
  static async calculateWorkHours(attendanceId) {
    const sql = `
      UPDATE attendance
      SET work_hours = EXTRACT(EPOCH FROM (check_out - check_in)) / 3600 - COALESCE(break_time, 1.0),
          extra_hours = GREATEST(0, (EXTRACT(EPOCH FROM (check_out - check_in)) / 3600 - COALESCE(break_time, 1.0)) - 8)
      WHERE id = $1 AND check_in IS NOT NULL AND check_out IS NOT NULL
      RETURNING *
    `;
    
    const result = await query(sql, [attendanceId]);
    return result.rows[0];
  }
  
  static async findByEmployeeAndDate(employeeId, date) {
    const sql = `SELECT * FROM attendance WHERE employee_id = $1 AND date = $2`;
    const result = await query(sql, [employeeId, date]);
    return result.rows[0];
  }
  
  static async findByEmployee(employeeId, month = null, year = null) {
    let sql = `
      SELECT a.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email
             ) as employee
      FROM attendance a
      INNER JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = $1
    `;
    
    const values = [employeeId];
    let paramCount = 2;
    
    if (month && year) {
      sql += ` AND EXTRACT(MONTH FROM a.date) = $${paramCount} AND EXTRACT(YEAR FROM a.date) = $${paramCount + 1}`;
      values.push(month, year);
    }
    
    sql += ' ORDER BY a.date DESC';
    
    const result = await query(sql, values);
    return result.rows;
  }
  
  static async findByDate(date) {
    const sql = `
      SELECT a.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department,
               'designation', e.designation
             ) as employee
      FROM attendance a
      INNER JOIN employees e ON a.employee_id = e.id
      WHERE a.date = $1
      ORDER BY e.first_name, e.last_name
    `;
    
    const result = await query(sql, [date]);
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
      UPDATE attendance 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  static async markLeave(employeeId, date) {
  const checkSql = `SELECT id FROM attendance WHERE employee_id = $1 AND date = $2`;
  const checkResult = await query(checkSql, [employeeId, date]);
  
  if (checkResult.rows.length > 0) {
    // Update existing record
    const sql = `
      UPDATE attendance
      SET status = 'On Leave'
      WHERE employee_id = $1 AND date = $2
      RETURNING *
    `;
    
    const result = await query(sql, [employeeId, date]);
    return result.rows[0];
  } else {
    // Create new record
    const sql = `
      INSERT INTO attendance (employee_id, date, status)
      VALUES ($1, $2, 'On Leave')
      RETURNING *
    `;
    
    const result = await query(sql, [employeeId, date]);
    return result.rows[0];
  }
}

  
  static async markAbsent(employeeId, date) {
    const checkSql = `SELECT id FROM attendance WHERE employee_id = $1 AND date = $2`;
    const checkResult = await query(checkSql, [employeeId, date]);
    
    if (checkResult.rows.length > 0) {
      const sql = `
        UPDATE attendance
        SET status = 'Absent'
        WHERE employee_id = $1 AND date = $2
        RETURNING *
      `;
      
      const result = await query(sql, [employeeId, date]);
      return result.rows[0];
    } else {
      const sql = `
        INSERT INTO attendance (employee_id, date, status)
        VALUES ($1, $2, 'Absent')
        RETURNING *
      `;
      
      const result = await query(sql, [employeeId, date]);
      return result.rows[0];
    }
  }
  
  static async getMonthlyStats(employeeId, month, year) {
    const sql = `
      SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE status = 'Present') as present_days,
        COUNT(*) FILTER (WHERE status = 'Absent') as absent_days,
        COUNT(*) FILTER (WHERE status = 'On Leave') as leave_days,
        COALESCE(SUM(work_hours), 0) as total_work_hours,
        COALESCE(AVG(work_hours) FILTER (WHERE status = 'Present'), 0) as avg_work_hours
      FROM attendance
      WHERE employee_id = $1
      AND EXTRACT(MONTH FROM date) = $2
      AND EXTRACT(YEAR FROM date) = $3
    `;
    
    const result = await query(sql, [employeeId, month, year]);
    return result.rows[0];
  }
}

module.exports = Attendance;
