import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  notificationsEnabled: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.virtual('followerDetails', {
  ref: 'User',
  localField: 'follower',
  foreignField: '_id',
  justOne: true,
  select: 'name profileImage'
});

followSchema.virtual('followingDetails', {
  ref: 'User',
  localField: 'following',
  foreignField: '_id',
  justOne: true,
  select: 'name profileImage rating followersCount'
});

followSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    
    await User.findByIdAndUpdate(this.following, {
      $inc: { followersCount: 1 }
    });
    
    await User.findByIdAndUpdate(this.follower, {
      $inc: { followingCount: 1 }
    });
  } catch (error) {
    console.error('Error updating follower counts:', error);
  }
});

followSchema.post('remove', async function() {
  try {
    const User = mongoose.model('User');
    
    await User.findByIdAndUpdate(this.following, {
      $inc: { followersCount: -1 }
    });
    
    await User.findByIdAndUpdate(this.follower, {
      $inc: { followingCount: -1 }
    });
  } catch (error) {
    console.error('Error updating follower counts on remove:', error);
  }
});

const Follow = mongoose.model('Follow', followSchema);

export default Follow;