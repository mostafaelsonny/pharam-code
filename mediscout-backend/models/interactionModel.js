import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    ingredientA: { type: String, required: true, lowercase: true, trim: true },
    ingredientB: { type: String, required: true, lowercase: true, trim: true },
    severity: {
      type: String,
      enum: ["CRITICAL", "MODERATE", "LOW"],
      required: true,
    },
    description: { type: String, required: true },
    recommendation: { type: String, required: true },
  },
  { timestamps: true },
);

export const Interaction = mongoose.model("Interaction", interactionSchema);
