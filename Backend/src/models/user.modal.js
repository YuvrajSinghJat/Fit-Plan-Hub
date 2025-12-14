import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  
  password: {
    type: String,
    required: true,
  },
  
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin'],
    default: 'user'
  },
  
  fitnessGoals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'general-fitness']
  }],
  
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  totalSubscribers: {
    type: Number,
    default: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
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

userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();
  
  try {

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.__v;
  
  return userObject;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ totalSubscribers: -1 });

const User = mongoose.model('User', userSchema);

export default User;