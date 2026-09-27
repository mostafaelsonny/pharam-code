import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      res.status(401);
      throw new Error('غير مصرح، الـ Token غير صالحة أو منتهية');
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('المستخدم غير موجود');
    }

    if (req.user.isBlocked) {
      res.status(403);
      throw new Error('تم حظر هذا الحساب، يرجى التواصل مع الإدارة');
    }

    next();
    return;
  }

  res.status(401);
  throw new Error('غير مصرح، لا يوجد Token');
});

// 2. التحقق الاختياري من تسجيل الدخول (في حالة الزائر)
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch (error) {
      // تجاهل أخطاء التوكن في حالة الفحص الاختياري
    }
  }

  next();
});

// 3. التحقق من أدوار المستخدمين (RBAC Authorization)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`الدور (${req.user?.role}) غير مصرح له بالوصول لهذا المسار`);
    }
    next();
  };
};