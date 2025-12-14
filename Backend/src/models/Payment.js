import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema({
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
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: Object.values(PAYMENT_METHODS),
    default: PAYMENT_METHODS.SIMULATED
  },
  
  status: {
    type: String,
    required: true,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'simulated'],
    default: 'simulated'
  },
  
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  failureReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

paymentSchema.post('save', async function() {
  if (this.status === PAYMENT_STATUS.COMPLETED) {
    try {
      const Plan = mongoose.model('Plan');
      const User = mongoose.model('User');
      
      const plan = await Plan.findById(this.plan).populate('trainer');
      
      if (plan && plan.trainer) {
        
        await User.findByIdAndUpdate(plan.trainer._id, {
          $inc: { 
            totalRevenue: this.amount,
            totalSubscribers: 1
          }
        });
        
        await Plan.findByIdAndUpdate(this.plan, {
          $inc: { subscribersCount: 1 }
        });
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
    }
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;