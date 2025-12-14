import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Plan from '../models/Plan.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { paginate } from '../utils/helpers.js';

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -__v');
    
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    let isFollowing = false;
    if (req.user && req.user._id.toString() !== id) {
      const follow = await Follow.findOne({
        follower: req.user._id,
        following: id
      });
      isFollowing = !!follow;
    }

    let plans = [];
    if (user.role === 'trainer') {
      plans = await Plan.find({
        trainer: id,
        isPublished: true
      })
      .select('title description price duration category difficulty subscribersCount averageRating coverImage')
      .limit(6);
    }

    const userResponse = {
      ...user.toObject(),
      isFollowing,
      plans
    };

    res.status(200).json(
      ApiResponse.success({
        user: userResponse
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getTrainers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      specialization,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    const query = { 
      role: 'trainer',
      isActive: true 
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { certification: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }
    const { skip, limit: queryLimit } = paginate(page, limit);

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortMap = {
      'rating': 'rating',
      'followers': 'followersCount',
      'subscribers': 'totalSubscribers',
      'experience': 'yearsOfExperience',
      'newest': 'createdAt'
    };
    
    const sortField = sortMap[sort] || 'rating';

    const trainers = await User.find(query)
      .select('name profileImage bio certification specialization rating followersCount totalSubscribers yearsOfExperience')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(queryLimit);

    let trainersWithFollowStatus = trainers;
    if (req.user) {
      const followedTrainerIds = await Follow.find({
        follower: req.user._id
      }).distinct('following');

      trainersWithFollowStatus = trainers.map(trainer => ({
        ...trainer.toObject(),
        isFollowing: followedTrainerIds.includes(trainer._id.toString())
      }));
    }

    const total = await User.countDocuments(query);

    res.status(200).json(
      ApiResponse.success({
        trainers: trainersWithFollowStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const followTrainer = async (req, res, next) => {
  try {
    const { trainerId } = req.params;

    const trainer = await User.findOne({
      _id: trainerId,
      role: 'trainer',
      isActive: true
    });
    
    if (!trainer) {
      return next(ApiError.notFound('Trainer not found'));
    }

    if (trainerId === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot follow yourself'));
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: trainerId
    });
    
    if (existingFollow) {
      return next(ApiError.conflict('You are already following this trainer'));
    }

    const follow = await Follow.create({
      follower: req.user._id,
      following: trainerId
    });

    res.status(201).json(
      ApiResponse.created({
        follow
      }, `You are now following ${trainer.name}`)
    );
  } catch (error) {
    next(error);
  }
};

export const unfollowTrainer = async (req, res, next) => {
  try {
    const { trainerId } = req.params;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: trainerId
    });

    if (!follow) {
      return next(ApiError.notFound('You are not following this trainer'));
    }

    res.status(200).json(
      ApiResponse.success(null, 'Unfollowed trainer successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: queryLimit } = paginate(page, limit);

    const follows = await Follow.find({ follower: req.user._id })
      .populate({
        path: 'following',
        select: 'name profileImage bio certification rating followersCount'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const trainers = follows.map(follow => follow.following);

    const total = await Follow.countDocuments({ follower: req.user._id });

    res.status(200).json(
      ApiResponse.success({
        trainers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: queryLimit } = paginate(page, limit);

    const follows = await Follow.find({ following: req.user._id })
      .populate({
        path: 'follower',
        select: 'name profileImage bio'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const followers = follows.map(follow => follow.follower);

    const total = await Follow.countDocuments({ following: req.user._id });

    res.status(200).json(
      ApiResponse.success({
        followers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(ApiError.forbidden('You can only update your own profile'));
    }

    const allowedUpdates = ['name', 'bio', 'profileImage', 'phone', 'dateOfBirth', 
                           'gender', 'fitnessGoals', 'experienceLevel', 'height', 
                           'weight', 'certification', 'specialization', 'education', 
                           'yearsOfExperience'];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    res.status(200).json(
      ApiResponse.success({
        user
      }, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};