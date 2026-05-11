import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  creator: mongoose.Types.ObjectId | IUser;
  followers: mongoose.Types.ObjectId[] | IUser[];
  participants: mongoose.Types.ObjectId[] | IUser[];
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
