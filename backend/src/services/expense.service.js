const ExpenseModel = require('../models/expense.model');
const ApprovalService = require('./approval.service');

class ExpenseService {
  /**
   * Submit a new expense and trigger the approval workflow.
   */
  static async submit({ userId, companyId, title, amount, currency, category, notes, receiptUrl }) {
    const expense = await ExpenseModel.create({
      userId,
      companyId,
      title,
      amount,
      currency,
      category,
      notes,
      receiptUrl,
    });

    // Kick off approval engine
    await ApprovalService.initiate(expense);

    return expense;
  }

  /**
   * List expenses — scoped by role.
   *  - employee : only their own
   *  - manager  : their team's (filtered by managerId on users table)
   *  - admin    : all company expenses
   */
  static async list(requestingUser, filters = {}) {
    const { role, id: userId, company_id: companyId } = requestingUser;
    const { page = 1, limit = 10, status } = filters;

    if (role === 'employee') {
      return ExpenseModel.listByUser(userId, { page, limit, status });
    }

    // admin + manager see company-wide (manager can optionally filter by user)
    return ExpenseModel.listByCompany(companyId, {
      page,
      limit,
      status,
      userId: role === 'manager' ? filters.userId : undefined,
    });
  }

  /**
   * Return a single expense with its full approval timeline.
   */
  static async getDetail(id, requestingUser) {
    const expense = await ExpenseModel.findById(id);
    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      throw err;
    }

    // Employees can only view their own
    if (requestingUser.role === 'employee' && expense.user_id !== requestingUser.id) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const timeline = await ApprovalService.getTimeline(id);
    return { ...expense, timeline };
  }

  /**
   * Update a draft expense (only allowed when status is 'draft' or 'rejected').
   */
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
}

module.exports = ExpenseService;