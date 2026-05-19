import dotenv from 'dotenv';
dotenv.config();

// Apply mock configuration before importing the main app
import nock from 'nock';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function startMockLayer() {
  console.log('Initializing Mock Layer...');

  // Set MONGODB_URI to use the in-memory database
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  // Set fake tokens
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'fake-client-id';
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'fake-client-secret';

  // We need to wait for mongoose to actually connect before seeding the database.
  // The easiest way is to let index.ts start the server, then we run seedMockData.
  // But wait, seedMockData is async, so we'll do it later or let index.ts start the connection.

  // Actually, we can just intercept Google API requests using Nock
  nock('https://oauth2.googleapis.com')
    .persist()
    .post('/token')
    .reply(200, {
      id_token: 'fake-mock-id-token',
      refresh_token: 'fake-mock-refresh-token',
      access_token: 'fake-access-token',
      expires_in: 3600,
      token_type: 'Bearer',
    });

  nock('https://oauth2.googleapis.com')
    .persist()
    .get('/tokeninfo')
    .query(true) // any query params
    .reply(200, {
      sub: 'mock-google-id-12345',
      email: 'mockuser@example.com',
      name: 'Mock User',
      picture: 'https://via.placeholder.com/150',
    });

  // Since google-auth-library verifies certificates cryptographically, we can't easily mock `/certs`.
  // The easiest way to mock `verifyIdToken` is to intercept the method on OAuth2Client prototype.
  const { OAuth2Client } = require('google-auth-library');
  OAuth2Client.prototype.verifyIdToken = async function() {
    return {
      getPayload: () => ({
        sub: 'mock-google-id-12345',
        email: 'mockuser@example.com',
        name: 'Mock User',
        picture: 'https://via.placeholder.com/150',
      })
    };
  };

  nock('https://www.googleapis.com')
    .persist()
    .get('/oauth2/v1/certs')
    .reply(200, {
      "mock-key-id": "mock-certificate"
    });

  // Mock Calendar API calls if they happen
  nock('https://www.googleapis.com')
    .persist()
    .get(/\/calendar\/v3\/.*/)
    .reply(200, {
      items: [
        {
          id: 'mock-event-id',
          summary: 'Mock Google Calendar Event',
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
        }
      ]
    })
    .post(/\/calendar\/v3\/.*/)
    .reply(200, {
      id: 'mock-created-event-id',
      summary: 'Mock Created Event',
    });

  console.log('Google API mocks applied.');

  // Import original index to start the app natively
  // Since index.ts contains an async IIFE, it will run immediately and use our MONGODB_URI and Nock overrides.

  // Note: we can't seed immediately because mongoose might not be connected yet.
  // But wait, index.ts connects to mongodb and console.logs. We could wait a couple of seconds or connect here first.
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to In-Memory MongoDB in wrapper');

  const { seedMockData } = require('./utils/seed');
  await seedMockData();

  // Now we start the main app. We should disconnect first so index.ts can connect, or let index.ts share the connection.
  // Actually, mongoose shares connections by default if we just call it. But index.ts calls `mongoose.connect()` which might throw if already connected.
  await mongoose.disconnect();

  // Load the main index
  require('./index.ts');
}

startMockLayer().catch((err) => {
  console.error('Failed to initialize mock layer:', err);
});
