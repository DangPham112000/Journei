import mongoose from 'mongoose';
import { coreUsers } from './coreUsers';
import { logger } from './utils/logger';

/**
 * DAN-93: Journei stops keeping its own user table and reads users from the shared
 * core.users. This rewrites `plans.userId` from the old `users` document's Mongo _id to the
 * user's Clerk id, then drops the old `users` collection once no plan points at it.
 *
 * Safe to run on every start: rewritten plans no longer match an old _id, and once `users`
 * is gone this returns at once. The deploy dumps the database to
 * /opt/journei/backups/pre-dan-93.archive before the first run.
 */
export async function migrateUsersToClerkIds(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Not connected to MongoDB');
  const legacyUsers = await db.collection('users').find({}).toArray();
  if (legacyUsers.length === 0) {
    // An empty leftover collection (or none at all): nothing to keep.
    await db.collection('users').drop().catch(() => undefined);
    return;
  }

  const plans = db.collection('plans');
  let moved = 0;
  for (const legacy of legacyUsers) {
    const email = typeof legacy.email === 'string' ? legacy.email.toLowerCase() : null;
    // core.users reflects the current Clerk app, so a match by email wins over a stored
    // clerkId that could be from an older Clerk app.
    const core = email ? await coreUsers().findOne({ email }) : null;
    const clerkId: string | undefined = core?.clerkId ?? legacy.clerkId;
    if (!clerkId) {
      logger.warn({ userId: String(legacy._id) }, 'DAN-93: user has no Clerk id and is not in core.users; their plans are not migrated');
      continue;
    }
    moved += (await plans.updateMany({ userId: legacy._id }, { $set: { userId: clerkId } })).modifiedCount;
  }
  if (moved) logger.info(`DAN-93: ${moved} plans now reference their owner by Clerk id`);

  const leftovers = await plans.countDocuments({ userId: { $type: 'objectId' } });
  if (leftovers > 0) {
    logger.warn(`DAN-93: ${leftovers} plans still reference old users; keeping the users collection`);
    return;
  }
  await db.collection('users').drop();
  logger.info(`DAN-93: dropped the old users collection (${legacyUsers.length} users)`);
}
