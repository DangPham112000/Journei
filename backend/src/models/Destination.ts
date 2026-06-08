import mongoose, { Schema, Document } from 'mongoose';

export interface IDestination extends Document {
  name: string;
}

const DestinationSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

export const Destination = mongoose.model<IDestination>('Destination', DestinationSchema);
