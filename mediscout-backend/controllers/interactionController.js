import asyncHandler from 'express-async-handler';
import { Interaction } from '../models/interactionModel.js';

// @desc    فحص التداخلات الدوائية بين قائمة مواد فعالة
// @route   POST /api/interactions/check
export const checkInteractions = asyncHandler(async (req, res) => {
  const { ingredients } = req.body; // Array of active ingredients: ['warfarin', 'diclofenac']

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
    return res.json({ warnings: [] });
  }

  // تحويل المواد إلى Lowercase للبحث الموحد
  const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());

  // البحث عن أي تداخل بين أي زوج من المواد
  const interactions = await Interaction.find({
    ingredientA: { $in: normalizedIngredients },
    ingredientB: { $in: normalizedIngredients },
  });

  res.json({
    hasInteractions: interactions.length > 0,
    warnings: interactions,
  });
});