import express from 'express';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getTrainerPlans
} from '../controllers/planController.js';
import {
  validate,
  planValidation,
  queryValidation
} from '../middlewares/validation.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', optionalAuth, validate(queryValidation), getPlans);
router.get('/:id', optionalAuth, getPlanById);
router.get('/trainer/:trainerId', getTrainerPlans);

router.use(authenticate);

router.post('/', authorize('trainer'), validate(planValidation), createPlan);
router.put('/:id', authorize('trainer'), validate(planValidation), updatePlan);
router.delete('/:id', authorize('trainer'), deletePlan);

export default router;