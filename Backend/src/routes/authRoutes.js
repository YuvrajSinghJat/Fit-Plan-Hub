import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import {
  validate,
  registerValidation,
  loginValidation,
  updateUserValidation
} from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', validate(updateUserValidation), updateProfile);
router.put('/change-password', changePassword);

export default router;