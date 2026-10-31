import express from 'express';
import {
  saveSnapshot,
  getSnapshot,
  deleteSnapshot,
} from '../controllers/snapshotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(saveSnapshot)
  .get(getSnapshot)
  .delete(deleteSnapshot);

export default router;
