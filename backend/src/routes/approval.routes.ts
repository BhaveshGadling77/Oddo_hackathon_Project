import { Router } from "express";
import { Approval } from "../models/Approval";
import { Expense } from "../models/Expense";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { FilterQuery } from "mongoose";
import { IApproval } from "../models/Approval";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: FilterQuery<IApproval> = {};
    if (req.user!.role === "manager") filter.approverId = req.user!._id;
    if (status) filter.status = status;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const total = await Approval.countDocuments(filter);
    const approvals = await Approval.find(filter)
      .populate("approverId", "-password")
      .populate({ path: "expenseId", populate: { path: "employeeId", select: "-password" } })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const data = approvals.map(a => ({ ...a.toObject(), id: a._id, approver: a.approverId, expense: a.expenseId }));
    res.json({ success: true, data, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/approve", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const { comment } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) { res.status(404).json({ success: false, message: "Approval not found" }); return; }
    if (req.user!.role === "manager" && approval.approverId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Forbidden" }); return;
    }
    approval.status   = "approved";
    approval.comment  = comment || undefined;
    approval.actionAt = new Date();
    await approval.save();
    await Expense.findByIdAndUpdate(approval.expenseId, { status: "approved" });
    const populated = await approval.populate("approverId", "-password");
    res.json({ ...populated.toObject(), id: populated._id, approver: populated.approverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/reject", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const { comment } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) { res.status(404).json({ success: false, message: "Approval not found" }); return; }
    if (req.user!.role === "manager" && approval.approverId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Forbidden" }); return;
    }
    approval.status   = "rejected";
    approval.comment  = comment || undefined;
    approval.actionAt = new Date();
    await approval.save();
    await Expense.findByIdAndUpdate(approval.expenseId, { status: "rejected" });
    const populated = await approval.populate("approverId", "-password");
    res.json({ ...populated.toObject(), id: populated._id, approver: populated.approverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
