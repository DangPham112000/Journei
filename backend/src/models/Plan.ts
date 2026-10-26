import mongoose, { Schema, Document } from 'mongoose';
import { IDestination } from './Destination';

export interface IPlan extends Document {
  title: string;
  startDate: Date;
  endDate: Date;
  destinations: mongoose.Types.ObjectId[] | IDestination[];
  /** Clerk user id of the owner; the user's details are in core.users (DAN-93). */
  userId: string;
  googleEventId?: string;
  /** Whether the plan's activities are copied to the owner's Event Manager calendar (DAN-95). */
  calendarSync: boolean;
}

const PlanSchema: Schema = new Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination', required: true }],
  userId: { type: String, required: true, index: true },
  googleEventId: { type: String },
  calendarSync: { type: Boolean, default: false },
}, { timestamps: true });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
