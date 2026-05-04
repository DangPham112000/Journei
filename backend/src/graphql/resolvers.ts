import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage' // required for flow: 'auth-code' in react-oauth/google
);

export const resolvers = {
  Query: {
    journeys: async () => {
      // TODO: Fetch from MongoDB
      return [];
    },
    journey: async (_: any, { id }: { id: string }) => {
      // TODO: Fetch from MongoDB
      return null;
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        return null;
      }
      return await User.findById(context.user.id);
    }
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

        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'your_jwt_secret', {
          expiresIn: '7d',
        });

        // Set the JWT as an HttpOnly cookie
        if (context.res) {
          context.res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
        }

        return user;
      } catch (error) {
        console.error('Error during Google login:', error);
        throw new Error('Failed to login with Google');
      }
    }
  },
};
