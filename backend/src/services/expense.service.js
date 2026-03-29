const ExpenseModel = require('../models/expense.model');
const ApprovalService = require('./approval.service');
const { pool } = require('../config/db');

class ExpenseService {
  static async submit({ userId, companyId, title, amount, currency, category, notes, receiptUrl }) {
    const expense = await ExpenseModel.create({
      userId, companyId, title, amount, currency, category, notes, receiptUrl,
    });
    await ApprovalService.initiate(expense);
    return expense;
  }

  static async list(requestingUser, filters = {}) {
    const { role, id: userId, company_id: companyId } = requestingUser;
    const { page = 1, limit = 10, status } = filters;
    if (role === 'employee') {
      return ExpenseModel.listByUser(userId, { page, limit, status });
    }
    return ExpenseModel.listByCompany(companyId, {
      page, limit, status,
      userId: role === 'manager' ? filters.userId : undefined,
    });
  }

  static async getDetail(id, requestingUser) {
    const expense = await ExpenseModel.findById(id);
    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      throw err;
    }
    if (requestingUser.role === 'employee' && expense.user_id !== requestingUser.id) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
    const timeline = await ApprovalService.getTimeline(id);
    return { ...expense, timeline };
  }

  static async update(id, fields, requestingUser) {
    const expense = await ExpenseModel.findById(id);
    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      throw err;
    }
    if (expense.user_id !== requestingUser.id) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
    if (!['draft', 'rejected'].includes(expense.status)) {
      const err = new Error('Only draft or rejected expenses can be edited');
      err.statusCode = 400;
      throw err;
    }
    return ExpenseModel.update(id, fields);
  }

  static async getStats(companyId, userId, role) {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status='approved' THEN amount ELSE 0 END) as total_approved_amount
       FROM expenses WHERE company_id = ?`,
      [companyId]
    );
    return rows[0];
  }
}

module.exports = ExpenseService;