const ExpenseService = require('../services/expense.service');
const R              = require('../utils/response.util');
const { validationResult } = require('express-validator');

async function createExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.badRequest(res, 'Validation failed', errors.array());
    const expense = await ExpenseService.submit({
      userId: req.user.id,
      companyId: req.user.company_id,
      ...req.body,
      receiptUrl: req.file?.path || null
    });
    R.created(res, expense, 'Expense submitted');
  } catch (err) { next(err); }
}

async function listExpenses(req, res, next) {
  try {
    const result = await ExpenseService.list(req.user, req.query);
    R.success(res, result);
  } catch (err) { next(err); }
}

async function getExpense(req, res, next) {
  try {
    const expense = await ExpenseService.getDetail(req.params.id, req.user);
    R.success(res, expense);
  } catch (err) { next(err); }
}

async function updateExpense(req, res, next) {
  try {
    const expense = await ExpenseService.update(req.params.id, req.body, req.user);
    R.success(res, expense, 'Expense updated');
  } catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try {
    if (!req.body.text?.trim()) return R.badRequest(res, 'Comment text is required');
    const comment = await ExpenseService.addComment(req.params.id, req.user.id, req.body.text);
    R.created(res, comment, 'Comment added');
  } catch (err) { next(err); }
}

async function getStats(req, res, next) {
  try {
    const stats = await ExpenseService.getStats(req.user.company_id, req.user.id, req.user.role);
    R.success(res, stats);
  } catch (err) { next(err); }
}

module.exports = { createExpense, listExpenses, getExpense, updateExpense, addComment, getStats };
