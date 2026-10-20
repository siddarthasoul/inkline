import Link from 'next/link';
import type { Article } from '@/types/article';

interface ArticleCardProps {
  article: Article;
  index: number;
}

function formatDate(value: string | null): string {
  if (!value) return 'Not published';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Recently published';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <article className="article-card">
      <div className={`article-card-art art-variant-${index % 4}`}>
        <span className="art-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="art-symbol" aria-hidden="true">
          {['✳', '◒', '✳', '◌'][index % 4]}
        </span>
        <span className="art-label">INKLINE JOURNAL</span>
      </div>

      <div className="article-card-body">
        <div className="article-meta">
          <time dateTime={article.publishedAt ?? undefined}>
            {formatDate(article.publishedAt)}
          </time>
          <span>{readingTime(article.content)} min read</span>
        </div>

        <h3 className="article-card-title">
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h3>

        <p className="article-card-excerpt">
          {article.excerpt?.trim() || 'Open this story to explore the full article.'}
        </p>

        <Link
          href={`/articles/${encodeURIComponent(article.slug)}`}
          className="article-read-link"
          aria-label={`Read ${article.title}`}
        >
          Read story <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
