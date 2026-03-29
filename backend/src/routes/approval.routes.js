const router = require('express').Router();
const approvalCtrl  = require('../controllers/approval.controller');
const workflowCtrl  = require('../controllers/workflow.controller');
const { authenticate, roleGuard, requireCompany } = require('../middlewares/auth.middleware');

router.use(authenticate, requireCompany);

// Approval routes
router.get('/pending',                           approvalCtrl.getPendingApprovals);
router.post('/:id/approve',                      approvalCtrl.approve);
router.post('/:id/reject',                       approvalCtrl.reject);
router.get('/timeline/:expenseId',               approvalCtrl.getTimeline);
router.post('/override/:expenseId', roleGuard('admin'), approvalCtrl.adminOverride);

module.exports = router;