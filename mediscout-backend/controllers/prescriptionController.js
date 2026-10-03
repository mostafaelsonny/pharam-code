import asyncHandler from "express-async-handler";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import { Drug } from "../models/drugModel.js";
import { Interaction } from "../models/interactionModel.js";
import { Prescription } from "../models/prescriptionModel.js";
import {
  notifyPharmacistNewPrescription,
  notifyPatientPrescriptionStatus,
  notifyDeliveryNewOrder,
} from "../socket.js";

// 1- receive request body and destructure it to extract the data ...
// 2- Integration with Gemini to send the prescription and extract the medications from it...
// 3- turn the texeted gemini response into json and make loop for each extracted drug ...
// 4- if it was exist in our database then we store it in "processedItems" array with availabilityStatus : availabel ...
// 5- if it was not exist in our database we search for alternative to him and sore it in "processedItems" array with availabilityStatus : alternative available ...
// 6- if it was not exist and has no alternatives we sore it in "processedItems" array with availabilityStatus : out of stock
export const processPrescription = asyncHandler(async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const {
    imageBase64,
    mimeType,
    patientName,
    phone,
    email,
    address,
    pharmacistId,
  } = req.body;

  if (!imageBase64 || !phone || !address || !pharmacistId) {
    res.status(400);
    throw new Error(
      "يرجى رفع صورة الروشتة، البيانات الأساسية، واختيار الصيدلي",
    );
  }

  const prompt = `
    Analyze this medical prescription image carefully.
    Extract all written medications and return ONLY a clean JSON object with this exact structure:
    {
      "medicines": [
        {
          "drugName": "Trade name of the drug",
          "activeIngredient": "Scientific or active ingredient name",
          "dosage": "Dosage instructions e.g. 1 tablet every 8 hours"
        }
      ]
    }
    Do NOT add markdown syntax or text.
  `;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
        ],
      },
    ],
  });

  const parsedAI = JSON.parse(aiResponse.text.trim());
  const extractedMedicines = parsedAI.medicines || [];

  const processedItems = [];
  const activeIngredientsList = [];
  let totalAmount = 0;
  let requiresPharmacistReview = false;

  for (const med of extractedMedicines) {
    // 1. البحث عن الدواء الأصلي بنفس الاسم التجاري
    const exactMatch = await Drug.findOne({
      tradeName: { $regex: med.drugName, $options: "i" },
      stockQuantity: { $gt: 0 },
    });

    if (exactMatch) {
      const ingredients = Array.isArray(exactMatch.activeIngredient)
        ? exactMatch.activeIngredient.join(" / ")
        : exactMatch.activeIngredient;
      requiresPharmacistReview = true;
      processedItems.push({
        drugId: exactMatch._id,
        drugName: exactMatch.tradeName,
        activeIngredient: ingredients,
        dosage: med.dosage,
        quantity: 1,
        price: exactMatch.price,
        inStock: true,
        availabilityStatus: "AVAILABLE", // 1- متوفر الأصلي
        isAlternative: false,
        reviewStatus: "PENDING_REVIEW",
      });

      if (Array.isArray(exactMatch.activeIngredient)) {
        activeIngredientsList.push(...exactMatch.activeIngredient);
      } else {
        activeIngredientsList.push(exactMatch.activeIngredient);
      }

      totalAmount += exactMatch.price;
    } else {
      // 2. البحث عن بديل له نفس المادة الفعالة
      const alternativeDrug = await Drug.findOne({
        activeIngredient: { $regex: med.activeIngredient, $options: "i" },
        stockQuantity: { $gt: 0 },
      });

      if (alternativeDrug) {
        requiresPharmacistReview = true;

        const ingredients = Array.isArray(alternativeDrug.activeIngredient)
          ? alternativeDrug.activeIngredient.join(" / ")
          : alternativeDrug.activeIngredient;

        processedItems.push({
          drugId: alternativeDrug._id,
          drugName: alternativeDrug.tradeName,
          activeIngredient: ingredients,
          dosage: med.dosage,
          quantity: 1,
          price: alternativeDrug.price,
          inStock: true,
          availabilityStatus: "ALTERNATIVE_AVAILABLE", // 2- متوفر بديل لنفس المادة الفعالة
          isAlternative: true,
          suggestedAlternativeFor: med.drugName,
          reviewStatus: "PENDING_REVIEW",
        });

        if (Array.isArray(alternativeDrug.activeIngredient)) {
          activeIngredientsList.push(...alternativeDrug.activeIngredient);
        } else {
          activeIngredientsList.push(alternativeDrug.activeIngredient);
        }

        totalAmount += alternativeDrug.price;
      } else {
        // 3. غير متوفر وملهوش بديل في المخزن
        requiresPharmacistReview = true;
        processedItems.push({
          drugName: med.drugName,
          activeIngredient: med.activeIngredient,
          dosage: med.dosage,
          quantity: 1,
          price: 0,
          inStock: false,
          availabilityStatus: "OUT_OF_STOCK", // 3- غير متوفر وملهوش بديل
          isAlternative: false,
          reviewStatus: "PENDING_REVIEW",
        });
      }
    }
  }

  const normalizedIngredients = activeIngredientsList.map((i) =>
    i.toString().toLowerCase(),
  );

  const interactions = await Interaction.find({
    ingredientA: { $in: normalizedIngredients },
    ingredientB: { $in: normalizedIngredients },
  });

  const prescriptionStatus = requiresPharmacistReview
    ? "PENDING_PHARMACIST_REVIEW"
    : "READY_FOR_CART";

  const prescription = await Prescription.create({
    userId: req.user ? req.user._id : undefined,
    patientName: patientName || "مريض",
    patientInfo: { phone, email, address },
    originalImage: { data: imageBase64, mimeType: mimeType },
    pharmacistId, // تخزين الصيدلي المستهدف
    items: processedItems,
    warningsFound: interactions.map((i) => ({
      severity: i.severity,
      message: `${i.ingredientA} + ${i.ingredientB}: ${i.description}`,
    })),
    totalAmount,
    status: prescriptionStatus,
  });

  // إرسال تنبيه فوري عبر Socket.IO للصيدلي المحدد
  notifyPharmacistNewPrescription(pharmacistId, prescription);

  res.status(201).json({
    success: true,
    status: prescriptionStatus,
    requiresPharmacistReview,
    prescription,
  });
});

