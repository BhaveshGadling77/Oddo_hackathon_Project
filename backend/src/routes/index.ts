import { Router } from "express";
import authRouter     from "./auth.routes";
import userRouter     from "./user.routes";
import expenseRouter  from "./expense.routes";
import approvalRouter from "./approval.routes";
import workflowRouter from "./workflow.routes";

const router = Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));
router.use("/auth",           authRouter);
router.use("/users",          userRouter);
router.use("/expenses",       expenseRouter);
router.use("/approvals",      approvalRouter);
router.use("/approval-flows", workflowRouter);

export default router;
