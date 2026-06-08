import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Destination } from '../models/Destination';
import { Plan } from '../models/Plan';
import { Place } from '../models/Place';
import { ScheduledActivity } from '../models/ScheduledActivity';
import { processAssistantMessage } from '../utils/ai';
import dotenv from 'dotenv';
dotenv.config();

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage', // required for flow: 'auth-code' in react-oauth/google
);

const requireAuth = (resolver: any) => async (parent: any, args: any, context: any, info: any) => {
  if (!context.user) throw new Error('Not authenticated');
  return resolver(parent, args, context, info);
};

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        return null;
      }
      return await User.findById(context.user.id);
    },

    categories: async () => {
      return await Category.find().sort({ name: 1 });
    },

    destinations: async () => {
      return await Destination.find().sort({ name: 1 });
    },

    myPlans: requireAuth(async (_: any, __: any, context: any) => {
      return await Plan.find({ userId: context.user.id })
        .populate('destinations')
        .sort({ startDate: 1 });
    }),

    plan: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const plan = await Plan.findById(id).populate('destinations');
      if (!plan) return null;
      if (plan.userId.toString() !== context.user.id) {
         throw new Error('Not authorized to view this plan');
      }
      return plan;
    }),

    placesForPlan: requireAuth(async (_: any, { planId }: { planId: string }, context: any) => {
      const plan = await Plan.findById(planId);
      if (!plan || plan.userId.toString() !== context.user.id) {
         throw new Error('Not authorized');
      }
      return await Place.find({ planId })
        .populate('destinationId')
        .populate('categoryId')
        .sort({ createdAt: -1 });
    }),

    recommendedPlaces: requireAuth(async (_: any, { destinationId }: { destinationId: string }) => {
      // Find all places globally for this destination
      return await Place.find({ destinationId })
        .populate('destinationId')
        .populate('categoryId')
        .sort({ createdAt: -1 });
    }),

    scheduledActivitiesForPlan: requireAuth(async (_: any, { planId }: { planId: string }, context: any) => {
      const plan = await Plan.findById(planId);
      if (!plan || plan.userId.toString() !== context.user.id) {
         throw new Error('Not authorized');
      }
      const places = await Place.find({ planId }).select('_id');
      const placeIds = places.map(p => p._id);

      return await ScheduledActivity.find({ placeId: { $in: placeIds } })
        .populate({
           path: 'placeId',
           populate: [{ path: 'destinationId' }, { path: 'categoryId' }]
        })
        .sort({ startTime: 1 });
    }),
  },

  Plan: {
    id: (parent: any) => parent._id || parent.id,
  },

  Place: {
    id: (parent: any) => parent._id || parent.id,
    destination: (parent: any) => parent.destinationId,
    category: (parent: any) => parent.categoryId,
  },

  ScheduledActivity: {
    id: (parent: any) => parent._id || parent.id,
    place: (parent: any) => parent.placeId,
    startTime: (parent: any) => parent.startTime.toISOString(),
    endTime: (parent: any) => parent.endTime.toISOString(),
  },

  Mutation: {
    loginWithGoogle: async (_: any, { code }: { code: string }, context: any) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code);

        if (!tokens.id_token) {
          throw new Error('No id_token in response');
        }

        const ticket = await oAuth2Client.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
          throw new Error('Invalid Google payload');
        }

        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.create({
            googleId,
            email,
            name: name || 'Unknown Name',
            picture,
            refreshToken: tokens.refresh_token,
          });
        } else if (tokens.refresh_token) {
          user.refreshToken = tokens.refresh_token;
          await user.save();
        }

        const jwtPayload = {
          id: user._id,
          email: user.email,
        };

        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is not set');
        }

        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });

        if (context.res) {
          context.res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        }

        return user;
      } catch (error) {
        console.error('Error during Google login:', error);
        throw new Error('Failed to login with Google');
      }
    },

    createCategory: requireAuth(async (_: any, { name }: { name: string }) => {
      const existing = await Category.findOne({ name });
      if (existing) return existing;
      return await Category.create({ name });
    }),

    createDestination: requireAuth(async (_: any, { name }: { name: string }) => {
      const existing = await Destination.findOne({ name });
      if (existing) return existing;
      return await Destination.create({ name });
    }),

    createPlan: requireAuth(async (_: any, args: any, context: any) => {
      const plan = await Plan.create({
        title: args.title,
        startDate: args.startDate,
        endDate: args.endDate,
        destinations: args.destinationIds,
        userId: context.user.id,
      });
      return await Plan.findById(plan._id).populate('destinations');
    }),

    updatePlan: requireAuth(async (_: any, args: any, context: any) => {
      const plan = await Plan.findById(args.id);
      if (!plan) throw new Error('Plan not found');
      if (plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      if (args.title) plan.title = args.title;
      if (args.startDate) plan.startDate = args.startDate;
      if (args.endDate) plan.endDate = args.endDate;
      if (args.destinationIds) plan.destinations = args.destinationIds;

      await plan.save();
      return await Plan.findById(plan._id).populate('destinations');
    }),

    deletePlan: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const plan = await Plan.findById(id);
      if (!plan) throw new Error('Plan not found');
      if (plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      // delete all places and activities related to this plan
      const places = await Place.find({ planId: id });
      const placeIds = places.map(p => p._id);
      await ScheduledActivity.deleteMany({ placeId: { $in: placeIds } });
      await Place.deleteMany({ planId: id });
      await Plan.findByIdAndDelete(id);
      return true;
    }),

    createPlace: requireAuth(async (_: any, args: any, context: any) => {
      const plan = await Plan.findById(args.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      const place = await Place.create({
        name: args.name,
        planId: args.planId,
        destinationId: args.destinationId,
        categoryId: args.categoryId,
        priceRange: args.priceRange,
        reviewLinks: args.reviewLinks || [],
        notes: args.notes,
        visitStatus: 'PLANNED'
      });

      return await Place.findById(place._id)
        .populate('destinationId')
        .populate('categoryId');
    }),

    updatePlace: requireAuth(async (_: any, args: any, context: any) => {
      const place = await Place.findById(args.id);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      if (args.name !== undefined) place.name = args.name;
      if (args.categoryId !== undefined) place.categoryId = args.categoryId;
      if (args.priceRange !== undefined) place.priceRange = args.priceRange;
      if (args.reviewLinks !== undefined) place.reviewLinks = args.reviewLinks;
      if (args.notes !== undefined) place.notes = args.notes;
      if (args.visitStatus !== undefined) place.visitStatus = args.visitStatus;

      await place.save();
      return await Place.findById(place._id)
        .populate('destinationId')
        .populate('categoryId');
    }),

    deletePlace: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const place = await Place.findById(id);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      await ScheduledActivity.deleteMany({ placeId: id });
      await Place.findByIdAndDelete(id);
      return true;
    }),

    createScheduledActivity: requireAuth(async (_: any, args: any, context: any) => {
      const place = await Place.findById(args.placeId);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      const activity = await ScheduledActivity.create({
        placeId: args.placeId,
        startTime: args.startTime,
        endTime: args.endTime,
      });

      return await ScheduledActivity.findById(activity._id)
        .populate({
           path: 'placeId',
           populate: [{ path: 'destinationId' }, { path: 'categoryId' }]
        });
    }),

    updateScheduledActivity: requireAuth(async (_: any, args: any, context: any) => {
      const activity = await ScheduledActivity.findById(args.id);
      if (!activity) throw new Error('Activity not found');

      // Check authorization
      const place = await Place.findById(activity.placeId);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      if (args.placeId !== undefined) {
         // Also verify the new place belongs to the same user
         const newPlace = await Place.findById(args.placeId);
         if (!newPlace) throw new Error('New place not found');
         const newPlan = await Plan.findById(newPlace.planId);
         if (!newPlan || newPlan.userId.toString() !== context.user.id) throw new Error('Not authorized');
         activity.placeId = args.placeId;
      }

      if (args.startTime) activity.startTime = args.startTime;
      if (args.endTime) activity.endTime = args.endTime;

      await activity.save();
      return await ScheduledActivity.findById(activity._id)
        .populate({
           path: 'placeId',
           populate: [{ path: 'destinationId' }, { path: 'categoryId' }]
        });
    }),

    deleteScheduledActivity: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const activity = await ScheduledActivity.findById(id);
      if (!activity) throw new Error('Activity not found');

      const place = await Place.findById(activity.placeId);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      await ScheduledActivity.findByIdAndDelete(id);
      return true;
    }),

    askAssistant: requireAuth(async (_: any, { message, history }: { message: string, history?: any[] }, context: any) => {
      try {
        const response = await processAssistantMessage(context.user.id, message, history);
        return response;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to process assistant message');
      }
    })
  },
};
