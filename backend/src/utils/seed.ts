import mongoose from 'mongoose';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Destination } from '../models/Destination';
import { Plan } from '../models/Plan';
import { Place } from '../models/Place';
import { ScheduledActivity } from '../models/ScheduledActivity';

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

  // Create mock categories
  const catEntertainment = await Category.create({ name: 'Entertainment' });
  const catDining = await Category.create({ name: 'Dining' });
  const catSightseeing = await Category.create({ name: 'Sightseeing' });
  const catAccommodation = await Category.create({ name: 'Accommodation' });

  // Create mock destinations
  const destHcmc = await Destination.create({ name: 'Ho Chi Minh City' });
  const destDalat = await Destination.create({ name: 'Da Lat' });

  // Create mock plans
  const now = new Date();

  const plan1 = await Plan.create({
    title: 'Weekend Getaway',
    startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    destinations: [destDalat._id],
    userId: mockUser._id,
  });

  // Create mock places
  const place1 = await Place.create({
    name: 'Dalat Palace Heritage Hotel',
    planId: plan1._id,
    destinationId: destDalat._id,
    categoryId: catAccommodation._id,
    priceRange: '2,000,000 - 5,000,000 VND',
    reviewLinks: ['https://example.com/review1'],
    notes: 'Beautiful French colonial architecture',
    visitStatus: 'PLANNED',
  });

  const place2 = await Place.create({
    name: 'Lien Hoa Bakery',
    planId: plan1._id,
    destinationId: destDalat._id,
    categoryId: catDining._id,
    priceRange: '50,000 - 150,000 VND',
    reviewLinks: [],
    notes: 'Must try the bánh mì',
    visitStatus: 'VISITED',
  });

  // Create scheduled activity
  await ScheduledActivity.create({
    placeId: place2._id,
    startTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
  });

  console.log('Mock data seeded successfully.');

  return { mockUser };
};
