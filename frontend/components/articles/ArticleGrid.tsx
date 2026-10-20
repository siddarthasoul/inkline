import type { Article } from '@/types/article';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: Article[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <div className="article-grid">
      {articles.map((article, index) => (
        <ArticleCard
          key={article._id}
          article={article}
          index={index}
        />
      ))}
    </div>
  );
}
