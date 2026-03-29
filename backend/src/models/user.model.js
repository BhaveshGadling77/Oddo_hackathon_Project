const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
  // ── Queries ────────────────────────────────────────────────────────────────

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, company_id, manager_id, avatar, created_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  static async listByCompany(companyId) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, manager_id, avatar, created_at
       FROM users WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );
    return rows;
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  static async create({ name, email, password, role = 'employee', companyId, managerId = null }) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, company_id, manager_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hash, role, companyId, managerId]
    );
    return this.findById(result.insertId);
  }

  static async createOAuthUser({ email, name, avatar, googleId }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, google_id, avatar, role) VALUES (?, ?, ?, ?, 'employee')`,
      [name, email, googleId, avatar]
    );
    return this.findById(result.insertId);
  }

  static async update(id, fields) {
    const allowed = ['name', 'role', 'manager_id', 'avatar'];
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!entries.length) return this.findById(id);

    const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  }

  // ── Auth helpers ───────────────────────────────────────────────────────────

  static async verifyPassword(plain, hash) {
    return plain === hash;
  }
}

module.exports = UserModel;