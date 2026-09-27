import asyncHandler from 'express-async-handler';
import { User } from '../models/userModel.js';

// @desc    جلب جميع المستخدمين مع البحث والفلترة والصفحات (Pagination)
// @route   GET /api/users
// @access  Private / Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // إعداد شروط البحث بالاسم أو البريد أو الفلترة بالدور
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const roleFilter = req.query.role ? { role: req.query.role } : {};

  const query = { ...keyword, ...roleFilter };

  const totalUsers = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    users,
    page,
    pages: Math.ceil(totalUsers / limit),
    totalUsers,
  });
});

// @desc    إضافة مستخدم جديد مباشر بواسطة الأدمن (مثل إنشاء حساب صيدلي أو أدمن جديد)
// @route   POST /api/users
// @access  Private / Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('البريد الإلكتروني مسجل بالفعل');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('بيانات المستخدم غير صالحة');
  }
});

// @desc    جلب بيانات مستخدم محدد بواسطة الـ ID
// @route   GET /api/users/:id
// @access  Private / Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
});

// @desc    تعديل بيانات مستخدم (الاسم، البريد، الدور، أو كلمة السر)
// @route   PUT /api/users/:id
// @access  Private / Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked,
    });
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
});

// @desc    حظر أو فك حظر حساب مستخدم (Toggle Block Status)
// @route   PATCH /api/users/:id/block
// @access  Private / Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // منع الأدمن من حظر نفسه
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('لا يمكنك حظر حسابك الشخصي');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? 'تم حظر المستخدم بنجاح' : 'تم فك حظر المستخدم بنجاح',
      _id: user._id,
      isBlocked: user.isBlocked,
    });
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
});

// @desc    حذف مستخدم نهائياً
// @route   DELETE /api/users/:id
// @access  Private / Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // منع الأدمن من حذف نفسه
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('لا يمكنك حذف حسابك الشخصي');
    }

    await user.deleteOne();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } else {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }
});



// @desc    جلب جميع الصيادلة المتاحين في النظام للمريض
// @route   GET /api/users/pharmacists
// @access  Public / Patient
export const getActivePharmacists = asyncHandler(async (req, res) => {
  const pharmacists = await User.find({
    role: 'pharmacist',
    isBlocked: false,
  }).select('_id name email');

  res.json(pharmacists);
});

// @desc    جلب جميع مناديب التوصيل المتاحين في النظام
// @route   GET /api/users/delivery-reps
// @access  Public / Patient
export const getActiveDeliveryReps = asyncHandler(async (req, res) => {
  const deliveryReps = await User.find({
    role: 'delivery',
    isBlocked: false,
  }).select('_id name email');

  res.json(deliveryReps);
});