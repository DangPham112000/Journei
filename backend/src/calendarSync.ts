import { Plan, type IPlan } from './models/Plan';
import { Place } from './models/Place';
import { ScheduledActivity, type IScheduledActivity } from './models/ScheduledActivity';
import {
  createEvent,
  deleteEvent,
  EventManagerError,
  logEventManagerFailure,
  updateEvent,
  type EventInput,
} from './eventManager';

// Keeps a plan's scheduled activities in step with events in the owner's Event Manager calendar
// (DAN-95). Each activity stores only a `{ app, id }` reference to its event. Every call needs the
// user's Clerk session token; without one (MCP requests carry an OAuth token instead) nothing is
// synced and the activity shows as not on the calendar until the user syncs from the plan page.
// Failures are logged and never fail the Journei change that triggered them.

const journeiOrigin = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

/** The Clerk session token from the GraphQL context, or null (MCP requests, mock mode). */
export function sessionToken(context: any): string | null {
  const header: unknown = context?.req?.headers?.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

async function eventInput(activity: IScheduledActivity, plan: IPlan): Promise<EventInput | null> {
  const place = await Place.findById(activity.placeId).populate('destinationId');
  if (!place) return null;
  const destination = (place as any).destinationId?.name as string | undefined;
  return {
    title: place.name,
    startTime: activity.startTime.toISOString(),
    endTime: activity.endTime.toISOString(),
    location: destination,
    description: `Trip "${plan.title}" in Journei: ${journeiOrigin()}/plans/${plan.id}`,
  };
}

async function setLink(activityId: unknown, eventId: string | null) {
  await ScheduledActivity.updateOne(
    { _id: activityId },
    { $set: { calendarEvent: eventId ? { app: 'event-manager', id: eventId } : null } },
  );
}

/**
 * Create, move or remove the activity's calendar event so it matches the activity and its plan's
 * `calendarSync` setting. Returns whether the activity is now in the state it should be.
 */
export async function syncActivity(activityId: unknown, token: string | null): Promise<boolean> {
  const activity = await ScheduledActivity.findById(activityId);
  if (!activity) return true;
  const place = await Place.findById(activity.placeId);
  const plan = place && (await Plan.findById(place.planId));
  const linked = activity.calendarEvent?.id ?? null;
  const wanted = !!plan?.calendarSync;
  if (!wanted && !linked) return true;
  if (!token) return false;

  try {
    if (!wanted) {
      await deleteEvent(token, linked!);
      await setLink(activity._id, null);
      return true;
    }
    const input = await eventInput(activity, plan!);
    if (!input) return false;
    if (linked) {
      try {
        await updateEvent(token, linked, input);
        return true;
      } catch (error) {
        // Deleted in Event Manager: recreate it below.
        if (!(error instanceof EventManagerError && error.code === 'NOT_FOUND')) throw error;
      }
    }
    const event = await createEvent(token, input);
    await setLink(activity._id, event.id);
    return true;
  } catch (error) {
    logEventManagerFailure(error, 'syncing an activity', { activityId: String(activityId) });
    return false;
  }
}

/** Sync every activity of a plan, one at a time. Returns how many could not be synced. */
export async function syncPlan(planId: unknown, token: string | null): Promise<number> {
  const placeIds = (await Place.find({ planId }).select('_id')).map((p) => p._id);
  const activities = await ScheduledActivity.find({ placeId: { $in: placeIds } }).select('_id');
  let failed = 0;
  for (const activity of activities) {
    if (!(await syncActivity(activity._id, token))) failed++;
  }
  return failed;
}

/**
 * Delete the calendar events of activities that are about to be deleted. Without a token the
 * events stay in Event Manager, where the user can delete them by hand.
 */
export async function removeActivityEvents(
  activities: Pick<IScheduledActivity, 'calendarEvent'>[],
  token: string | null,
): Promise<void> {
  const ids = activities.map((a) => a.calendarEvent?.id).filter((id): id is string => !!id);
  if (!ids.length) return;
  if (!token) {
    logEventManagerFailure(new Error('no session token'), 'deleting events', { eventIds: ids });
    return;
  }
  await Promise.all(
    ids.map((id) =>
      deleteEvent(token, id).catch((error) =>
        logEventManagerFailure(error, 'deleting an event', { eventId: id }),
      ),
    ),
  );
}
