import express from 'express';
import {
  getUserById,
  getTrainers,
  followTrainer,
  unfollowTrainer,
  getFollowing,
  getFollowers,
  updateUserProfile
} from '../controllers/userController.js';
import { validate, queryValidation, updateUserValidation } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/trainers', validate(queryValidation), getTrainers);
router.get('/:id', getUserById);

router.use(authenticate);

router.put('/:id', validate(updateUserValidation), updateUserProfile);

router.post('/follow/:trainerId', followTrainer);
router.delete('/unfollow/:trainerId', unfollowTrainer);
router.get('/profile/following', getFollowing);
router.get('/profile/followers', getFollowers);

router.get('/', authorize('admin'), (req, res) => {
  res.json({ message: 'Admin route - get all users' });
});

export default router;