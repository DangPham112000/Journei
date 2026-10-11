import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId?: string;
  googleId?: string;
  email: string;
  name: string;
  picture?: string;
  refreshToken?: string;
}

const UserSchema: Schema = new Schema({
  // Clerk user id ("user_..."); set on the user's first Clerk sign-in.
  clerkId: { type: String, unique: true, sparse: true },
  // Kept for users from the old Google login and Clerk users who sign in with Google.
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  picture: { type: String },
  refreshToken: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
