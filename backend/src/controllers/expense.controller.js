const expenseService = require('../services/expense.service');
const R              = require('../utils/response.util');
const { validationResult } = require('express-validator');

async function createExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.badRequest(res, 'Validation failed', errors.array());
    const expense = await expenseService.createExpense(
      req.user.id,
      req.user.company_id,
      req.body,
      req.file || null
    );
    R.created(res, expense, 'Expense submitted');
  } catch (err) { next(err); }
}

async function listExpenses(req, res, next) {
  try {
    const result = await expenseService.listExpenses(
      req.user.id,
      req.user.company_id,
      req.user.role,
      req.query
    );
    R.success(res, result);
  } catch (err) { next(err); }
}

async function getExpense(req, res, next) {
  try {
    const expense = await expenseService.getExpenseById(
      req.params.id, req.user.id, req.user.role
    );
    R.success(res, expense);
  } catch (err) { next(err); }
}

async function updateExpense(req, res, next) {
  try {
    const expense = await expenseService.updateExpense(
      req.params.id, req.user.id, req.user.role, req.body
    );
    R.success(res, expense, 'Expense updated');
  } catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try {
    if (!req.body.body?.trim()) return R.badRequest(res, 'Comment body is required');
    const comment = await expenseService.addComment(req.params.id, req.user.id, req.body.body);
    R.created(res, comment, 'Comment added');
  } catch (err) { next(err); }
}

async function getStats(req, res, next) {
  try {
    const stats = await expenseService.getStats(req.user.company_id, req.user.id, req.user.role);
    R.success(res, stats);
  } catch (err) { next(err); }
}

module.exports = { createExpense, listExpenses, getExpense, updateExpense, addComment, getStats };