import asyncHandler from "../utils/asyncHandler.js";
import { aiClassify, fallbackClassify } from "../services/aiService.js";

// Lets the citizen preview suggestions while typing. Suggestions only; the user decides.
export const classify = asyncHandler(async (req, res) => {
  const { description, category = "other" } = req.body;
  const ai = (await aiClassify(description, category)) || fallbackClassify(description, category);
  res.json({
    success: true,
    suggestion: ai,
    label: ai.source === "ai" ? "AI-generated suggestion. Please check it." : "Automatic keyword suggestion (AI is not configured or unavailable). Please check it.",
  });
});
