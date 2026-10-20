import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from 'mongoose';

export type ArticleStatus = 'draft' | 'published';

export interface IArticle {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: ArticleStatus;
  author: Types.ObjectId;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleDocument = HydratedDocument<IArticle>;

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 320,
    },
    content: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Article content cannot be empty',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw',
  },
);

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ author: 1, updatedAt: -1 });

export const Article =
  (mongoose.models.Article as Model<IArticle> | undefined) ??
  mongoose.model<IArticle>('Article', articleSchema);