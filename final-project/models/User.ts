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
      index: true,
    },
    name: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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

// 建立索引（userID 和 email 已經在字段定義中設置了 unique，會自動創建索引）
UserSchema.index({ originalEmail: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;





