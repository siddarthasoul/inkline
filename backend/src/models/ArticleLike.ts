import mongoose, { Schema, type Types } from 'mongoose';

export interface IArticleLike {
  article: Types.ObjectId;
  visitor: string;
  createdAt: Date;
  updatedAt: Date;
}

const articleLikeSchema = new Schema<IArticleLike>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    visitor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

articleLikeSchema.index(
  { article: 1, visitor: 1 },
  { unique: true, name: 'unique_article_visitor_like' },
);

const ArticleLike =
  (mongoose.models.ArticleLike as mongoose.Model<IArticleLike> | undefined) ??
  mongoose.model<IArticleLike>('ArticleLike', articleLikeSchema);

export default ArticleLike;
