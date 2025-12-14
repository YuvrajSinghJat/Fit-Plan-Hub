import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../config/constants.js';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  status: {
    type: String,
    enum: Object.values(SUBSCRIPTION_STATUS),
    default: SUBSCRIPTION_STATUS.ACTIVE
  },
  
  currentDay: {
    type: Number,
    default: 1,
    min: 1
  },
  
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  completedWorkouts: [{
    day: Number,
    completedAt: Date,
    duration: Number,
    notes: String
  }],
  
  lastActive: {
    type: Date,
    default: Date.now
  },
  
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

subscriptionSchema.index({ user: 1, plan: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: SUBSCRIPTION_STATUS.ACTIVE }
});

subscriptionSchema.virtual('planDetails', {
  ref: 'Plan',
  localField: 'plan',
  foreignField: '_id',
  justOne: true
});

subscriptionSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

subscriptionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Plan = mongoose.model('Plan');
      const plan = await Plan.findById(this.plan);
      
      if (plan) {
        const endDate = new Date(this.startDate);
        endDate.setDate(endDate.getDate() + plan.duration);
        this.endDate = endDate;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

subscriptionSchema.methods.updateProgress = async function() {
  const Plan = mongoose.model('Plan');
  const plan = await Plan.findById(this.plan);
  
  if (plan) {
    this.progressPercentage = Math.min(100, Math.round((this.currentDay / plan.duration) * 100));
    await this.save();
  }
  return this;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;