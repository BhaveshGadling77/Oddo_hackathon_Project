const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");

/**
 * Create User
 */
const createUser = async (data, companyId) => {
  const { name, email, password, role, manager_id } = data;

  // check existing user
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    manager_id,
    company_id: companyId,
  });

  return user;
};


/**
 * Get All Users (Company Based)
 */
const getUsers = async (companyId) => {
  return await User.findByCompany(companyId);
};


/**
 * Get Single User
 */
const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};


/**
 * Update User
 */
const updateUser = async (id, data) => {
  const { role, manager_id } = data;

  const updatedUser = await User.update(id, {
    role,
    manager_id,
  });

  return updatedUser;
};


/**
 * Delete User (Optional)
 */
const deleteUser = async (id) => {
  return await User.delete(id);
};


module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};