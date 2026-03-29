const { pool }  = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const R         = require('../utils/response.util');

async function createFlow(req, res, next) {
  try {
    const { name, manager_first = false, steps = [], rules = [] } = req.body;
    if (!name?.trim()) return R.badRequest(res, 'Flow name is required');
    const companyId = req.user.company_id;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Deactivate existing flows
      await conn.query(
        `UPDATE approval_flows SET active=0 WHERE company_id=?`, [companyId]
      );

      const flowId = uuidv4();
      await conn.query(
        `INSERT INTO approval_flows (id, company_id, name, manager_first, active)
         VALUES (?,?,?,?,1)`,
        [flowId, companyId, name, manager_first ? 1 : 0]
      );

      // Insert steps
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await conn.query(
          `INSERT INTO approval_steps
           (id, flow_id, step_order, approver_type, approver_id, approver_role)
           VALUES (?,?,?,?,?,?)`,
          [uuidv4(), flowId, i + 1, s.approver_type || 'user',
           s.approver_id || null, s.approver_role || null]
        );
      }

      // Insert rule if provided
      if (rules.length) {
        const r = rules[0]; // one rule per flow for now
        await conn.query(
          `INSERT INTO approval_rules
           (id, flow_id, rule_type, threshold_pct, specific_approver_id, logic_operator)
           VALUES (?,?,?,?,?,?)`,
          [uuidv4(), flowId, r.rule_type, r.threshold_pct || null,
           r.specific_approver_id || null, r.logic_operator || 'OR']
        );
      }

      await conn.commit();
      const flow = await getFlowById(flowId);
      R.created(res, flow, 'Approval flow created');
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
}

async function listFlows(req, res, next) {
  try {
    const [flows] = await pool.query(
      `SELECT * FROM approval_flows WHERE company_id=? ORDER BY created_at DESC`,
      [req.user.company_id]
    );
    // Attach steps + rules to each
    for (const flow of flows) {
      [flow.steps] = await pool.query(
        `SELECT ast.*, u.name AS approver_name
         FROM approval_steps ast
         LEFT JOIN users u ON u.id = ast.approver_id
         WHERE ast.flow_id=? ORDER BY ast.step_order`,
        [flow.id]
      );
      [flow.rules] = await pool.query(
        `SELECT ar.*, u.name AS specific_approver_name
         FROM approval_rules ar
         LEFT JOIN users u ON u.id = ar.specific_approver_id
         WHERE ar.flow_id=?`,
        [flow.id]
      );
    }
    R.success(res, flows);
  } catch (err) { next(err); }
}

async function updateFlow(req, res, next) {
  try {
    const { id } = req.params;
    const [[flow]] = await pool.query(
      `SELECT * FROM approval_flows WHERE id=? AND company_id=?`,
      [id, req.user.company_id]
    );
    if (!flow) return R.notFound(res, 'Flow not found');

    const { name, manager_first, active } = req.body;
    await pool.query(
      `UPDATE approval_flows SET name=COALESCE(?,name),
       manager_first=COALESCE(?,manager_first), active=COALESCE(?,active)
       WHERE id=?`,
      [name || null, manager_first !== undefined ? (manager_first ? 1 : 0) : null,
       active !== undefined ? (active ? 1 : 0) : null, id]
    );
    R.success(res, await getFlowById(id), 'Flow updated');
  } catch (err) { next(err); }
}

async function getFlowById(flowId) {
  const [[flow]] = await pool.query(`SELECT * FROM approval_flows WHERE id=?`, [flowId]);
  if (!flow) return null;
  [flow.steps] = await pool.query(
    `SELECT ast.*, u.name AS approver_name
     FROM approval_steps ast LEFT JOIN users u ON u.id=ast.approver_id
     WHERE ast.flow_id=? ORDER BY ast.step_order`,
    [flowId]
  );
  [flow.rules] = await pool.query(
    `SELECT ar.*, u.name AS specific_approver_name
     FROM approval_rules ar LEFT JOIN users u ON u.id=ar.specific_approver_id
     WHERE ar.flow_id=?`,
    [flowId]
  );
  return flow;
}

module.exports = { createFlow, listFlows, updateFlow };