// recieve the pharamcist id and search in database for the prescription that have ...
// the same pharmacist id that i have been recieved and its status is PENDING_PHARMACIST_REVIEW ...
// then return this prescription
export const getPharmacistPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    pharmacistId: req.user._id,
    status: "PENDING_PHARMACIST_REVIEW",
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: prescriptions.length,
    prescriptions,
  });
});

// recieve the updated items & prescriptions after pharmacis revision ...
// Ensure that the correct pharmacist is the one who updated the prescription. ...
// then update the status of prescription items with new state "APPROVED" .
export const approveByPharmacist = asyncHandler(async (req, res) => {
  const { updatedItems } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  // التأكد أن الصيدلي صاحب الطلب هو من يعتمد الروشتة
  if (prescription.pharmacistId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("غير مصرح لك بتعديل هذه الروشتة، فهي موجهة لصيدلي آخر");
  }

  if (updatedItems && Array.isArray(updatedItems)) {
    prescription.items = updatedItems.map((item) => ({
      ...item,
      reviewStatus: "APPROVED",
    }));
  } else {
    prescription.items.forEach((item) => {
      item.reviewStatus = "APPROVED";
    });
  }

  // إعادة حساب الإجمالي بناءً على الأدوية المتوفرة والمعتمدة فقط
  prescription.totalAmount = prescription.items.reduce(
    (sum, item) =>
      sum + (item.inStock ? Number(item.price) * Number(item.quantity) : 0),
    0,
  );

  prescription.status = "READY_FOR_CART";
  await prescription.save();

  // إشعار المريض فورياً بتحديث حالة الروشتة لتصبح READY_FOR_CART
  notifyPatientPrescriptionStatus(prescription.userId, prescription);

  res.json({
    success: true,
    message: "تم تعديل واعتمد الروشتة بنجاح وأُرسلت للمريض",
    prescription,
  });
});

