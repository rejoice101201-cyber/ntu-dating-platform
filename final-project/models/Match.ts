import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  userId: mongoose.Types.ObjectId;
  matchedUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'liked' | 'passed';
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'liked', 'passed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// 確保用戶不能對同一個人有多個配對記錄
MatchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });
MatchSchema.index({ userId: 1, status: 1 });
MatchSchema.index({ matchedUserId: 1, status: 1 });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;





