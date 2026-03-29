import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { authenticate, signToken, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password required" });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const token = signToken(user._id.toString());
    res.json({ success: true, token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ success: false, message: "Required fields missing" });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName, lastName,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "employee",
      department: department || undefined,
      isActive: true,
    });
    const token = signToken(user._id.toString());
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.json(req.user!.toJSON());
});

router.post("/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
