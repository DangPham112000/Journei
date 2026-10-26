import { getUserByClerkId } from '../auth';
import { Category } from '../models/Category';
import { Destination } from '../models/Destination';
import { Plan } from '../models/Plan';
import { Place } from '../models/Place';
import { ScheduledActivity } from '../models/ScheduledActivity';
import { removeActivityEvents, sessionToken, syncActivity, syncPlan } from '../calendarSync';
import { eventUrl, findConflicts, logEventManagerFailure, type CalendarEvent } from '../eventManager';
import dotenv from 'dotenv';
dotenv.config();

const requireAuth = (resolver: any) => async (parent: any, args: any, context: any, info: any) => {
  if (!context.user) throw new Error('Not authenticated');
  return resolver(parent, args, context, info);
};

const toCalendarEvents = (events: CalendarEvent[]) =>
  events.map((e) => ({ ...e, url: eventUrl(e.id) }));

/** Event Manager events overlapping a range; empty without a session token or on failure. */
async function calendarConflicts(
  context: any,
  startTime: string,
  endTime: string,
  excludeEventId?: string,
) {
  const token = sessionToken(context);
  if (!token) return [];
  try {
    return toCalendarEvents(await findConflicts(token, startTime, endTime, excludeEventId));
  } catch (error) {
    logEventManagerFailure(error, 'checking conflicts');
    return [];
  }
}

/** Activities of the given places, with their calendar links, before they are deleted. */
const activitiesOfPlaces = (placeIds: unknown[]) =>
  ScheduledActivity.find({ placeId: { $in: placeIds } }).select('calendarEvent');

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        return null;
      }
      return await getUserByClerkId(context.user.id);
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

    calendarConflicts: requireAuth(async (_: any, args: any, context: any) => {
      let excludeEventId: string | undefined;
      if (args.excludeActivityId) {
        const activity = await ScheduledActivity.findById(args.excludeActivityId);
        excludeEventId = activity?.calendarEvent?.id;
      }
      return calendarConflicts(context, args.startTime, args.endTime, excludeEventId);
    }),
  },

  Plan: {
    id: (parent: any) => parent._id || parent.id,
    calendarSync: (parent: any) => !!parent.calendarSync,
    // A Date would be serialized as milliseconds ("1793491200000"), which the browser cannot parse.
    startDate: (parent: any) => new Date(parent.startDate).toISOString(),
    endDate: (parent: any) => new Date(parent.endDate).toISOString(),
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
    calendarEvent: (parent: any) =>
      parent.calendarEvent?.id
        ? { app: parent.calendarEvent.app, id: parent.calendarEvent.id, url: eventUrl(parent.calendarEvent.id) }
        : null,
    calendarConflicts: (parent: any, _: any, context: any) =>
      calendarConflicts(
        context,
        parent.startTime.toISOString(),
        parent.endTime.toISOString(),
        parent.calendarEvent?.id,
      ),
  },

  Mutation: {
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

      const titleChanged = !!args.title && args.title !== plan.title;
      if (args.title) plan.title = args.title;
      if (args.startDate) plan.startDate = args.startDate;
      if (args.endDate) plan.endDate = args.endDate;
      if (args.destinationIds) plan.destinations = args.destinationIds;

      await plan.save();
      // The plan's title is in each event's description.
      if (titleChanged && plan.calendarSync) await syncPlan(plan._id, sessionToken(context));
      return await Plan.findById(plan._id).populate('destinations');
    }),

    deletePlan: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const plan = await Plan.findById(id);
      if (!plan) throw new Error('Plan not found');
      if (plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      // delete all places and activities related to this plan
      const places = await Place.find({ planId: id });
      const placeIds = places.map(p => p._id);
      await removeActivityEvents(await activitiesOfPlaces(placeIds), sessionToken(context));
      await ScheduledActivity.deleteMany({ placeId: { $in: placeIds } });
      await Place.deleteMany({ planId: id });
      await Plan.findByIdAndDelete(id);
      return true;
    }),

    setPlanCalendarSync: requireAuth(async (_: any, { planId, enabled }: { planId: string; enabled: boolean }, context: any) => {
      const plan = await Plan.findById(planId);
      if (!plan) throw new Error('Plan not found');
      if (plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      const token = sessionToken(context);
      if (!token) throw new Error('Calendar sync needs a signed-in browser session');
      plan.calendarSync = enabled;
      await plan.save();
      const failed = await syncPlan(plan._id, token);
      if (failed) throw new Error(`${failed} activities could not be synced with Event Manager. Try again later.`);
      return await Plan.findById(plan._id).populate('destinations');
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
      const nameChanged = place.isModified('name');

      await place.save();
      // The place's name is its activities' event title.
      if (nameChanged && plan.calendarSync) {
        const activities = await ScheduledActivity.find({ placeId: place._id }).select('_id');
        for (const activity of activities) await syncActivity(activity._id, sessionToken(context));
      }
      return await Place.findById(place._id)
        .populate('destinationId')
        .populate('categoryId');
    }),

    deletePlace: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const place = await Place.findById(id);
      if (!place) throw new Error('Place not found');
      const plan = await Plan.findById(place.planId);
      if (!plan || plan.userId.toString() !== context.user.id) throw new Error('Not authorized');

      await removeActivityEvents(await activitiesOfPlaces([id]), sessionToken(context));
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
      await syncActivity(activity._id, sessionToken(context));

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
      await syncActivity(activity._id, sessionToken(context));
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

      await removeActivityEvents([activity], sessionToken(context));
      await ScheduledActivity.findByIdAndDelete(id);
      return true;
    }),
  },
};
