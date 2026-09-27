import asyncHandler from 'express-async-handler';
import { Drug } from '../models/drugModel.js';

// @desc    جلب الأدوية مع البحث والفلترة والصفحات
// @route   GET /api/drugs
export const getDrugs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const activeIngredient = req.query.activeIngredient || '';

  const query = {};

  if (search) {
    query.tradeName = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  if (activeIngredient) {
    query.activeIngredient = { $in: [new RegExp(activeIngredient, 'i')] };
  }

  const count = await Drug.countDocuments(query);
  const drugs = await Drug.find(query)
    .limit(limit)
    .skip(limit * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    drugs,
    page,
    pages: Math.ceil(count / limit),
    totalDrugs: count,
  });
});

// @desc    إضافة دواء جديد للمخزن
// @route   POST /api/drugs
export const createDrug = asyncHandler(async (req, res) => {
  const { tradeName, activeIngredient, category, price, stockQuantity, dosageForm } = req.body;

  const drugExists = await Drug.findOne({ tradeName });
  if (drugExists) {
    res.status(400);
    throw new Error('هذا الدواء موجود بالفعل في المخزن');
  }

  const drug = await Drug.create({
    tradeName,
    activeIngredient: Array.isArray(activeIngredient) ? activeIngredient : [activeIngredient],
    category,
    price,
    stockQuantity,
    dosageForm,
  });

  res.status(201).json(drug);
});

// @desc    تعديل بيانات دواء
// @route   PUT /api/drugs/:id
export const updateDrug = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);

  if (!drug) {
    res.status(404);
    throw new Error('الدواء غير موجود');
  }

  drug.tradeName = req.body.tradeName || drug.tradeName;
  drug.activeIngredient = req.body.activeIngredient || drug.activeIngredient;
  drug.category = req.body.category || drug.category;
  drug.price = req.body.price ?? drug.price;
  drug.stockQuantity = req.body.stockQuantity ?? drug.stockQuantity;
  drug.dosageForm = req.body.dosageForm || drug.dosageForm;

  const updatedDrug = await drug.save();
  res.json(updatedDrug);
});

// @desc    حذف دواء من المخزن
// @route   DELETE /api/drugs/:id
export const deleteDrug = asyncHandler(async (req, res) => {
  const drug = await Drug.findById(req.params.id);

  if (!drug) {
    res.status(404);
    throw new Error('الدواء غير موجود');
  }

  await drug.deleteOne();
  res.json({ message: 'تم حذف الدواء بنجاح' });
});