import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER
  },
  
  // Common fields
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
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
  
  height: Number,
  weight: Number,
  
  certification: String,
  yearsOfExperience: Number,
  specialization: [String],
  education: String,
  
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
  
  followersCount: {
    type: Number,
    default: 0
  },
  
  followingCount: {
    type: Number,
    default: 0
  },
  
  totalSubscribers: {
    type: Number,
    default: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  totalPlans: {
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
  
  // Preferences
  emailNotifications: {
    type: Boolean,
    default: true
  },
  
  pushNotifications: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
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
  delete userObject.createdAt;
  delete userObject.updatedAt;
  
  return userObject;
};

userSchema.methods.getTrainerProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.__v;
  delete userObject.emailNotifications;
  delete userObject.pushNotifications;
  delete userObject.fitnessGoals;
  delete userObject.experienceLevel;
  delete userObject.height;
  delete userObject.weight;
  
  return userObject;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ followersCount: -1 });

const User = mongoose.model('User', userSchema);

export default User;