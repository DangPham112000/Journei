import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { processAssistantMessage } from '../utils/ai';
import dotenv from 'dotenv';
dotenv.config();

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage', // required for flow: 'auth-code' in react-oauth/google
);

const requireAuth = (resolver: any) => async (parent: any, args: any, context: any, info: any) => {
  if (!context.user) throw new Error('Not authenticated');
  return resolver(parent, args, context, info);
};

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        return null;
      }
      return await User.findById(context.user.id);
    },
    events: requireAuth(async () => {
      return await Event.find()
        .populate('creator')
        .populate('followers')
        .populate('participants')
        .sort({ startDate: 1 });
    }),
    myEvents: requireAuth(async (_: any, __: any, context: any) => {
      return await Event.find({ creator: context.user.id })
        .populate('creator')
        .populate('followers')
        .populate('participants')
        .sort({ startDate: 1 });
    }),
    joinedEvents: requireAuth(async (_: any, __: any, context: any) => {
      return await Event.find({ participants: context.user.id })
        .populate('creator')
        .populate('followers')
        .populate('participants')
        .sort({ startDate: 1 });
    }),
    followedEvents: requireAuth(async (_: any, __: any, context: any) => {
      // Events where the user is in followers but NOT in participants
      return await Event.find({
        followers: context.user.id,
        participants: { $ne: context.user.id },
      })
        .populate('creator')
        .populate('followers')
        .populate('participants')
        .sort({ startDate: 1 });
    }),
  },
  Mutation: {
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

        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is not set');
        }

        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
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
    },
    createEvent: requireAuth(async (_: any, args: any, context: any) => {
      const eventArgs = {
        title: args.title,
        description: args.description,
        startDate: args.startDate,
        endDate: args.endDate,
        location: args.location,
        creator: context.user.id,
        followers: args.autoFollow ? [context.user.id] : [],
        participants: [],
      };

      const newEvent = await Event.create(eventArgs);
      return await Event.findById(newEvent._id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    updateEvent: requireAuth(async (_: any, args: any, context: any) => {
      const event = await Event.findById(args.id);
      if (!event) throw new Error('Event not found');
      if (event.creator.toString() !== context.user.id)
        throw new Error('Not authorized to update this event');

      if (args.title) event.title = args.title;
      if (args.description !== undefined) event.description = args.description;
      if (args.startDate) event.startDate = args.startDate;
      if (args.endDate) event.endDate = args.endDate;
      if (args.location !== undefined) event.location = args.location;

      await event.save();
      return await Event.findById(event._id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    deleteEvent: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const event = await Event.findById(id);
      if (!event) throw new Error('Event not found');
      if (event.creator.toString() !== context.user.id)
        throw new Error('Not authorized to delete this event');

      await Event.findByIdAndDelete(id);
      return true;
    }),
    joinEvent: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const event = await Event.findByIdAndUpdate(id, {
        $addToSet: {
          participants: context.user.id,
          followers: context.user.id,
        },
      });

      if (!event) throw new Error('Event not found');

      return await Event.findById(id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    leaveEvent: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const event = await Event.findByIdAndUpdate(id, {
        $pull: { participants: context.user.id },
        $addToSet: { followers: context.user.id },
      });

      if (!event) throw new Error('Event not found');

      return await Event.findById(id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    followEvent: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const event = await Event.findByIdAndUpdate(id, {
        $addToSet: { followers: context.user.id },
      });

      if (!event) throw new Error('Event not found');

      return await Event.findById(id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    unfollowEvent: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
      const event = await Event.findByIdAndUpdate(id, {
        $pull: {
          followers: context.user.id,
          participants: context.user.id,
        },
      });

      if (!event) throw new Error('Event not found');

      return await Event.findById(id)
        .populate('creator')
        .populate('followers')
        .populate('participants');
    }),
    askAssistant: requireAuth(async (_: any, { message, history }: { message: string, history?: any[] }, context: any) => {
      try {
        const response = await processAssistantMessage(context.user.id, message, history);
        return response;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to process assistant message');
      }
    })
  },
};