// receive the current prescription id ,then search for it by its id ...
// then return it to follow up on her cases first-hand .
export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate(
    "pharmacistId",
    "name email",
  );

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  res.json({
    success: true,
    prescription,
  });
});

// we do not recieve any id from frontend, but we receive it from middleware ...
// it extract the id from the user token by JWT ...
// then return the prescriptions that userId === reveived id
export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    userId: req.user._id,
    status: {
      $in: [
        "ORDER_PENDING",
        "ORDER_PROCESSING",
        "ORDER_COMPLETED",
        "CANCELLED",
        "READY_FOR_CART",
      ],
    },
  })
    .populate("pharmacistId", "name email")
    .sort({ updatedAt: -1, createdAt: -1 });

  // تصفية الروشتات: إذا كانت الروشتة READY_FOR_CART ولكن لا تحتوي على أي أدوية يمكن شراؤها
  // (إما لعدم توفرها في المخزن نهائياً، أو لرفض المريض للبدائل)، فلا نعرضها في السجل.
  const validPrescriptions = prescriptions.filter((prescription) => {
    if (prescription.status === "READY_FOR_CART") {
      const hasPurchasableItems = prescription.items.some(
        (item) =>
          item.inStock &&
          item.availabilityStatus !== "OUT_OF_STOCK" &&
          (!item.isAlternative || item.patientDecision !== "REJECTED"),
      );
      if (!hasPurchasableItems) {
        return false;
      }
    }
    return true;
  });

  res.status(200).json({
    success: true,
    prescriptions: validPrescriptions,
  });
});

// receive the updated items and prescription id ...
// make sure that tha updated items belong to the prescription ...
// then update the prescription items with updated items that we have been recieved .
export const updatePatientDecisions = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  if (Array.isArray(items)) {
    prescription.items = prescription.items.map((existingItem) => {
      const updated = items.find(
        (i) =>
          i._id?.toString() === existingItem._id?.toString() ||
          i.drugName === existingItem.drugName,
      );
      if (updated && updated.patientDecision) {
        existingItem.patientDecision = updated.patientDecision;
      }
      return existingItem;
    });

    prescription.totalAmount = prescription.items.reduce((sum, item) => {
      const isIncluded =
        item.inStock &&
        (!item.isAlternative || item.patientDecision === "ACCEPTED");
      return (
        sum + (isIncluded ? Number(item.price) * Number(item.quantity) : 0)
      );
    }, 0);

    await prescription.save();
  }

  res.json({
    success: true,
    message: "تم حفظ قرارات المريض وتحديث الإجمالي بنجاح",
    prescription,
  });
});

// after middleware functions , we will receive the delivery id ...
// return all orders in all cases .
export const getDeliveryPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    deliveryId: req.user._id,
    status: {
      $in: [
        "ORDER_PENDING",
        "ORDER_PROCESSING",
        "ORDER_COMPLETED",
        "CANCELLED",
      ],
    },
  })
    .populate("pharmacistId", "name email")
    .populate("userId", "name email")
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    count: prescriptions.length,
    prescriptions,
  });
});

// receive the updated prescription status and prescription id from delivery ...
// Ensure that the correct delivery is the one who updated the prescription ...
// then update the prescription with the updated status .
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  if (prescription.deliveryId?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error(
      "غير مصرح لك بتحديث حالة هذه الروشتة، فهي مسندة لمندوب توصيل آخر",
    );
  }

  if (!["ORDER_PROCESSING", "ORDER_COMPLETED", "CANCELLED"].includes(status)) {
    res.status(400);
    throw new Error("حالة غير صالحة للطلب");
  }

  prescription.status = status;
  if (status === "CANCELLED" && cancelReason) {
    prescription.cancellationReason = cancelReason;
  }
  await prescription.save();

  // إرسال تنبيهات لحظية فور تحديث المندوب لحالة الطلب ######################
  notifyPatientPrescriptionStatus(prescription.userId, prescription);
  if (prescription.deliveryId) {
    notifyDeliveryNewOrder(prescription.deliveryId, prescription);
  }

  res.json({
    success: true,
    message: "تم تحديث حالة الطلب بنجاح",
    prescription,
  });
});

