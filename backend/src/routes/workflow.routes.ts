import { Router } from "express";
import { Workflow } from "../models/Workflow";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", async (_req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json({ success: true, data: workflows.map(w => ({ ...w.toObject(), id: w._id })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, description, isActive = true, rules = [], steps = [] } = req.body;
    if (!name) { res.status(400).json({ success: false, message: "Name required" }); return; }
    const workflow = await Workflow.create({ name, description, isActive, rules, steps });
    res.status(201).json({ ...workflow.toObject(), id: workflow._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) { res.status(404).json({ success: false, message: "Workflow not found" }); return; }
    res.json({ ...workflow.toObject(), id: workflow._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, description, isActive, rules, steps } = req.body;
    const updates: Record<string, unknown> = {};
    if (name        !== undefined) updates.name        = name;
    if (description !== undefined) updates.description = description;
    if (isActive    !== undefined) updates.isActive    = isActive;
    if (rules       !== undefined) updates.rules       = rules;
    if (steps       !== undefined) updates.steps       = steps;
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!workflow) { res.status(404).json({ success: false, message: "Workflow not found" }); return; }
    res.json({ ...workflow.toObject(), id: workflow._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await Workflow.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Workflow deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
