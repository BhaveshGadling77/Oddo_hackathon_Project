const pool = require('../config/db');

class ExpenseModel {
  static async create({ userId, companyId, title, amount, currency, category, notes, receiptUrl }) {
    const [result] = await pool.query(
      `INSERT INTO expenses
         (user_id, company_id, title, amount, currency, category, notes, receipt_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, companyId, title, amount, currency, category, notes || null, receiptUrl || null]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS submitter_name, u.email AS submitter_email
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async listByUser(userId, { page = 1, limit = 10, status } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ['e.user_id = ?'];
    const values = [userId];

    if (status) { conditions.push('e.status = ?'); values.push(status); }

    const where = conditions.join(' AND ');
    const [rows] = await pool.query(
      `SELECT e.* FROM expenses e WHERE ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM expenses e WHERE ${where}`, values
    );
    return { rows, total };
  }

  static async listByCompany(companyId, { page = 1, limit = 10, status, userId } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ['e.company_id = ?'];
    const values = [companyId];

    if (status) { conditions.push('e.status = ?'); values.push(status); }
    if (userId) { conditions.push('e.user_id = ?'); values.push(userId); }

    const where = conditions.join(' AND ');
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS submitter_name
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM expenses e WHERE ${where}`, values
    );
    return { rows, total };
  }

  static async updateStatus(id, status) {
    await pool.query(
      `UPDATE expenses SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );
    return this.findById(id);
  }

  static async update(id, fields) {
    const allowed = ['title', 'amount', 'currency', 'category', 'notes', 'receipt_url'];
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!entries.length) return this.findById(id);

    const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE expenses SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...entries.map(([, v]) => v), id]
    );
    return this.findById(id);
  }
}

module.exports = ExpenseModel;