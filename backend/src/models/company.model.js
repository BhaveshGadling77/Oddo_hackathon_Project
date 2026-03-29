const { pool } = require('../config/db');

class CompanyModel {
  static async create({ name, currency = 'USD' }) {
    const [result] = await pool.query(
      `INSERT INTO companies (name, default_currency) VALUES (?, ?)`,
      [name, currency]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM companies WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const [rows] = await pool.query(`SELECT * FROM companies WHERE name = ?`, [name]);
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['name', 'default_currency'];
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!entries.length) return this.findById(id);

    const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE companies SET ${setClause} WHERE id = ?`,
      [...entries.map(([, v]) => v), id]
    );
    return this.findById(id);
  }
}

module.exports = CompanyModel;