// receive the patient data and the drug items that has new status  "patientDecision" ...
// extract the prescription by its id in params and find it ...
// update the prescription with the latest version of drugitems with new "patientDecision" ...
// update the patien data ...
// make sure that we have enough quantity of drugs ...
// open a transaction so, The processes of verifying stock quantity and updating the prescription must be carried out together ...
// if either fails, the entire operation stops ...
import mongoose from "mongoose";
export const checkoutPrescription = asyncHandler(async (req, res) => {
  const { patientName, phone, address, paymentMethod, deliveryId, items } =
    req.body;

  const session = await mongoose.startSession();

  try {
    let prescription;

    await session.withTransaction(async () => {
      // 1. جلب الروشتة داخل الـ Transaction
      prescription = await Prescription.findById(req.params.id).session(
        session,
      );

      if (!prescription) {
        res.status(404);
        throw new Error("الروشتة غير موجودة");
      }

      // 2. ربط الروشتة بالمستخدم الحالي
      prescription.userId = req.user._id;

      // 3. التأكد أن الروشتة جاهزة للطلب
      if (prescription.status !== "READY_FOR_CART") {
        res.status(400);
        throw new Error(
          "هذه الروشتة غير جاهزة للطلب حالياً أو تم طلبها بالفعل",
        );
      }

      // 4. تحديث قرارات المريض
      if (Array.isArray(items)) {
        prescription.items = prescription.items.map((existingItem) => {
          const updated = items.find(
            (item) => item._id?.toString() === existingItem._id?.toString(),
          );

          if (updated && updated.patientDecision) {
            existingItem.patientDecision = updated.patientDecision;
          }

          return existingItem;
        });
      }

      // 5. تحديث بيانات العميل
      if (patientName) {
        prescription.patientName = patientName;
      }

      if (phone) {
        prescription.patientInfo.phone = phone;
      }

      if (address) {
        prescription.patientInfo.address = address;
      }

      if (deliveryId) {
        prescription.deliveryId = deliveryId;
      }

      const selectedPaymentMethod = paymentMethod || "CASH_ON_DELIVERY";

      if (selectedPaymentMethod === "CARD") {
        return res.status(400).json({
          success: false,
          message:
            "للدفع بالبطاقة الائتمانية، يرجى استخدام مسار Stripe المخصص (createStripeCheckoutSession).",
        });
      }

      prescription.paymentMethod = "CASH_ON_DELIVERY";

      // 6. إعادة حساب الإجمالي من بيانات الـ Database
      prescription.totalAmount = prescription.items.reduce((sum, item) => {
        const isIncluded =
          item.inStock &&
          (!item.isAlternative || item.patientDecision === "ACCEPTED");

        return (
          sum + (isIncluded ? Number(item.price) * Number(item.quantity) : 0)
        );
      }, 0);

      // 7. خصم الـ Stock بشكل Atomic وآمن
      for (const item of prescription.items) {
        const isIncluded =
          item.drugId &&
          item.inStock &&
          (!item.isAlternative || item.patientDecision === "ACCEPTED");

        if (!isIncluded) {
          continue;
        }

        const updatedDrug = await Drug.findOneAndUpdate(
          {
            _id: item.drugId,
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
            },
          },
          {
            new: true,
            session,
          },
        );

        // الكمية لم تعد متوفرة
        if (!updatedDrug) {
          res.status(409);
          throw new Error(
            `الدواء "${item.drugName}" لم تعد الكمية المطلوبة منه متوفرة`,
          );
        }
      }

      // 8. تحويل حالة الروشتة إلى Order Pending
      prescription.status = "ORDER_PENDING";
      prescription.orderedAt = new Date();

      // 9. حفظ الـ Prescription داخل نفس الـ Transaction
      await prescription.save({ session });
    });

    // 10. Notifications بعد نجاح الـ Transaction فقط
    notifyPatientPrescriptionStatus(prescription.userId, prescription);

    if (prescription.deliveryId) {
      notifyDeliveryNewOrder(prescription.deliveryId, prescription);
    }

    // 11. Response
    res.json({
      success: true,
      message: "تم إرسال الطلب بنجاح وهو قيد التجهيز",
      prescription,
    });
  } finally {
    await session.endSession();
  }
});

