import dotenv from 'dotenv';
dotenv.config(); // قراءة البيئة أولاً

import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

// Imports للـ Routes
import drugRoutes from './routes/drugRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

connectDB();

const app = express();
const server = http.createServer(app);

// تهيئة Socket.IO عبر الـ HTTP Server
initSocket(server);

// تفعيل CORS والـ Body Parser
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// الـ Routes
app.use('/api/drugs', drugRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`📡 Server running on port ${PORT}`));