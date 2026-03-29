import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { FilterQuery } from "mongoose";
import { IUser } from "../models/User";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { role, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: FilterQuery<IUser> = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const total = await User.countDocuments(filter);
    const data = await User.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).lean({ virtuals: true });
    res.json({ success: true, data: data.map(u => ({ ...u, id: u._id })), pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json(user.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, department, role, managerId, isActive, password } = req.body;
    const updates: Partial<IUser> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (department !== undefined) updates.department = department;
    if (role !== undefined) updates.role = role;
    if (managerId !== undefined) updates.managerId = managerId;
    if (isActive !== undefined) updates.isActive = isActive;
    if (password) updates.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json(user.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "User deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
