import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    relationship: { type: String, trim: true, maxlength: 40 },
    isTrusted: { type: Boolean, default: true }, // used by Silent SOS
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyContact", contactSchema);
