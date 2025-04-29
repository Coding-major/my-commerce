const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
