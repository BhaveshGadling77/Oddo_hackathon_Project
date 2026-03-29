const authService     = require('../services/auth.service');
const currencyService = require('../services/currency.service');
const R               = require('../utils/response.util');
const { validationResult } = require('express-validator');

async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.badRequest(res, 'Validation failed', errors.array());
    const result = await authService.signup(req.body);
    R.created(res, result, 'Account created successfully');
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.badRequest(res, 'Validation failed', errors.array());
    const result = await authService.login(req.body);
    R.success(res, result, 'Login successful');
  } catch (err) { next(err); }
}

async function googleCallback(req, res) {
  // Passport puts { user, token } in req.user after strategy success
  const { token } = req.user;
  res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`);
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    R.success(res, user);
  } catch (err) { next(err); }
}

async function getCountries(req, res, next) {
  try {
    const countries = await currencyService.getCountryList();
    R.success(res, countries);
  } catch (err) { next(err); }
}

module.exports = { signup, login, googleCallback, getMe, getCountries };