import mongoose, { Schema, Document } from 'mongoose';
import { IPlace } from './Place';

export interface IScheduledActivity extends Document {
  placeId: mongoose.Types.ObjectId | IPlace;
  startTime: Date;
  endTime: Date;
  /** The matching event in another app; a reference, not a copy (DAN-95). */
  calendarEvent?: { app: 'event-manager'; id: string } | null;
}

const ScheduledActivitySchema: Schema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  calendarEvent: {
    type: new Schema(
      { app: { type: String, enum: ['event-manager'], required: true }, id: { type: String, required: true } },
      { _id: false },
    ),
    default: null,
  },
}, { timestamps: true });

export const ScheduledActivity = mongoose.model<IScheduledActivity>('ScheduledActivity', ScheduledActivitySchema);
