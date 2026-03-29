import mongoose, { Schema, Document } from "mongoose";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ExpenseCategory = "Travel" | "Meals" | "Software" | "Equipment" | "Other";

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  employeeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String },
    amount:      { type: Number, required: true, min: 0 },
    currency:    { type: String, default: "USD" },
    category:    { type: String, required: true },
    status:      { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    receiptUrl:  { type: String },
    employeeId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
