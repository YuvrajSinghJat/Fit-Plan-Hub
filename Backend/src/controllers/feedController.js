import Plan from '../models/Plan.js';
import Follow from '../models/Follow.js';
import Subscription from '../models/Subscription.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { paginate } from '../utils/helpers.js';

export const getUserFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: queryLimit } = paginate(page, limit);

    const follows = await Follow.find({ follower: req.user._id });
    const followingIds = follows.map(follow => follow.following);

    if (followingIds.length === 0) {
      const popularPlans = await Plan.find({ isPublished: true })
        .populate('trainerDetails')
        .sort({ subscribersCount: -1, averageRating: -1 })
        .skip(skip)
        .limit(queryLimit);

      const total = await Plan.countDocuments({ isPublished: true });

      return res.status(200).json(
        ApiResponse.success({
          plans: popularPlans,
          feedType: 'popular',
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        })
      );
    }

    const feedPlans = await Plan.find({
      trainer: { $in: followingIds },
      isPublished: true
    })
      .populate('trainerDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit);

    const total = await Plan.countDocuments({
      trainer: { $in: followingIds },
      isPublished: true
    });

    const subscribedPlanIds = await Subscription.find({
      user: req.user._id,
      status: 'active'
    }).distinct('plan');

    const plansWithSubscriptionStatus = feedPlans.map(plan => ({
      ...plan.toObject(),
      isSubscribed: subscribedPlanIds.includes(plan._id)
    }));

    res.status(200).json(
      ApiResponse.success({
        plans: plansWithSubscriptionStatus,
        feedType: 'following',
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

export const getDashboardStats = async (req, res, next) => {
  try {
    let stats;

    if (req.user.role === 'trainer') {

      const trainerPlans = await Plan.find({ trainer: req.user._id });
      const activeSubscriptions = await Subscription.countDocuments({
        plan: { $in: trainerPlans.map(p => p._id) },
        status: 'active'
      });

      const totalRevenue = await Payment.aggregate([
        {
          $match: {
            plan: { $in: trainerPlans.map(p => p._id) },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      stats = {
        totalPlans: trainerPlans.length,
        totalSubscribers: activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRating: req.user.rating || 0,
        followersCount: req.user.followersCount || 0,
        totalReviews: req.user.totalReviews || 0
      };
    } else {

      const subscriptions = await Subscription.find({
        user: req.user._id,
        status: 'active'
      }).populate('plan');

      const followedTrainers = await Follow.countDocuments({
        follower: req.user._id
      });

      const totalSpent = await Payment.aggregate([
        {
          $match: {
            user: req.user._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      stats = {
        activeSubscriptions: subscriptions.length,
        followingCount: followedTrainers,
        totalSpent: totalSpent[0]?.total || 0,
        completedWorkouts: subscriptions.reduce((sum, sub) => 
          sum + (sub.completedWorkouts?.length || 0), 0
        ),
        totalPlansPurchased: await Subscription.countDocuments({
          user: req.user._id
        })
      };
    }

    res.status(200).json(
      ApiResponse.success({
        stats
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getRecommendedPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: queryLimit } = paginate(page, limit);

    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active'
    }).populate('plan');

    const subscribedCategories = [...new Set(subscriptions.map(sub => sub.plan?.category))];
    
    const recommendedPlans = await Plan.find({
      _id: { $nin: subscriptions.map(sub => sub.plan._id) },
      category: { $in: subscribedCategories },
      isPublished: true
    })
      .populate('trainerDetails')
      .sort({ averageRating: -1, subscribersCount: -1 })
      .skip(skip)
      .limit(queryLimit);

    const total = await Plan.countDocuments({
      _id: { $nin: subscriptions.map(sub => sub.plan._id) },
      category: { $in: subscribedCategories },
      isPublished: true
    });

    res.status(200).json(
      ApiResponse.success({
        plans: recommendedPlans,
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