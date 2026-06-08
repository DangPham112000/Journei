import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IDestination } from './Destination';

export interface IPlan extends Document {
  title: string;
  startDate: Date;
  endDate: Date;
  destinations: mongoose.Types.ObjectId[] | IDestination[];
  userId: mongoose.Types.ObjectId | IUser;
  googleEventId?: string;
}

const PlanSchema: Schema = new Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination', required: true }],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  googleEventId: { type: String },
}, { timestamps: true });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
