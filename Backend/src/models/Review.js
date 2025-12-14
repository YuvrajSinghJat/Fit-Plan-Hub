import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  
  isApproved: {
    type: Boolean,
    default: true
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

reviewSchema.index({ user: 1, plan: 1 }, { unique: true });

reviewSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'name profileImage'
});

reviewSchema.post('save', async function() {
  try {
    const Review = mongoose.model('Review');
    const Plan = mongoose.model('Plan');
    
    const reviews = await Review.find({ 
      plan: this.plan, 
      isApproved: true 
    });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Plan.findByIdAndUpdate(this.plan, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating plan rating:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;