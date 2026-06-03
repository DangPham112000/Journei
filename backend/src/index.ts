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
import pinoHttp from 'pino-http';
import { resolvers } from './graphql/resolvers';
import { logger } from './utils/logger';
import { graphqlLoggerPlugin } from './utils/graphqlLogger';

const typeDefs = readFileSync(path.join(__dirname, 'schema.gql'), 'utf8');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(pinoHttp({ logger }));
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
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error({ err: error }, 'Error connecting to MongoDB');
  }

  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [graphqlLoggerPlugin],
  });

  await server.start();

  // Apply GraphQL middleware
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
      let user = null;
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set');
          }
          user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          logger.error({ err: error }, 'Invalid token');
        }
      }
      return { user, req, res };
    },
  }));

  app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`);
    logger.info(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
