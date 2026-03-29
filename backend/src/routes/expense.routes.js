const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/expense.controller');
const { authenticate, requireCompany } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

const createRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('currency').trim().notEmpty().isLength({ min: 3, max: 3 }).withMessage('Currency code required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('expense_date').isDate().withMessage('Valid date required'),
];

router.use(authenticate, requireCompany);

router.get('/stats',    ctrl.getStats);
router.post('/',        upload.single('receipt'), createRules, ctrl.createExpense);
router.get('/',         ctrl.listExpenses);
router.get('/:id',      ctrl.getExpense);
router.put('/:id',      ctrl.updateExpense);
router.post('/:id/comments', ctrl.addComment);

module.exports = router;