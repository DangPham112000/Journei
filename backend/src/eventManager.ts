import { logger } from './utils/logger';

// Client for Event Manager's GraphQL API (DAN-95). Journei calls it server to server with the
// user's own Clerk session token, so Event Manager does its own ownership checks. Event Manager
// accepts the token because Journei's origin is in its CLERK_AUTHORIZED_PARTIES.

/** Internal address on the shared `ecosystem` Docker network (alias set in Event Manager's compose). */
const graphqlUrl = () =>
  process.env.EVENT_MANAGER_GRAPHQL_URL || 'http://event-manager-backend:4000/graphql';

/** Public origin of Event Manager, for links shown to the user. */
export const eventManagerOrigin = () =>
  (process.env.EVENT_MANAGER_URL || 'https://events.dantepham.site').replace(/\/$/, '');

export const eventUrl = (eventId: string) =>
  `${eventManagerOrigin()}/events/${encodeURIComponent(eventId)}`;

const TIMEOUT_MS = 8000;

export class EventManagerError extends Error {
  constructor(
    message: string,
    /** GraphQL error code from Event Manager, e.g. NOT_FOUND or UNAUTHENTICATED. */
    readonly code?: string,
  ) {
    super(message);
  }
}

async function call<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(graphqlUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new EventManagerError(`Event Manager is unreachable: ${(error as Error).message}`);
  }
  const body = (await response.json().catch(() => null)) as {
    data?: T;
    errors?: { message: string; extensions?: { code?: string } }[];
  } | null;
  if (body?.errors?.length) {
    const [first] = body.errors;
    throw new EventManagerError(first.message, first.extensions?.code);
  }
  if (!response.ok || !body?.data) {
    throw new EventManagerError(`Event Manager answered HTTP ${response.status}`);
  }
  return body.data;
}

export interface EventInput {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

const EVENT_FIELDS = 'id title startTime endTime';

export async function createEvent(token: string, input: EventInput): Promise<CalendarEvent> {
  const data = await call<{ createEvent: CalendarEvent }>(
    token,
    `mutation ($input: CreateEventInput!) { createEvent(input: $input) { ${EVENT_FIELDS} } }`,
    { input: { ...input, participation: 'JOINED' } },
  );
  return data.createEvent;
}

export async function updateEvent(token: string, id: string, input: EventInput): Promise<CalendarEvent> {
  const data = await call<{ updateEvent: CalendarEvent }>(
    token,
    `mutation ($id: ID!, $input: UpdateEventInput!) { updateEvent(id: $id, input: $input) { ${EVENT_FIELDS} } }`,
    { id, input },
  );
  return data.updateEvent;
}

/** Deletes the event. An event that is already gone counts as deleted. */
export async function deleteEvent(token: string, id: string): Promise<void> {
  try {
    await call(token, 'mutation ($id: ID!) { deleteEvent(id: $id) }', { id });
  } catch (error) {
    if (error instanceof EventManagerError && error.code === 'NOT_FOUND') return;
    throw error;
  }
}

/** The user's joined events overlapping the range, other than `excludeEventId`. */
export async function findConflicts(
  token: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string,
): Promise<CalendarEvent[]> {
  const data = await call<{ conflicts: CalendarEvent[] }>(
    token,
    `query ($startTime: String!, $endTime: String!, $excludeEventId: ID) {
      conflicts(startTime: $startTime, endTime: $endTime, excludeEventId: $excludeEventId) { ${EVENT_FIELDS} }
    }`,
    { startTime, endTime, excludeEventId },
  );
  return data.conflicts;
}

/** Logs a failed call without failing the Journei request that triggered it. */
export function logEventManagerFailure(error: unknown, what: string, extra: Record<string, unknown> = {}) {
  logger.warn({ err: error, ...extra }, `Event Manager: ${what} failed`);
}
