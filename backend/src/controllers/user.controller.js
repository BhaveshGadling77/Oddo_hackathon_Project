const userService = require('../services/user.service.js');
const R           = require('../utils/response.util.js');
const { validationResult } = require('express-validator');

async function createUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.badRequest(res, 'Validation failed', errors.array());
    const user = await userService.createUser({ ...req.body, companyId: req.user.company_id });
    R.created(res, user, 'User created');
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers(req.user.company_id, req.query);
    R.success(res, users);
  } catch (err) { next(err); }
}

async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    R.success(res, user);
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(
      req.params.id, req.user.id, req.user.role, req.body
    );
    R.success(res, user, 'User updated');
  } catch (err) { next(err); }
}

async function getManagers(req, res, next) {
  try {
    const managers = await userService.getManagers(req.user.company_id);
    R.success(res, managers);
  } catch (err) { next(err); }
}

module.exports = { createUser, listUsers, getUser, updateUser, getManagers };