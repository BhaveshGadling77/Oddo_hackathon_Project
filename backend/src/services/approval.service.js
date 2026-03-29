const pool = require('../config/db');
const ApprovalModel = require('../models/approval.model');
const ExpenseModel = require('../models/expense.model');
const NotificationService = require('./notification.service');

class ApprovalService {
  /**
   * Initiate approval workflow for a newly submitted expense.
   * Fetches the matching approval flow rules for the company and
   * creates sequential approval steps.
   */
  static async initiate(expense) {
    const flow = await this._matchFlow(expense);

    if (!flow || !flow.steps.length) {
      // No workflow matched — auto-approve
      await ExpenseModel.updateStatus(expense.id, 'approved');
      return;
    }

    for (const step of flow.steps) {
      const approverId = await this._resolveApprover(step, expense);
      if (approverId) {
        await ApprovalModel.create({
          expenseId: expense.id,
          approverId,
          step: step.label,
          order: step.order,
        });
      }
    }

    // Notify the first approver
    const firstApproval = (await ApprovalModel.getTimelineByExpense(expense.id))[0];
    if (firstApproval) {
      await NotificationService.notify({
        userId: firstApproval.approver_id,
        type: 'approval_requested',
        message: `New expense "${expense.title}" is awaiting your approval.`,
        metadata: { expenseId: expense.id },
      });
    }
  }

  /**
   * Process an approve/reject action by an approver.
   */
  static async process({ approvalId, action, comment, actingUser }) {
    const approval = await ApprovalModel.findById(approvalId);
    if (!approval) {
      const err = new Error('Approval record not found');
      err.statusCode = 404;
      throw err;
    }

    if (approval.approver_id !== actingUser.id) {
      const err = new Error('You are not the assigned approver for this step');
      err.statusCode = 403;
      throw err;
    }

    if (approval.status !== 'pending') {
      const err = new Error('This approval step has already been acted on');
      err.statusCode = 400;
      throw err;
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    await ApprovalModel.updateStatus(approvalId, status, comment);

    const expense = await ExpenseModel.findById(approval.expense_id);

    if (status === 'rejected') {
      await ExpenseModel.updateStatus(expense.id, 'rejected');
      await NotificationService.notify({
        userId: expense.user_id,
        type: 'expense_rejected',
        message: `Your expense "${expense.title}" was rejected. Reason: ${comment || 'No reason given'}`,
        metadata: { expenseId: expense.id },
      });
      return;
    }

    // Check if more steps remain
    const hasMore = await ApprovalModel.hasPendingSteps(expense.id);
    if (!hasMore) {
      await ExpenseModel.updateStatus(expense.id, 'approved');
      await NotificationService.notify({
        userId: expense.user_id,
        type: 'expense_approved',
        message: `Your expense "${expense.title}" has been fully approved! 🎉`,
        metadata: { expenseId: expense.id },
      });
    } else {
      // Notify next approver
      const nextStep = await ApprovalModel.getNextPendingStep(expense.id, approval.step_order);
      if (nextStep) {
        await NotificationService.notify({
          userId: nextStep.approver_id,
          type: 'approval_requested',
          message: `Expense "${expense.title}" is awaiting your approval (step ${nextStep.step_order}).`,
          metadata: { expenseId: expense.id },
        });
      }
    }
  }

  /**
   * Return the full approval timeline for an expense.
   */
  static async getTimeline(expenseId) {
    return ApprovalModel.getTimelineByExpense(expenseId);
  }

  /**
   * Return all pending approvals for the acting user.
   */
  static async getPending(approverId) {
    return ApprovalModel.getPendingByApprover(approverId);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Find the best-matching approval flow for the expense based on company rules.
   */
  static async _matchFlow(expense) {
    const [flows] = await pool.query(
      `SELECT * FROM approval_flows
       WHERE company_id = ? AND is_active = 1
       ORDER BY priority DESC`,
      [expense.company_id]
    );

    for (const flow of flows) {
      const [rules] = await pool.query(
        `SELECT * FROM flow_rules WHERE flow_id = ?`,
        [flow.id]
      );

      const matches = rules.every((rule) => this._evalRule(rule, expense));
      if (matches) {
        const [steps] = await pool.query(
          `SELECT * FROM flow_steps WHERE flow_id = ? ORDER BY step_order ASC`,
          [flow.id]
        );
        return { ...flow, steps };
      }
    }

    return null;
  }

  static _evalRule(rule, expense) {
    const { field, operator, value } = rule;
    const actual = expense[field];

    switch (operator) {
      case 'gt': return Number(actual) > Number(value);
      case 'gte': return Number(actual) >= Number(value);
      case 'lt': return Number(actual) < Number(value);
      case 'lte': return Number(actual) <= Number(value);
      case 'eq': return String(actual) === String(value);
      case 'in': return value.split(',').map((v) => v.trim()).includes(String(actual));
      default: return false;
    }
  }

  /**
   * Resolve the actual user ID for an approval step.
   * step.approver_type: 'manager' | 'role' | 'user'
   */
  static async _resolveApprover(step, expense) {
    if (step.approver_type === 'user') {
      return step.approver_id;
    }

    if (step.approver_type === 'manager') {
      const [[submitter]] = await pool.query(
        `SELECT manager_id FROM users WHERE id = ?`,
        [expense.user_id]
      );
      return submitter?.manager_id || null;
    }

    if (step.approver_type === 'role') {
      const [[approver]] = await pool.query(
        `SELECT id FROM users WHERE company_id = ? AND role = ? LIMIT 1`,
        [expense.company_id, step.approver_role]
      );
      return approver?.id || null;
    }

    return null;
  }
}

module.exports = ApprovalService;