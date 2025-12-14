import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { paginate } from '../utils/helpers.js';

export const subscribeToPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findOne({
      _id: planId,
      isPublished: true
    });
    
    if (!plan) {
      return next(ApiError.notFound('Plan not found or not available'));
    }

    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      plan: planId,
      status: 'active'
    });
    
    if (existingSubscription) {
      return next(ApiError.conflict('You are already subscribed to this plan'));
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planId
    });

    const payment = await Payment.create({
      user: req.user._id,
      plan: planId,
      subscription: subscription._id,
      amount: plan.price,
      currency: 'USD',
      paymentMethod: 'simulated',
      status: 'completed',
      transactionId: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentGateway: 'simulated',
      completedAt: new Date()
    });

    subscription.payment = payment._id;
    await subscription.save();
    await subscription.populate('planDetails');

    res.status(201).json(
      ApiResponse.created({
        subscription,
        payment
      }, 'Successfully subscribed to plan!')
    );
  } catch (error) {
    next(error);
  }
};

export const unsubscribeFromPlan = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id
    });
    
    if (!subscription) {
      return next(ApiError.notFound('Subscription not found'));
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json(
      ApiResponse.success({
        subscription
      }, 'Successfully unsubscribed from plan')
    );
  } catch (error) {
    next(error);
  }
};

export const getMySubscriptions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status = 'active'
    } = req.query;

    const { skip, limit: queryLimit } = paginate(page, limit);

    const query = { user: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate({
        path: 'plan',
        populate: {
          path: 'trainer',
          select: 'name profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const total = await Subscription.countDocuments(query);

    res.status(200).json(
      ApiResponse.success({
        subscriptions,
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

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id
    })
    .populate({
      path: 'plan',
      populate: {
        path: 'trainer',
        select: 'name profileImage certification rating'
      }
    })
    .populate('payment');

    if (!subscription) {
      return next(ApiError.notFound('Subscription not found'));
    }

    res.status(200).json(
      ApiResponse.success({
        subscription
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionProgress = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const { currentDay, completedWorkout } = req.body;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return next(ApiError.notFound('Active subscription not found'));
    }

    if (currentDay) {
      subscription.currentDay = currentDay;
    }

    if (completedWorkout) {
      subscription.completedWorkouts.push({
        day: completedWorkout.day,
        completedAt: new Date(),
        duration: completedWorkout.duration,
        notes: completedWorkout.notes
      });
    }

    await subscription.updateProgress();

    subscription.lastActive = new Date();
    await subscription.save();

    res.status(200).json(
      ApiResponse.success({
        subscription
      }, 'Progress updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getTrainerSubscriptions = async (req, res, next) => {
  try {

    if (req.user.role !== 'trainer') {
      return next(ApiError.forbidden('Only trainers can view their subscribers'));
    }

    const { 
      page = 1, 
      limit = 20,
      planId
    } = req.query;

    const { skip, limit: queryLimit } = paginate(page, limit);

    const trainerPlans = await Plan.find({ trainer: req.user._id }).select('_id');
    const planIds = trainerPlans.map(plan => plan._id);

    const query = { 
      plan: { $in: planIds },
      status: 'active'
    };
    
    if (planId) {
      query.plan = planId;
    }

    const subscriptions = await Subscription.find(query)
      .populate({
        path: 'user',
        select: 'name profileImage email'
      })
      .populate('plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const total = await Subscription.countDocuments(query);

    res.status(200).json(
      ApiResponse.success({
        subscriptions,
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