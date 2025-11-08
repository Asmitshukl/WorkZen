const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const sql = `
      INSERT INTO users (login_id, email, password, role, employee_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await query(sql, [
      userData.loginId,
      userData.email,
      hashedPassword,
      userData.role,
      userData.employeeId || null
    ]);
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const sql = `
      SELECT u.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'phone', e.phone,
               'department', e.department,
               'designation', e.designation,
               'profile_picture', e.profile_picture
             ) as employee
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const sql = `
      SELECT u.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department,
               'designation', e.designation
             ) as employee
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.email = $1
    `;
    
    const result = await query(sql, [email]);
    return result.rows[0];
  }
  
  static async findByEmailOrLoginId(identifier) {
    const sql = `
      SELECT u.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department,
               'designation', e.designation
             ) as employee
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.email = $1 OR u.login_id = $1
    `;
    
    const result = await query(sql, [identifier]);
    return result.rows[0];
  }
  
  static async findOne(filters) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;
    
    Object.keys(filters).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (key === 'loginId' && filters[key].includes('%')) {
        sql += ` AND ${dbKey} LIKE $${paramCount}`;
      } else {
        sql += ` AND ${dbKey} = $${paramCount}`;
      }
      values.push(filters[key]);
      paramCount++;
    });
    
    sql += ' ORDER BY created_at DESC LIMIT 1';
    
    const result = await query(sql, values);
    return result.rows[0];
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
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  static async updateRole(userId, newRole) {
    const validRoles = ['Admin', 'HR Officer', 'Payroll Officer', 'Manager', 'Employee'];
    
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }
    
    const sql = `
      UPDATE users 
      SET role = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await query(sql, [newRole, userId]);
    return result.rows[0];
  }
  
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const sql = `
      UPDATE users 
      SET password = $1, 
          must_change_password = FALSE,
          password_changed_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [hashedPassword, id]);
    return result.rows[0];
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async findAll(filters = {}) {
    let sql = `
      SELECT u.*,
             json_build_object(
               'id', e.id,
               'first_name', e.first_name,
               'last_name', e.last_name,
               'email', e.email,
               'department', e.department
             ) as employee
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.is_active = TRUE
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (filters.role) {
      sql += ` AND u.role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }
    
    sql += ' ORDER BY u.created_at DESC';
    
    const result = await query(sql, values);
    return result.rows;
  }
}

module.exports = User;