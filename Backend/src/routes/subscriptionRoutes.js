import express from 'express';
import {
  subscribeToPlan,
  unsubscribeFromPlan,
  getMySubscriptions,
  getSubscriptionById,
  updateSubscriptionProgress,
  getTrainerSubscriptions
} from '../controllers/subscriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/subscribe/:planId', subscribeToPlan);
router.get('/my-subscriptions', getMySubscriptions);
router.get('/:subscriptionId', getSubscriptionById);
router.put('/:subscriptionId/progress', updateSubscriptionProgress);
router.delete('/unsubscribe/:subscriptionId', unsubscribeFromPlan);

router.get('/trainer/subscriptions', authorize('trainer'), getTrainerSubscriptions);

export default router;