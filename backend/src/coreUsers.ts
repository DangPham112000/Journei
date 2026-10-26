import mongoose from 'mongoose';

/**
 * Shared user table `core.users` (DAN-91). The core-users service in ecosystem-infra is its
 * only writer and keeps it in sync with Clerk; Journei's Mongo user can only read it. Journei
 * has no user table of its own and identifies users by their Clerk id (DAN-93).
 */
export interface CoreUser {
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

/** A user as the GraphQL `User` type exposes it. `id` is the Clerk id. */
export interface JourneiUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

/** Mock Mode has no Clerk: every request is this user, seeded into core.users by seed.ts. */
export const MOCK_USER: CoreUser = {
  clerkId: 'user_mock',
  email: 'mockuser@example.com',
  name: 'Mock User',
  avatar: 'https://via.placeholder.com/150',
};

export function coreUsers() {
  return mongoose.connection.useDb('core', { useCache: true }).collection<CoreUser>('users');
}

export function toUser(doc: CoreUser): JourneiUser {
  return {
    id: doc.clerkId,
    email: doc.email,
    name: doc.name || doc.email.split('@')[0],
    avatar: doc.avatar || null,
  };
}

export async function findCoreUser(clerkId: string): Promise<JourneiUser | null> {
  const doc = await coreUsers().findOne({ clerkId });
  return doc ? toUser(doc) : null;
}

/** For finding people to invite later. Not exposed through the API (DAN-93). */
export async function findCoreUserByEmail(email: string): Promise<JourneiUser | null> {
  const doc = await coreUsers().findOne({ email: email.trim().toLowerCase() });
  return doc ? toUser(doc) : null;
}
