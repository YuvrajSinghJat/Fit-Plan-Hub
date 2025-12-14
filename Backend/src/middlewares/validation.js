import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return next(ApiError.badRequest('Validation failed', extractedErrors));
  };
};

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['user', 'trainer']).withMessage('Role must be either user or trainer')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  body('role')
    .optional()
    .isIn(['user', 'trainer']).withMessage('Invalid role')
];

export const planValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('fullDescription')
    .trim()
    .notEmpty().withMessage('Full description is required')
    .isLength({ max: 5000 }).withMessage('Full description cannot exceed 5000 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['weight-loss', 'muscle-building', 'cardio', 'flexibility', 'yoga', 'hiit', 'strength', 'general-fitness'])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['beginner', 'intermediate', 'advanced', 'all-levels'])
    .withMessage('Invalid difficulty level'),
  
  body('weeklyWorkouts')
    .notEmpty().withMessage('Weekly workouts is required')
    .isInt({ min: 1, max: 7 }).withMessage('Weekly workouts must be between 1 and 7'),
  
  body('dailyTime')
    .notEmpty().withMessage('Daily time is required')
    .isIn(['15-30 mins', '30-45 mins', '45-60 mins', '60-90 mins', '90+ mins'])
    .withMessage('Invalid daily time')
];

export const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
];

export const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  
  body('profileImage')
    .optional()
    .isURL().withMessage('Profile image must be a valid URL'),
  
  body('fitnessGoals')
    .optional()
    .isArray().withMessage('Fitness goals must be an array'),
  
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid experience level'),
  
  body('certification')
    .optional()
    .trim(),
  
  body('specialization')
    .optional()
    .isArray().withMessage('Specialization must be an array')
];

export const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(['weight-loss', 'muscle-building', 'cardio', 'flexibility', 'yoga', 'hiit', 'strength', 'general-fitness', 'all'])
    .withMessage('Invalid category'),
  
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all-levels'])
    .withMessage('Invalid difficulty level'),
  
  query('sort')
    .optional()
    .isIn(['price', 'rating', 'subscribers', 'createdAt', 'popularity'])
    .withMessage('Invalid sort option'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be either asc or desc')
];
