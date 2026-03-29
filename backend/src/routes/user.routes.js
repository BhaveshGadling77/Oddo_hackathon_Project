const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/user.controller');
const { authenticate, roleGuard, requireCompany } = require('../middlewares/auth.middleware');

const createRules = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['admin', 'manager', 'employee']),
];

router.use(authenticate, requireCompany);

router.post('/',          roleGuard('admin'), createRules, ctrl.createUser);
router.get('/',           roleGuard('admin', 'manager'), ctrl.listUsers);
router.get('/managers',   ctrl.getManagers);
router.get('/:id',        ctrl.getUser);
router.put('/:id',        ctrl.updateUser);

module.exports = router;