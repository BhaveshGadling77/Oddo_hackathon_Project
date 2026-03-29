const approvalService = require('../services/approval.service');
const { pool }        = require('../config/db');
const R               = require('../utils/response.util');

async function getPendingApprovals(req, res, next) {
  try {
    const [requests] = await pool.query(
      `SELECT ar.*, e.amount, e.currency, e.converted_amount, e.category,
              e.description, e.expense_date, e.receipt_url, e.status AS expense_status,
              u.name AS submitter_name, u.email AS submitter_email,
              c.default_currency
       FROM approval_requests ar
       JOIN expenses e   ON e.id  = ar.expense_id
       JOIN users u      ON u.id  = e.user_id
       JOIN companies c  ON c.id  = e.company_id
       WHERE ar.approver_id = ? AND ar.status = 'pending'
       ORDER BY ar.created_at ASC`,
      [req.user.id]
    );
    R.success(res, requests);
  } catch (err) { next(err); }
}

async function approve(req, res, next) {
  try {
    await approvalService.processDecision(
      req.params.id, 'approved', req.body.comment, req.user.id
    );
    R.success(res, null, 'Expense approved');
  } catch (err) { next(err); }
}

async function reject(req, res, next) {
  try {
    if (!req.body.comment?.trim())
      return R.badRequest(res, 'A reason is required when rejecting');
    await approvalService.processDecision(
      req.params.id, 'rejected', req.body.comment, req.user.id
    );
    R.success(res, null, 'Expense rejected');
  } catch (err) { next(err); }
}

async function adminOverride(req, res, next) {
  try {
    const { decision } = req.body;
    if (!['approved', 'rejected'].includes(decision))
      return R.badRequest(res, 'decision must be approved or rejected');
    await approvalService.adminOverride(req.params.expenseId, decision, req.user.id);
    R.success(res, null, `Expense ${decision} by admin`);
  } catch (err) { next(err); }
}

async function getTimeline(req, res, next) {
  try {
    const timeline = await approvalService.getApprovalTimeline(req.params.expenseId);
    R.success(res, timeline);
  } catch (err) { next(err); }
}

module.exports = { getPendingApprovals, approve, reject, adminOverride, getTimeline };