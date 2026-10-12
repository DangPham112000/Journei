import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthUser } from '../auth';
import { resolvers } from '../graphql/resolvers';
import { Place } from '../models/Place';

// Tools reuse the GraphQL resolvers so ownership checks (walking up to the owning plan) stay in
// one place. Delete operations are intentionally not exposed: an agent could call them by mistake.

const Q: Record<string, any> = resolvers.Query;
const M: Record<string, any> = resolvers.Mutation;

const dateTime = z.string().describe('ISO 8601 date-time, e.g. 2026-12-24T09:00:00+07:00');

const toResult = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const toError = (error: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }],
});

export function registerTools(server: McpServer, user: AuthUser) {
  const ctx = { user };
  const run = (fn: () => Promise<unknown>) => async () => {
    try {
      return toResult(await fn());
    } catch (error) {
      return toError(error);
    }
  };
  const runWith = <T>(fn: (args: T) => Promise<unknown>) => async (args: T) => {
    try {
      return toResult(await fn(args));
    } catch (error) {
      return toError(error);
    }
  };

  server.registerTool(
    'list_plans',
    { description: 'List all trip plans of the signed-in user, ordered by start date.' },
    run(() => Q.myPlans(null, {}, ctx)),
  );

  server.registerTool(
    'get_plan',
    {
      description:
        'Get one trip plan with its places and scheduled activities. Fails if the plan is not the signed-in user\'s.',
      inputSchema: { planId: z.string().describe('Plan id from list_plans') },
    },
    runWith(async ({ planId }: { planId: string }) => {
      const [plan, places, activities] = await Promise.all([
        Q.plan(null, { id: planId }, ctx),
        Q.placesForPlan(null, { planId }, ctx),
        Q.scheduledActivitiesForPlan(null, { planId }, ctx),
      ]);
      return { plan, places, activities };
    }),
  );

  server.registerTool(
    'list_destinations',
    { description: 'List all known destinations (shared by every user). Use their ids when creating plans and places.' },
    run(() => Q.destinations()),
  );

  server.registerTool(
    'list_categories',
    { description: 'List all place categories (shared by every user), e.g. food or sightseeing.' },
    run(() => Q.categories()),
  );

  server.registerTool(
    'create_destination',
    {
      description:
        'Get or create a destination by name (shared by every user). Call list_destinations first to avoid near-duplicates.',
      inputSchema: { name: z.string().min(1) },
    },
    runWith(({ name }: { name: string }) => M.createDestination(null, { name }, ctx)),
  );

  server.registerTool(
    'create_category',
    {
      description:
        'Get or create a place category by name (shared by every user). Call list_categories first to avoid near-duplicates.',
      inputSchema: { name: z.string().min(1) },
    },
    runWith(({ name }: { name: string }) => M.createCategory(null, { name }, ctx)),
  );

  server.registerTool(
    'recommended_places',
    {
      description:
        'Places other travellers saved for a destination, as inspiration. Personal notes are omitted.',
      inputSchema: { destinationId: z.string() },
    },
    runWith(async ({ destinationId }: { destinationId: string }) => {
      const places = await Q.recommendedPlaces(null, { destinationId }, ctx);
      return places.map((p: InstanceType<typeof Place>) => {
        const { notes: _notes, planId: _planId, ...rest } = p.toJSON();
        return rest;
      });
    }),
  );

  server.registerTool(
    'create_plan',
    {
      description: 'Create a trip plan for the signed-in user.',
      inputSchema: {
        title: z.string().min(1),
        startDate: z.string().describe('ISO 8601 date, e.g. 2026-12-24'),
        endDate: z.string().describe('ISO 8601 date, e.g. 2026-12-28'),
        destinationIds: z.array(z.string()).min(1).describe('Destination ids from list_destinations'),
      },
    },
    runWith((args: { title: string; startDate: string; endDate: string; destinationIds: string[] }) =>
      M.createPlan(null, args, ctx),
    ),
  );

  server.registerTool(
    'update_plan',
    {
      description: 'Update a trip plan. Only the fields you pass are changed.',
      inputSchema: {
        planId: z.string(),
        title: z.string().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        destinationIds: z.array(z.string()).min(1).optional().describe('Replaces the whole list'),
      },
    },
    runWith(({ planId, ...rest }: { planId: string; [k: string]: unknown }) =>
      M.updatePlan(null, { id: planId, ...rest }, ctx),
    ),
  );

  server.registerTool(
    'create_place',
    {
      description: 'Add a place (restaurant, sight, hotel...) to one of the user\'s plans. Status starts as PLANNED.',
      inputSchema: {
        planId: z.string(),
        name: z.string().min(1),
        destinationId: z.string().describe('Destination id from list_destinations'),
        categoryId: z.string().describe('Category id from list_categories'),
        priceRange: z.string().optional(),
        reviewLinks: z.array(z.string()).optional(),
        notes: z.string().optional(),
      },
    },
    runWith((args: Record<string, unknown>) => M.createPlace(null, args, ctx)),
  );

  server.registerTool(
    'update_place',
    {
      description: 'Update a place. Only the fields you pass are changed. Set visitStatus to VISITED once the user has been there.',
      inputSchema: {
        placeId: z.string(),
        name: z.string().min(1).optional(),
        categoryId: z.string().optional(),
        priceRange: z.string().optional(),
        reviewLinks: z.array(z.string()).optional().describe('Replaces the whole list'),
        notes: z.string().optional(),
        visitStatus: z.enum(['PLANNED', 'VISITED']).optional(),
      },
    },
    runWith(({ placeId, ...rest }: { placeId: string; [k: string]: unknown }) =>
      M.updatePlace(null, { id: placeId, ...rest }, ctx),
    ),
  );

  server.registerTool(
    'create_scheduled_activity',
    {
      description: 'Schedule a visit to a place at a given time window.',
      inputSchema: { placeId: z.string(), startTime: dateTime, endTime: dateTime },
    },
    runWith((args: { placeId: string; startTime: string; endTime: string }) =>
      M.createScheduledActivity(null, args, ctx),
    ),
  );

  server.registerTool(
    'update_scheduled_activity',
    {
      description: 'Move or retime a scheduled activity. Only the fields you pass are changed.',
      inputSchema: {
        activityId: z.string(),
        placeId: z.string().optional(),
        startTime: dateTime.optional(),
        endTime: dateTime.optional(),
      },
    },
    runWith(({ activityId, ...rest }: { activityId: string; [k: string]: unknown }) =>
      M.updateScheduledActivity(null, { id: activityId, ...rest }, ctx),
    ),
  );
}
