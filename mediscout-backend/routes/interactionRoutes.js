import express from 'express';
import { checkInteractions } from '../controllers/interactionController.js';

const router = express.Router();

router.post('/check', checkInteractions);

export default router;