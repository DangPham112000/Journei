import mongoose, { Schema, Document } from 'mongoose';
import { IPlace } from './Place';

export interface IScheduledActivity extends Document {
  placeId: mongoose.Types.ObjectId | IPlace;
  startTime: Date;
  endTime: Date;
}

const ScheduledActivitySchema: Schema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export const ScheduledActivity = mongoose.model<IScheduledActivity>('ScheduledActivity', ScheduledActivitySchema);
