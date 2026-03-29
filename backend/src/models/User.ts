import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "manager" | "employee";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
    department:{ type: String },
    managerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  return obj;
};

export const User = mongoose.model<IUser>("User", UserSchema);
