import { createClerkClient, verifyToken } from '@clerk/backend';
import { verifyMachineAuthToken } from '@clerk/backend/internal';
import { User } from './models/User';
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

/** The signed-in user as resolvers see it in `context.user`. */
export interface AuthUser {
  id: string;
  email: string;
}

const toAuthUser = (doc: { _id: unknown; email: string }): AuthUser => ({
  id: String(doc._id),
  email: doc.email,
});

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

  return getUserByClerkId(clerkId);
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
    return getUserByClerkId(data.subject);
  } catch (error) {
    logger.warn({ err: error }, 'Invalid Clerk OAuth access token');
    return null;
  }
}

/**
 * Find the Mongo user for a Clerk user id. The first time, link to an existing
 * user with the same email (so users from the old Google login keep their
 * plans) or create one.
 */
async function getUserByClerkId(clerkId: string): Promise<AuthUser | null> {
  const clerk = getClerk();
  if (!clerk) return null;
  const existing = await User.findOne({ clerkId });
  if (existing) return toAuthUser(existing);

  const clerkUser = await clerk.users.getUser(clerkId);
  const email = (
    clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress
  )?.toLowerCase();
  if (!email) return null;

  const google = clerkUser.externalAccounts.find((a) => a.provider.includes('google'));
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.username ||
    email.split('@')[0];

  // Old Google-login users may have a mixed-case email, so match case-insensitively.
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const user = await User.findOneAndUpdate(
    { email: new RegExp(`^${escaped}$`, 'i') },
    {
      $set: { clerkId },
      $setOnInsert: {
        email,
        name,
        picture: clerkUser.imageUrl,
        ...(google?.providerUserId && { googleId: google.providerUserId }),
      },
    },
    { upsert: true, new: true },
  );
  return toAuthUser(user);
}
