import mongoose, { Schema, Document } from 'mongoose';

export interface IAudioQueue extends Document<string> {
  _id: string;
  articleId: string;
  title: string;
  feedTitle: string;
  excerpt: string;
  estimatedReadMinutes: number;
  currentPositionSeconds: number;
  dateAdded: string;
}

const AudioQueueSchema = new Schema<IAudioQueue>(
  {
    _id: { type: String, required: true },
    articleId: { type: String, required: true, ref: 'Article' },
    title: { type: String, required: true },
    feedTitle: { type: String, required: true },
    excerpt: { type: String, default: '' },
    estimatedReadMinutes: { type: Number, default: 1 },
    currentPositionSeconds: { type: Number, default: 0 },
    dateAdded: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const AudioQueue = mongoose.model<IAudioQueue>('AudioQueue', AudioQueueSchema);
