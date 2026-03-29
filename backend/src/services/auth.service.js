const UserModel = require('../models/user.model');
const CompanyModel = require('../models/company.model');
const { sign } = require('../utils/jwt.util');

class AuthService {
  /**
   * Register a new company + admin user in one transaction.
   */
  static async signup({ companyName, currency, name, email, password }) {
    // Check if email already exists
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      throw err;
    }

    // Check if company name is taken
    const existingCompany = await CompanyModel.findByName(companyName);
    if (existingCompany) {
      const err = new Error('Company name already registered');
      err.statusCode = 409;
      throw err;
    }

    const company = await CompanyModel.create({ name: companyName, currency });
    const user = await UserModel.create({
      name,
      email,
      password,
      role: 'admin',
      companyId: company.id,
    });

    const token = sign({ id: user.id, role: user.role, companyId: user.company_id });
    return { user, company, token };
  }

  /**
   * Authenticate an existing user with email + password.
   */
  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.password_hash) {
      const err = new Error('Please sign in with Google');
      err.statusCode = 400;
      throw err;
    }

    const valid = await UserModel.verifyPassword(password, user.password_hash);
    if (!valid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const token = sign({ id: user.id, role: user.role, companyId: user.company_id });

    // Strip password hash before returning
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Issue a JWT for a user who authenticated via Google OAuth.
   */
  static async googleLogin(user) {
    const token = sign({ id: user.id, role: user.role, companyId: user.company_id });
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Return safe profile of the currently authenticated user.
   */
  static async me(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }
}

module.exports = AuthService;