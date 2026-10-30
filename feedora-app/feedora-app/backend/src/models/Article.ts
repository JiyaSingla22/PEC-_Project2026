import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document<string> {
  _id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  link: string;
  author?: string;
  publishedAt: string;
  contentRaw: string;
  contentClean: string;
  excerpt: string;
  paragraphs: string[];
  isRead: boolean;
  isBookmarked: boolean;
  estimatedReadMinutes: number;
  audioProgressSeconds?: number;
  audioDurationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    _id: { type: String, required: true },
    feedId: { type: String, required: true, ref: 'Feed' },
    feedTitle: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    author: { type: String },
    publishedAt: { type: String, required: true },
    contentRaw: { type: String, default: '' },
    contentClean: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    paragraphs: { type: [String], default: [] },
    isRead: { type: Boolean, default: false },
    isBookmarked: { type: Boolean, default: false },
    estimatedReadMinutes: { type: Number, default: 1 },
    audioProgressSeconds: { type: Number },
    audioDurationSeconds: { type: Number },
  },
  {
    timestamps: true,
    _id: false,
  }
);

ArticleSchema.index({ feedId: 1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ isRead: 1 });
ArticleSchema.index({ isBookmarked: 1 });
ArticleSchema.index({ feedId: 1, link: 1 }, { unique: true });

export const Article = mongoose.model<IArticle>('Article', ArticleSchema);
