import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  lastMessageAt?: Date;
  isFriend: boolean;
  status: 'active' | 'closed';
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessageAt: Date,
    isFriend: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// 確保 participants 只有兩個用戶
ChatSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    return next(new Error('Chat must have exactly 2 participants'));
  }
  next();
});

// 建立索引
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: 1 });
ChatSchema.index({ status: 1, lastMessageAt: 1 });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;




