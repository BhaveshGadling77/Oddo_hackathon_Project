import mongoose, { Schema, Document } from "mongoose";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface IApproval extends Document {
  _id: mongoose.Types.ObjectId;
  expenseId: mongoose.Types.ObjectId;
  approverId: mongoose.Types.ObjectId;
  status: ApprovalStatus;
  comment?: string;
  actionAt?: Date;
  createdAt: Date;
}

const ApprovalSchema = new Schema<IApproval>(
  {
    expenseId:  { type: Schema.Types.ObjectId, ref: "Expense", required: true },
    approverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    comment:    { type: String },
    actionAt:   { type: Date },
  },
  { timestamps: true }
);

export const Approval = mongoose.model<IApproval>("Approval", ApprovalSchema);
