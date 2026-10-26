import { createClerkClient, verifyToken } from '@clerk/backend';
import { verifyMachineAuthToken } from '@clerk/backend/internal';
import { findCoreUser, toUser, type JourneiUser } from './coreUsers';
import { logger } from './utils/logger';

// Read lazily: dotenv has not loaded backend/.env yet when this module is imported.
let clerk: ReturnType<typeof createClerkClient> | null | undefined;
function getClerk() {
  if (clerk === undefined) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    clerk = secretKey ? createClerkClient({ secretKey }) : null;
  }
  return clerk;
}

// Origins allowed to use a session token (the token's "azp" claim).
// Comma-separated, e.g. "https://journei.example.com,http://localhost:5173".
const getAuthorizedParties = () =>
  process.env.CLERK_AUTHORIZED_PARTIES?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** The signed-in user as resolvers see it in `context.user`. `id` is the Clerk user id. */
export interface AuthUser {
  id: string;
  email: string;
}

const toAuthUser = (user: JourneiUser): AuthUser => ({ id: user.id, email: user.email });

/**
 * Resolve the signed-in user from an "Authorization: Bearer <Clerk session token>" header.
 * Returns null when the header is missing or the token is invalid.
 */
export async function getUserFromAuthHeader(header: string | undefined): Promise<AuthUser | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();

  let clerkId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties: getAuthorizedParties(),
    });
    clerkId = payload.sub;
  } catch (error) {
    logger.warn({ err: error }, 'Invalid Clerk session token');
    return null;
  }

  const user = await getUserByClerkId(clerkId);
  return user && toAuthUser(user);
}

/**
 * Resolve the signed-in user from a Clerk OAuth access token (the kind an MCP client such as
 * Claude obtains after the user approves access). Returns null when the header is missing or the
 * token is invalid, expired or revoked.
 */
export async function getUserFromOAuthHeader(header: string | undefined): Promise<AuthUser | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();

  try {
    const { data, errors } = await verifyMachineAuthToken(token, { secretKey });
    if (errors || !data || !('subject' in data) || data.revoked || data.expired) return null;
    const user = await getUserByClerkId(data.subject);
    return user && toAuthUser(user);
  } catch (error) {
    logger.warn({ err: error }, 'Invalid Clerk OAuth access token');
    return null;
  }
}

/**
 * The user for a Clerk user id, read from the shared core.users. Falls back to the Clerk API
 * when core.users does not have the user yet (its webhook can arrive a moment after a brand-new
 * user's first request). Never writes core.users.
 */
export async function getUserByClerkId(clerkId: string): Promise<JourneiUser | null> {
  const user = await findCoreUser(clerkId);
  const clerk = getClerk();
  if (user || !clerk) return user;

  try {
    const clerkUser = await clerk.users.getUser(clerkId);
    const email = (
      clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress
    )?.toLowerCase();
    if (!email) return null;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      null;
    return toUser({ clerkId, email, name, avatar: clerkUser.imageUrl || null });
  } catch (error) {
    logger.warn({ err: error, clerkId }, 'User not found in core.users or Clerk');
    return null;
  }
}
