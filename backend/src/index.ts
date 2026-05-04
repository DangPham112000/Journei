import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';

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

async function startServer() {
  // Connect to MongoDB
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/journey-planner';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
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
