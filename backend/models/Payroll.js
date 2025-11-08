const { query } = require('../config/database');

class Payroll {
  static async create(month, year, generatedBy) {
    const sql = `
      INSERT INTO payrolls (month, year, generated_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await query(sql, [month, year, generatedBy]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const sql = `
      SELECT p.*,
             json_build_object(
               'id', u.id,
               'login_id', u.login_id,
               'email', u.email
             ) as generated_by_user
      FROM payrolls p
      LEFT JOIN users u ON p.generated_by = u.id
      WHERE p.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  static async findByMonthYear(month, year) {
    const sql = `SELECT * FROM payrolls WHERE month = $1 AND year = $2`;
    const result = await query(sql, [month, year]);
    return result.rows[0];
  }
  
  static async findAll(limit = 12) {
    const sql = `
      SELECT * FROM payrolls
      ORDER BY year DESC, month DESC
      LIMIT $1
    `;
    
    const result = await query(sql, [limit]);
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
      UPDATE payrolls 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  static async validate(id, validatedBy) {
    const sql = `
      UPDATE payrolls
      SET status = 'Done',
          validated_by = $1,
          validated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [validatedBy, id]);
    return result.rows[0];
  }
}

module.exports = Payroll;
