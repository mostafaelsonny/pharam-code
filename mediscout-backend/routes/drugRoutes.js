import express from 'express';
import {
  getDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
} from '../controllers/drugController.js';

const router = express.Router();

router.route('/').get(getDrugs).post(createDrug);
router.route('/:id').put(updateDrug).delete(deleteDrug);

export default router;