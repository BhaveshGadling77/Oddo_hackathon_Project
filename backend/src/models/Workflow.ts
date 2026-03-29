import mongoose, { Schema, Document } from "mongoose";

export type Operator = "gt" | "lt" | "gte" | "lte" | "eq" | "neq";
export type ApproverRole = "manager" | "admin" | "finance";

export interface IWorkflowRule {
  field: string;
  operator: Operator;
  value: string;
}

export interface IWorkflowStep {
  order: number;
  approverRole: ApproverRole;
  approverId?: mongoose.Types.ObjectId;
}

export interface IWorkflow extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  rules: IWorkflowRule[];
  steps: IWorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowRuleSchema = new Schema<IWorkflowRule>(
  {
    field:    { type: String, required: true },
    operator: { type: String, enum: ["gt", "lt", "gte", "lte", "eq", "neq"], required: true },
    value:    { type: String, required: true },
  },
  { _id: true }
);

const WorkflowStepSchema = new Schema<IWorkflowStep>(
  {
    order:        { type: Number, required: true },
    approverRole: { type: String, enum: ["manager", "admin", "finance"], required: true },
    approverId:   { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: true }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    isActive:    { type: Boolean, default: true },
    rules:       { type: [WorkflowRuleSchema], default: [] },
    steps:       { type: [WorkflowStepSchema], default: [] },
  },
  { timestamps: true }
);

export const Workflow = mongoose.model<IWorkflow>("Workflow", WorkflowSchema);
