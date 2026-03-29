import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { User } from "./models/User";
import { Expense } from "./models/Expense";
import { Approval } from "./models/Approval";
import { Workflow } from "./models/Workflow";

async function seed() {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    Approval.deleteMany({}),
    Expense.deleteMany({}),
    Workflow.deleteMany({}),
    User.deleteMany({}),
  ]);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const [admin, manager, emp1, emp2] = await User.insertMany([
    { firstName: "Admin",  lastName: "User",    email: "admin@company.com",    password: hash("admin123"),    role: "admin",    department: "IT",          isActive: true },
    { firstName: "Sarah",  lastName: "Manager", email: "manager@company.com",  password: hash("manager123"),  role: "manager",  department: "Engineering", isActive: true },
    { firstName: "John",   lastName: "Doe",     email: "employee@company.com", password: hash("employee123"), role: "employee", department: "Engineering", isActive: true },
    { firstName: "Jane",   lastName: "Smith",   email: "jane@company.com",     password: hash("employee123"), role: "employee", department: "Sales",       isActive: true },
  ]);

  await User.findByIdAndUpdate(emp1._id, { managerId: manager._id });
  await User.findByIdAndUpdate(emp2._id, { managerId: manager._id });

  const [exp1, exp2, exp3, exp4] = await Expense.insertMany([
    { title: "Team Lunch",       description: "Quarterly team lunch",   amount: 125.50, currency: "USD", category: "Meals",    status: "pending",  employeeId: emp1._id },
    { title: "Flight to NYC",    description: "Client meeting travel",  amount: 450.00, currency: "USD", category: "Travel",   status: "pending",  employeeId: emp1._id },
    { title: "VS Code License",  description: "Annual subscription",    amount:  99.00, currency: "USD", category: "Software", status: "approved", employeeId: emp2._id },
    { title: "Conference Ticket",description: "Node.js conf 2026",      amount: 799.00, currency: "USD", category: "Travel",   status: "rejected", employeeId: emp2._id },
  ]);

  await Approval.insertMany([
    { expenseId: exp1._id, approverId: manager._id, status: "pending" },
    { expenseId: exp2._id, approverId: manager._id, status: "pending" },
    { expenseId: exp3._id, approverId: manager._id, status: "approved", comment: "Valid tool expense",    actionAt: new Date() },
    { expenseId: exp4._id, approverId: manager._id, status: "rejected", comment: "Budget exceeded for Q1", actionAt: new Date() },
  ]);

  await Workflow.create({
    name: "Standard Approval",
    description: "Default workflow for all expenses",
    isActive: true,
    rules: [{ field: "amount", operator: "gte", value: "0" }],
    steps: [
      { order: 1, approverRole: "manager" },
      { order: 2, approverRole: "admin" },
    ],
  });

  console.log("\n✅ Seed complete!");
  console.log("  admin@company.com    / admin123");
  console.log("  manager@company.com  / manager123");
  console.log("  employee@company.com / employee123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
