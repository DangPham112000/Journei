import mongoose, { Schema, Document } from 'mongoose';
import { IPlan } from './Plan';
import { IDestination } from './Destination';
import { ICategory } from './Category';

export interface IPlace extends Document {
  name: string;
  planId: mongoose.Types.ObjectId | IPlan;
  destinationId: mongoose.Types.ObjectId | IDestination;
  categoryId: mongoose.Types.ObjectId | ICategory;
  priceRange?: string;
  reviewLinks: string[];
  notes?: string;
  visitStatus: 'PLANNED' | 'VISITED';
}

const PlaceSchema: Schema = new Schema({
  name: { type: String, required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  priceRange: { type: String },
  reviewLinks: [{ type: String }],
  notes: { type: String },
  visitStatus: { type: String, enum: ['PLANNED', 'VISITED'], default: 'PLANNED' },
}, { timestamps: true });

export const Place = mongoose.model<IPlace>('Place', PlaceSchema);
