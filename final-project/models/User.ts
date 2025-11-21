import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  userID?: string;
  name?: string;
  email?: string;
  originalEmail?: string;
  emailVerified?: Date;
  image?: string;
  photos?: string[];
  bio?: string;
  personality?: string[];
  interests?: string[];
  appearance?: string[];
  age?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userID: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 1,
      maxlength: 15,
      match: /^[a-zA-Z0-9_]+$/,
    },
    name: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    originalEmail: String,
    emailVerified: Date,
    image: String,
    photos: [String],
    bio: String,
    personality: [String],
    interests: [String],
    appearance: [String],
    age: Number,
    location: String,
  },
  {
    timestamps: true,
  }
);

// 建立索引
UserSchema.index({ userID: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ originalEmail: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;




