const pool = require('../config/db');

class ApprovalModel {
  static async create({ expenseId, approverId, step, order }) {
    const [result] = await pool.query(
      `INSERT INTO approvals (expense_id, approver_id, step, step_order, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [expenseId, approverId, step, order]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, u.name AS approver_name, u.email AS approver_email
       FROM approvals a
       JOIN users u ON a.approver_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async getTimelineByExpense(expenseId) {
    const [rows] = await pool.query(
      `SELECT a.*, u.name AS approver_name, u.avatar AS approver_avatar
       FROM approvals a
       JOIN users u ON a.approver_id = u.id
       WHERE a.expense_id = ?
       ORDER BY a.step_order ASC`,
      [expenseId]
    );
    return rows;
  }

  static async getPendingByApprover(approverId) {
    const [rows] = await pool.query(
      `SELECT a.*, e.title, e.amount, e.currency, e.category, e.created_at AS submitted_at,
              u.name AS submitter_name
       FROM approvals a
       JOIN expenses e ON a.expense_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE a.approver_id = ? AND a.status = 'pending'
       ORDER BY a.created_at ASC`,
      [approverId]
    );
    return rows;
  }

  static async updateStatus(id, status, comment = null) {
    await pool.query(
      `UPDATE approvals SET status = ?, comment = ?, acted_at = NOW() WHERE id = ?`,
      [status, comment, id]
    );
    return this.findById(id);
  }

  static async getNextPendingStep(expenseId, afterOrder) {
    const [rows] = await pool.query(
      `SELECT * FROM approvals
       WHERE expense_id = ? AND step_order > ? AND status = 'pending'
       ORDER BY step_order ASC LIMIT 1`,
      [expenseId, afterOrder]
    );
    return rows[0] || null;
  }

  static async hasPendingSteps(expenseId) {
    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM approvals WHERE expense_id = ? AND status = 'pending'`,
      [expenseId]
    );
    return count > 0;
  }
}

module.exports = ApprovalModel;