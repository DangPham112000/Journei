import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';
import pinoHttp from 'pino-http';
import { resolvers } from './graphql/resolvers';
import { logger } from './utils/logger';
import { graphqlLoggerPlugin } from './utils/graphqlLogger';
import { getUserFromAuthHeader, type AuthUser } from './auth';
import { User } from './models/User';
import { createMcpRouter } from './mcp';

const typeDefs = readFileSync(path.join(__dirname, 'schema.gql'), 'utf8');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(pinoHttp({ logger }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Update with frontend URL if different
}));
app.use(express.json());

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
    // Replaces the old non-sparse unique googleId index, so users who sign in
    // without Google (no googleId) do not collide on null.
    await User.syncIndexes();
  } catch (error) {
    logger.error({ err: error }, 'Error connecting to MongoDB');
  }

  const isMockMode = process.env.MOCK_MODE === 'true';
  if (!isMockMode && !process.env.CLERK_SECRET_KEY) {
    logger.warn('CLERK_SECRET_KEY not set; every request will be unauthenticated');
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
      let user: AuthUser | null;
      if (isMockMode) {
        // Mock Mode has no Clerk: every request is the seeded mock user.
        const mockUser = await User.findOne({ email: 'mockuser@example.com' });
        user = mockUser && { id: String(mockUser._id), email: mockUser.email };
      } else {
        user = await getUserFromAuthHeader(req.headers.authorization);
      }
      return { user, req, res };
    },
  }));

  // MCP server: lets users connect their own AI agent (Claude, Cursor, ...)
  app.use(createMcpRouter());

  app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`);
    logger.info(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
    logger.info(`MCP endpoint at http://localhost:${PORT}/mcp`);
  });
}

startServer().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
