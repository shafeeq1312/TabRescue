import express from 'express';
import {
  createSession,
  getSessions,
  searchSessions,
  getSessionById,
  updateSession,
  deleteSession,
  restoreSession,
  bulkDeleteSessions,
  getStatsSummary,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All session routes require authentication
router.use(protect);

router.get('/stats/summary', getStatsSummary);
router.get('/search', searchSessions);
router.post('/bulk-delete', bulkDeleteSessions);

router.route('/')
  .post(apiLimiter, createSession)
  .get(getSessions);

router.route('/:id')
  .get(getSessionById)
  .put(updateSession)
  .delete(deleteSession);

router.post('/:id/restore', restoreSession);

export default router;
