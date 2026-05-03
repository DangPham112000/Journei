import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage' // important for auth code flow from frontend
);

export const resolvers = {
  Query: {
    hello: () => "Hello World!",
    me: async (_: any, __: any, context: { user?: IUser }) => {
      if (!context.user) {
        return null;
      }
      return context.user;
    },
    journeys: async () => {
      // TODO: Fetch from MongoDB
      return [];
    },
    journey: async (_: any, { id }: { id: string }) => {
      // TODO: Fetch from MongoDB
      return null;
    },
  },
  Mutation: {
    createJourney: async (_: any, args: { title: string; startDate: string; endDate: string }) => {
      // TODO: Save to MongoDB
      // TODO: Call Google Calendar API to check for overlap / create event if authorized
      console.log('Creating journey', args);
      return {
        id: '1',
        ...args,
        locations: []
      };
    },
    addLocationToJourney: async (_: any, args: { journeyId: string; name: string; lat?: number; lng?: number; googleMapsUrl?: string }) => {
      // TODO: If googleMapsUrl is provided (especially short links like goo.gl),
      // we need to resolve the URL to get lat/lng coordinates if they aren't provided.
      // This might involve making a fetch request to the short URL and parsing the redirect.
      console.log('Adding location', args);
      return {
        id: '1',
        name: args.name,
        lat: args.lat || 0,
        lng: args.lng || 0,
        googleMapsUrl: args.googleMapsUrl
      };
    },
    loginWithGoogle: async (_: any, { code }: { code: string }, context: { res: any }) => {
      try {
        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Fetch user information from Google using the id_token or googleapis
        const ticket = await client.verifyIdToken({
          idToken: tokens.id_token!,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error('Failed to get payload from Google token');
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email || !name) {
             throw new Error('Google account missing email or name');
        }

        // Upsert user in database
        let user = await User.findOne({ googleId });
        if (!user) {
          user = new User({
            googleId,
            email,
            name,
            picture,
            googleRefreshToken: tokens.refresh_token,
          });
          await user.save();
        } else {
          // Update refresh token if provided
          if (tokens.refresh_token) {
            user.googleRefreshToken = tokens.refresh_token;
          }
          user.name = name;
          user.picture = picture;
          await user.save();
        }

        // Create JWT
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

        // Set HttpOnly cookie
        context.res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return user;
      } catch (error) {
        console.error('Google login error:', error);
        throw new Error('Failed to authenticate with Google');
      }
    },
  },
};
