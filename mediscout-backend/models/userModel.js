import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يرجى إدخال الاسم'],
    },
    email: {
      type: String,
      required: [true, 'يرجى إدخال البريد الإلكتروني'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'يرجى إدخال كلمة السر'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'pharmacist', 'admin', 'delivery'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// تشفير كلمة السر تلقائياً قبل الحفظ في قاعدة البيانات
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return ;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// دالة المقارنة بين كلمة السر المدخلة والمشفرة
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
  
export const User = mongoose.model('User', userSchema);