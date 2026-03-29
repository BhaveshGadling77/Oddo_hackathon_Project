const router   = require('express').Router();
const passport = require('passport');
const { body } = require('express-validator');
const ctrl     = require('../controllers/auth.controller.js');
const { authenticate } = require('../middlewares/auth.middleware');

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/signup', signupRules, ctrl.signup);
router.post('/login',  loginRules,  ctrl.login);
router.get('/me',      authenticate, ctrl.getMe);
router.get('/countries', ctrl.getCountries);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  ctrl.googleCallback
);

module.exports = router;