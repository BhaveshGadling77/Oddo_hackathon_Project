const router = require('express').Router();
const ctrl   = require('../controllers/workflow.controller');
const { authenticate, roleGuard, requireCompany } = require('../middlewares/auth.middleware');

router.use(authenticate, requireCompany, roleGuard('admin'));

router.post('/',     ctrl.createFlow);
router.get('/',      ctrl.listFlows);
router.put('/:id',   ctrl.updateFlow);

module.exports = router;