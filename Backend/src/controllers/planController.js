import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Review from '../models/Review.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { paginate } from '../utils/helpers.js';

export const createPlan = async (req, res, next) => {
  try {
    if (req.user.role !== 'trainer') {
      return next(ApiError.forbidden('Only trainers can create plans'));
    }

    const planData = {
      ...req.body,
      trainer: req.user._id
    };

    const plan = await Plan.create(planData);

    await req.user.updateOne({
      $inc: { totalPlans: 1 }
    });

    res.status(201).json(
      ApiResponse.created({
        plan
      }, 'Plan created successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      trainerId,
      search,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    const query = { isPublished: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (trainerId) {
      query.trainer = trainerId;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const { skip, limit: queryLimit } = paginate(page, limit);

    // Determine sort order
    const sortOrder = order === 'desc' ? -1 : 1;
    let sortField = sort;
    
    // Map sort options
    const sortMap = {
      'price': 'price',
      'rating': 'averageRating',
      'subscribers': 'subscribersCount',
      'createdAt': 'createdAt',
      'popularity': { $multiply: ['$averageRating', '$subscribersCount'] }
    };
    
    sortField = sortMap[sort] || 'createdAt';

    const plans = await Plan.find(query)
      .populate('trainerDetails')
      .sort(sortField === 'popularity' ? { subscribersCount: -1, averageRating: -1 } : { [sortField]: sortOrder })
      .skip(skip)
      .limit(queryLimit);

    let plansWithSubscriptionStatus = plans;
    if (req.user) {
      const subscribedPlanIds = await Subscription.find({
        user: req.user._id,
        status: 'active'
      }).distinct('plan');

      plansWithSubscriptionStatus = plans.map(plan => ({
        ...plan.toObject(),
        isSubscribed: subscribedPlanIds.includes(plan._id)
      }));
    }
    const total = await Plan.countDocuments(query);

    res.status(200).json(
      ApiResponse.success({
        plans: plansWithSubscriptionStatus,
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

export const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id)
      .populate('trainerDetails')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userDetails',
          select: 'name profileImage'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!plan) {
      return next(ApiError.notFound('Plan not found'));
    }

    let isSubscribed = false;
    if (req.user) {
      const subscription = await Subscription.findOne({
        user: req.user._id,
        plan: id,
        status: 'active'
      });
      isSubscribed = !!subscription;
    }

    const relatedPlans = await Plan.find({
      _id: { $ne: id },
      category: plan.category,
      isPublished: true
    })
      .populate('trainerDetails')
      .limit(4);

    const planResponse = {
      ...plan.toObject(),
      isSubscribed,
      relatedPlans
    };

    res.status(200).json(
      ApiResponse.success({
        plan: planResponse
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    
    if (!plan) {
      return next(ApiError.notFound('Plan not found'));
    }

    if (plan.trainer.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only update your own plans'));
    }

    const allowedUpdates = ['title', 'description', 'fullDescription', 'price', 
                           'duration', 'category', 'difficulty', 'weeklyWorkouts', 
                           'dailyTime', 'equipmentRequired', 'coverImage', 'tags', 
                           'workouts', 'isPublished', 'isFeatured'];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('trainerDetails');

    res.status(200).json(
      ApiResponse.success({
        plan: updatedPlan
      }, 'Plan updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    
    if (!plan) {
      return next(ApiError.notFound('Plan not found'));
    }
    if (plan.trainer.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only delete your own plans'));
    }

    const activeSubscriptions = await Subscription.countDocuments({
      plan: id,
      status: 'active'
    });

    if (activeSubscriptions > 0) {
      return next(ApiError.conflict('Cannot delete plan with active subscriptions'));
    }

    await Plan.findByIdAndUpdate(id, { isPublished: false });

    await req.user.updateOne({
      $inc: { totalPlans: -1 }
    });

    res.status(200).json(
      ApiResponse.success(null, 'Plan deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getTrainerPlans = async (req, res, next) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { skip, limit: queryLimit } = paginate(page, limit);

    const query = { 
      trainer: trainerId,
      isPublished: true 
    };

    const plans = await Plan.find(query)
      .populate('trainerDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const total = await Plan.countDocuments(query);

    res.status(200).json(
      ApiResponse.success({
        plans,
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