import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema(
  {
    tradeName: {
      type: String,
      required: [true, 'يرجى إدخال اسم الدواء التجارى'],
      trim: true,
    },
    activeIngredient: [
      {
        type: String,
        required: [true, 'يرجى إدخال المادة الفعالة'],
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, 'يرجى تحديد التصنيف'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'يرجى إدخال السعر'],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'يرجى إدخال الكمية المتاحة'],
      default: 0,
    },
    dosageForm: {
      type: String,
      required: [true, 'يرجى تحديد الشكل الدوائي'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Drug = mongoose.model('Drug', drugSchema);