import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = ["citizen", "volunteer", "medical_responder", "organization", "admin"];
export const RESPONDER_ROLES = ["volunteer", "medical_responder", "organization"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true, maxlength: 20 },
    role: { type: String, enum: ROLES, default: "citizen", index: true },
    verificationStatus: {
      type: String,
      enum: ["not_required", "pending", "verified", "rejected"],
      default: "not_required",
      index: true,
    },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: String,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