// 1. حساب أسعار وكميات الأدوية المقبولة في الروشتة وتجهيزها كـ Line Items لبوابة Stripe.
// 2. إنشاء رابط جلسة الدفع وتوجيه العميل إليها للدفع بالبطاقة الائتمانية.
// 3. دعم المحاكاة (Simulation Mode) تلقائياً في حالة عدم وجود مفاتيح Stripe بعد.
export const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const { patientName, phone, address, deliveryId, items } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  if (prescription.status !== "READY_FOR_CART") {
    res.status(400);
    throw new Error("هذه الروشتة غير جاهزة للطلب حالياً");
  }

  // تحديث قرارات المريض فقط
  if (Array.isArray(items)) {
    prescription.items = prescription.items.map((existingItem) => {
      const updated = items.find(
        (item) => item._id?.toString() === existingItem._id?.toString(),
      );

      if (updated && updated.patientDecision) {
        existingItem.patientDecision = updated.patientDecision;
      }

      return existingItem;
    });
  }

  // ربط الطلب بالمستخدم والبيانات
  prescription.userId = req.user._id;

  if (patientName) {
    prescription.patientName = patientName;
  }

  if (phone) {
    prescription.patientInfo.phone = phone;
  }

  if (address) {
    prescription.patientInfo.address = address;
  }

  if (deliveryId) {
    prescription.deliveryId = deliveryId;
  }

  prescription.paymentMethod = "CARD";

  // الأدوية التي سيدفع ثمنها المستخدم
  const includedItems = prescription.items.filter(
    (item) =>
      item.inStock &&
      (!item.isAlternative || item.patientDecision === "ACCEPTED"),
  );

  if (includedItems.length === 0) {
    res.status(400);
    throw new Error("لا توجد أدوية مؤكدة للشراء في هذه الروشتة");
  }

  // حساب السعر من بيانات السيرفر
  prescription.totalAmount = includedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  // نحفظ بيانات الطلب قبل إنشاء جلسة Stripe
  await prescription.save();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Stripe لازم يكون متوفر
  if (!stripeKey || stripeKey.includes("PLACEHOLDER")) {
    res.status(500);
    throw new Error(
      "Stripe غير مُهيأ بشكل صحيح. يرجى التحقق من STRIPE_SECRET_KEY",
    );
  }

  const stripe = new Stripe(stripeKey);

  // تجهيز المنتجات التي ستظهر في Stripe
  const line_items = includedItems.map((item) => ({
    price_data: {
      currency: "egp",

      product_data: {
        name: item.drugName,

        description: item.isAlternative
          ? `بديل معتمد لـ (${item.suggestedAlternativeFor || "دواء أصلي"})`
          : "دواء أصلي بالروشتة",
      },

      // Stripe يتعامل مع أصغر وحدة للعملة
      // 100 جنيه = 10000 قرش
      unit_amount: Math.round(Number(item.price) * 100),
    },

    quantity: Number(item.quantity) || 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    line_items,

    mode: "payment",

    customer_email: req.user.email,

    // ربط Session بالروشتة
    client_reference_id: prescription._id.toString(),

    metadata: {
      prescriptionId: prescription._id.toString(),
      userId: req.user._id.toString(),
      deliveryId: deliveryId || "",
    },

    success_url:
      `${frontendUrl}/checkout/success/${prescription._id}` +
      `?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url:
      `${frontendUrl}/checkout/${prescription._id}` + `?payment_cancelled=true`,
  });

  res.json({
    success: true,
    sessionId: session.id,
    url: session.url,
  });
});

// 1. التحقق من حالة الدفع من خوادم Stripe والتأكد من نجاح الدفع (paid).
// 2. تحديث حالة الروشتة إلى ORDER_PENDING وخصم كميات الأدوية من المخزون.
// 3. إرسال تنبيهات فورية عبر Socket.IO للمريض ومندوب التوصيل بنجاح العملية.

export const verifyStripePayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400);
    throw new Error("Stripe Session ID مطلوب");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey || stripeKey.includes("PLACEHOLDER")) {
    res.status(500);
    throw new Error(
      "Stripe غير مُهيأ بشكل صحيح. يرجى التحقق من STRIPE_SECRET_KEY",
    );
  }

  const stripe = new Stripe(stripeKey);

  // جلب Prescription
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("الروشتة غير موجودة");
  }

  // لو الطلب اتأكد قبل كده
  if (
    prescription.status === "ORDER_PENDING" ||
    prescription.status === "ORDER_PROCESSING" ||
    prescription.status === "ORDER_COMPLETED"
  ) {
    return res.json({
      success: true,
      message: "الطلب مؤكد بالفعل",
      prescription,
    });
  }

  // جلب Session الحقيقية من Stripe
  let stripeSession;

  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("فشل في استرداد جلسة Stripe:", error);

    res.status(400);
    throw new Error("تعذر التحقق من جلسة الدفع عبر Stripe");
  }

  // التأكد أن Session تخص نفس Prescription
  if (stripeSession.client_reference_id !== prescription._id.toString()) {
    res.status(400);
    throw new Error("جلسة الدفع لا تخص هذه الروشتة");
  }

  // التأكد أن Session تخص نفس المستخدم
  if (
    stripeSession.metadata?.userId &&
    stripeSession.metadata.userId !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("جلسة الدفع لا تخص هذا المستخدم");
  }

  // التأكد أن Stripe أكد الدفع فعلاً
  if (stripeSession.payment_status !== "paid") {
    res.status(400);
    throw new Error("عملية الدفع لم تكتمل بعد");
  }

  const session = await mongoose.startSession();

  try {
    let updatedPrescription;

    await session.withTransaction(async () => {
      // نجيب آخر نسخة من Prescription داخل الـ transaction
      updatedPrescription = await Prescription.findById(req.params.id).session(
        session,
      );

      if (!updatedPrescription) {
        res.status(404);
        throw new Error("الروشتة غير موجودة");
      }

      // حماية من تكرار الخصم
      if (
        updatedPrescription.status === "ORDER_PENDING" ||
        updatedPrescription.status === "ORDER_PROCESSING" ||
        updatedPrescription.status === "ORDER_COMPLETED"
      ) {
        return;
      }

      // خصم المخزون للأدوية المشمولة فقط
      for (const item of updatedPrescription.items) {
        const isIncluded =
          item.drugId &&
          item.inStock &&
          (!item.isAlternative || item.patientDecision === "ACCEPTED");

        if (!isIncluded) {
          continue;
        }

        const updatedDrug = await Drug.findOneAndUpdate(
          {
            _id: item.drugId,

            // لازم الكمية تكون متوفرة
            stockQuantity: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
            },
          },
          {
            new: true,
            session,
          },
        );

        // الدواء لم يعد متوفراً بالكمية المطلوبة
        if (!updatedDrug) {
          res.status(409);

          throw new Error(
            `الدواء "${item.drugName}" لم تعد الكمية المطلوبة منه متوفرة`,
          );
        }
      }

      // تأكيد الطلب بعد نجاح خصم كل الأدوية
      updatedPrescription.paymentMethod = "CARD";

      updatedPrescription.status = "ORDER_PENDING";

      updatedPrescription.orderedAt = new Date();

      await updatedPrescription.save({
        session,
      });
    });

    // الإشعارات بعد نجاح الـ transaction فقط
    notifyPatientPrescriptionStatus(
      updatedPrescription.userId,
      updatedPrescription,
    );

    if (updatedPrescription.deliveryId) {
      notifyDeliveryNewOrder(
        updatedPrescription.deliveryId,
        updatedPrescription,
      );
    }

    res.json({
      success: true,
      message: "تم تأكيد الدفع وإرسال الطلب بنجاح",
      prescription: updatedPrescription,
    });
  } finally {
    await session.endSession();
  }
});
