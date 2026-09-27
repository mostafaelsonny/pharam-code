import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Drug } from './models/drugModel.js';
import { Interaction } from './models/interactionModel.js';
import { connectDB } from './config/db.js';

dotenv.config();

const sampleDrugs = [
  {
    tradeName: 'Augmentin 1g',
    activeIngredient: 'amoxicillin',
    category: 'Antibiotic',
    price: 90,
    stockQuantity: 50,
    dosageForm: 'Tablets',
  },
  {
    tradeName: 'Cataflam 50mg',
    activeIngredient: 'diclofenac',
    category: 'Analgesic',
    price: 45,
    stockQuantity: 100,
    dosageForm: 'Tablets',
  },
  {
    tradeName: 'Marevan 5mg',
    activeIngredient: 'warfarin',
    category: 'Anticoagulant',
    price: 30,
    stockQuantity: 20,
    dosageForm: 'Tablets',
  },
  {
    tradeName: 'Panadol Extra',
    activeIngredient: 'paracetamol',
    category: 'Analgesic',
    price: 35,
    stockQuantity: 150,
    dosageForm: 'Tablets',
  },
];

const sampleInteractions = [
  {
    ingredientA: 'warfarin',
    ingredientB: 'diclofenac',
    severity: 'CRITICAL',
    description: 'Co-administration increases the risk of severe gastrointestinal bleeding.',
    recommendation: 'Avoid combination. Use alternative analgesic like Paracetamol.',
  },
  {
    ingredientA: 'amoxicillin',
    ingredientB: 'allopurinol',
    severity: 'MODERATE',
    description: 'Increased incidence of skin rashes.',
    recommendation: 'Monitor patient closely for dermatological reactions.',
  },
];

const importData = async () => {
  try {
    // 1. انتظار التوصيل بالداتابيز أولاً
    await connectDB();

    // 2. تنظيف البيانات القديمة
    await Drug.deleteMany();
    await Interaction.deleteMany();

    // 3. إدخال البيانات الجديدة
    await Drug.insertMany(sampleDrugs);
    await Interaction.insertMany(sampleInteractions);

    console.log('✅ Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();