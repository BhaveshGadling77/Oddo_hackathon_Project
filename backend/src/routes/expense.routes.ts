import { Router } from "express";
import { Expense } from "../models/Expense";
import { Approval } from "../models/Approval";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { FilterQuery } from "mongoose";
import { IExpense } from "../models/Expense";

const router = Router();
router.use(authenticate);

router.get("/stats", async (req: AuthRequest, res) => {
  try {
    const filter: FilterQuery<IExpense> = {};
    if (req.user!.role === "employee") filter.employeeId = req.user!._id;
    const all = await Expense.find(filter);
    const byCategory: Record<string, { count: number; amount: number }> = {};
    let totalAmount = 0, pendingAmount = 0, approvedAmount = 0;
    let totalPending = 0, totalApproved = 0, totalRejected = 0;
    for (const e of all) {
      totalAmount += e.amount;
      if (e.status === "pending")  { totalPending++;  pendingAmount  += e.amount; }
      if (e.status === "approved") { totalApproved++; approvedAmount += e.amount; }
      if (e.status === "rejected")   totalRejected++;
      if (!byCategory[e.category]) byCategory[e.category] = { count: 0, amount: 0 };
      byCategory[e.category].count++;
      byCategory[e.category].amount += e.amount;
    }
    res.json({
      totalSubmitted: all.length, totalPending, totalApproved, totalRejected,
      totalAmount, pendingAmount, approvedAmount,
      byCategory: Object.entries(byCategory).map(([category, v]) => ({ category, ...v })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { status, category, startDate, endDate, employeeId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: FilterQuery<IExpense> = {};
    if (req.user!.role === "employee") filter.employeeId = req.user!._id;
    else if (employeeId) filter.employeeId = employeeId;
    if (status)    filter.status   = status;
    if (category)  filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .populate("employeeId", "-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const enriched = await Promise.all(expenses.map(async (e) => {
      const approvals = await Approval.find({ expenseId: e._id }).populate("approverId", "-password");
      return { ...e.toObject(), id: e._id, employee: e.employeeId, approvals };
    }));
    res.json({ success: true, data: enriched, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { title, description, amount, currency, category, receiptUrl } = req.body;
    if (!title || !amount || !category) {
      res.status(400).json({ success: false, message: "title, amount, category required" });
      return;
    }
    const expense = await Expense.create({
      title, description, amount: Number(amount),
      currency: currency || "USD", category,
      status: "pending", receiptUrl,
      employeeId: req.user!._id,
    });
    const populated = await expense.populate("employeeId", "-password");
    res.status(201).json({ ...populated.toObject(), id: populated._id, employee: populated.employeeId, approvals: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("employeeId", "-password");
    if (!expense) { res.status(404).json({ success: false, message: "Expense not found" }); return; }
    if (req.user!.role === "employee" && expense.employeeId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Forbidden" }); return;
    }
    const approvals = await Approval.find({ expenseId: expense._id }).populate("approverId", "-password");
    res.json({ ...expense.toObject(), id: expense._id, employee: expense.employeeId, approvals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) { res.status(404).json({ success: false, message: "Expense not found" }); return; }
    if (req.user!.role === "employee" && expense.employeeId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Forbidden" }); return;
    }
    const { title, description, amount, currency, category, receiptUrl } = req.body;
    const updates: Partial<IExpense> = {};
    if (title       !== undefined) updates.title       = title;
    if (description !== undefined) updates.description = description;
    if (amount      !== undefined) updates.amount      = Number(amount);
    if (currency    !== undefined) updates.currency    = currency;
    if (category    !== undefined) updates.category    = category;
    if (receiptUrl  !== undefined) updates.receiptUrl  = receiptUrl;
    const updated = await Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ ...updated!.toObject(), id: updated!._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) { res.status(404).json({ success: false, message: "Expense not found" }); return; }
    if (req.user!.role === "employee" && expense.employeeId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Forbidden" }); return;
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
