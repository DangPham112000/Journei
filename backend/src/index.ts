import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';
import { resolvers } from './graphql/resolvers';

const typeDefs = readFileSync(path.join(__dirname, 'schema.gql'), 'utf8');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Update with frontend URL if different
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// TODO: Setup Google Calendar OAuth2 routes here
// Example:
// app.get('/auth/google', ...);
// app.get('/auth/google/callback', ...);

if (process.env.MOCK_MODE === 'true') {
  app.get('/auth/mock', async (req, res) => {
    try {
      const { User } = await import('./models/User');
      const mockUser = await User.findOne({ email: 'mockuser@example.com' });

      if (!mockUser) {
        return res.status(404).send('Mock user not found');
      }

      // Generate JWT for mock user
      const token = jwt.sign(
        { userId: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.status(200).json({ message: 'Mock login successful', user: mockUser });
    } catch (error) {
      console.error('Error logging in mock user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

async function startServer() {
  // Setup MongoDB Connection
  try {
    if (process.env.MOCK_MODE === 'true') {
      console.log('Starting in MOCK MODE with in-memory database');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      await mongoose.connect(mongoUri);
      console.log('Connected to In-Memory MongoDB');

      // Seed data
      const { seedMockData } = await import('./utils/seed');
      await seedMockData();
    } else {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/journey-planner';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }

  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apply GraphQL middleware
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      let user = null;
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        } catch (error) {
          console.error('Invalid token:', error);
        }
      }
      return { user, req, res };
    },
  }));

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
