import mongoose, { Schema, Document } from 'mongoose';

export interface IFeed extends Document<string> {
  _id: string;
  title: string;
  siteUrl: string;
  feedUrl: string;
  description?: string;
  folder: string;
  unreadCount: number;
  lastFetchedAt: string;
  iconUrl?: string;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedSchema = new Schema<IFeed>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    siteUrl: { type: String, required: true },
    feedUrl: { type: String, required: true },
    description: { type: String, default: '' },
    folder: { type: String, default: 'General' },
    unreadCount: { type: Number, default: 0 },
    lastFetchedAt: { type: String, default: () => new Date().toISOString() },
    iconUrl: { type: String },
    isFavorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    _id: false, // We manage _id ourselves (string-based)
  }
);

FeedSchema.index({ folder: 1 });
FeedSchema.index({ feedUrl: 1 }, { unique: true });

export const Feed = mongoose.model<IFeed>('Feed', FeedSchema);
