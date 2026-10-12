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

  // Mock Mode has no Clerk: index.ts treats every request as the seeded mock user.

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

  console.log('Google Calendar API mocks applied.');

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
