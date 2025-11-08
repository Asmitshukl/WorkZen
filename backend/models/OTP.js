const { query } = require('../config/database');

class OTP {
  static async create(email, otp, purpose) {
    await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, purpose]);
    
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);
    
    const sql = `
      INSERT INTO otps (email, otp, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await query(sql, [email, otp, purpose, expiresAt]);
    return result.rows[0];
  }
  
  static async verify(email, otp, purpose) {
    const sql = `
      SELECT * FROM otps
      WHERE email = $1 
      AND otp = $2 
      AND purpose = $3
      AND verified = FALSE
      AND expires_at > NOW()
    `;
    
    const result = await query(sql, [email, otp, purpose]);
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid or expired OTP' };
    }
    
    await query('UPDATE otps SET verified = TRUE WHERE id = $1', [result.rows[0].id]);
    
    return { success: true, message: 'OTP verified successfully' };
  }
  
  static async deleteExpired() {
    const sql = `DELETE FROM otps WHERE expires_at < NOW()`;
    await query(sql);
  }
}

module.exports = OTP;