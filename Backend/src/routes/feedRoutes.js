import express from 'express';
import {
  getUserFeed,
  getDashboardStats,
  getRecommendedPlans
} from '../controllers/feedController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getUserFeed);
router.get('/dashboard-stats', getDashboardStats);
router.get('/recommended', getRecommendedPlans);

export default router;