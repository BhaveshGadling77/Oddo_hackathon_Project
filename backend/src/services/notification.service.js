const pool = require('../config/db');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Persist a notification and (optionally) push in real-time via SSE/WebSocket.
   *
   * @param {object} opts
   * @param {number} opts.userId      - recipient
   * @param {string} opts.type        - e.g. 'approval_requested' | 'expense_approved' | 'expense_rejected'
   * @param {string} opts.message     - human-readable text
   * @param {object} [opts.metadata]  - arbitrary JSON payload (expenseId, etc.)
   */
  static async notify({ userId, type, message, metadata = {} }) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, metadata) VALUES (?, ?, ?, ?)`,
        [userId, type, message, JSON.stringify(metadata)]
      );

      logger.info(`Notification sent to user ${userId}: [${type}] ${message}`);
    } catch (err) {
      // Notifications are non-critical — log but don't crash the request
      logger.error(`Failed to create notification for user ${userId}: ${err.message}`);
    }
  }

  /**
   * Fetch unread notifications for a user.
   */
  static async getUnread(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((n) => ({
      ...n,
      metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata,
    }));
  }

  /**
   * Fetch all notifications for a user (paginated).
   */
  static async getAll(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?`,
      [userId]
    );
    return {
      rows: rows.map((n) => ({
        ...n,
        metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata,
      })),
      total,
    };
  }

  /**
   * Mark one or all notifications as read.
   */
  static async markRead(userId, notificationId = null) {
    if (notificationId) {
      await pool.query(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
    } else {
      await pool.query(
        `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
        [userId]
      );
    }
  }
}

module.exports = NotificationService;