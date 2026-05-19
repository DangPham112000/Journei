import mongoose from 'mongoose';
import { User } from '../models/User';
import { Event } from '../models/Event';

export const seedMockData = async () => {
  console.log('Seeding mock data for development mode...');

  // Create mock user
  const mockUser = await User.create({
    googleId: 'mock-google-id-12345',
    email: 'mockuser@example.com',
    name: 'Mock User',
    picture: 'https://via.placeholder.com/150',
    refreshToken: 'mock-refresh-token',
  });

  // Create mock events
  const now = new Date();

  await Event.create({
    title: 'Team Sync',
    description: 'Weekly team synchronization meeting',
    startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(now.getTime() + 25 * 60 * 60 * 1000),
    location: 'Virtual',
    creator: mockUser._id,
    followers: [],
    participants: [mockUser._id],
  });

  await Event.create({
    title: 'Project Planning',
    description: 'Q3 Project Planning Session',
    startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'Main Conference Room',
    creator: mockUser._id,
    followers: [],
    participants: [mockUser._id],
  });

  console.log('Mock data seeded successfully.');

  return { mockUser };
};
