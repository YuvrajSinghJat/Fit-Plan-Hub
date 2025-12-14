import mongoose from 'mongoose';
import { PLAN_CATEGORIES, DIFFICULTY_LEVELS } from '../config/constants.js';

const planSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a plan title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Please provide a plan description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  fullDescription: {
    type: String,
    required: [true, 'Please provide full plan details'],
    maxlength: [5000, 'Full description cannot exceed 5000 characters']
  },
  
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  
  duration: {
    type: Number,
    required: [true, 'Please provide plan duration'],
    min: [1, 'Duration must be at least 1 day']
  },
  
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: Object.values(PLAN_CATEGORIES)
  },
  
  difficulty: {
    type: String,
    required: [true, 'Please select difficulty level'],
    enum: Object.values(DIFFICULTY_LEVELS)
  },
  
  weeklyWorkouts: {
    type: Number,
    required: [true, 'Please specify weekly workouts'],
    min: [1, 'At least 1 workout per week'],
    max: [7, 'Maximum 7 workouts per week']
  },
  
  dailyTime: {
    type: String,
    required: [true, 'Please specify daily workout time'],
    enum: ['15-30 mins', '30-45 mins', '45-60 mins', '60-90 mins', '90+ mins']
  },
  
  equipmentRequired: [{
    type: String,
    enum: ['none', 'dumbbells', 'barbell', 'kettlebell', 'resistance-bands', 'yoga-mat']
  }],
  
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/400x250'
  },
  
  subscribersCount: {
    type: Number,
    default: 0
  },
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  isPublished: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  tags: [String],
  
  workouts: [{
    day: Number,
    title: String,
    description: String,
    exercises: [{
      name: String,
      sets: Number,
      reps: String,
      rest: String,
      notes: String
    }]
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

planSchema.virtual('trainerDetails', {
  ref: 'User',
  localField: 'trainer',
  foreignField: '_id',
  justOne: true,
  select: 'name email profileImage rating followersCount certification'
});

planSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'plan'
});

planSchema.virtual('totalRevenue').get(function() {
  return this.price * this.subscribersCount;
});

planSchema.index({ trainer: 1, createdAt: -1 });
planSchema.index({ category: 1, difficulty: 1 });
planSchema.index({ price: 1 });
planSchema.index({ subscribersCount: -1 });
planSchema.index({ averageRating: -1 });
planSchema.index({ isFeatured: 1 });
planSchema.index({ tags: 1 });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;