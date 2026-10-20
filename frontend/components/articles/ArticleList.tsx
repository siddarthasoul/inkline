'use client';

import { useState } from 'react';

import { usePublishedArticles } from '@/hooks/queries/useArticles';
import { ArticleGrid } from './ArticleGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 6;

export function ArticleList() {
  const [page, setPage] = useState(1);
  const query = usePublishedArticles(page, PAGE_SIZE);

  if (query.isPending) {
    return <LoadingState />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const result = query.data;

  if (result.items.length === 0 && page > 1) {
    return (
      <div className="article-list">
        <p className="inline-notice">
          No stories on this page. Return to the first page.
        </p>
        <Pagination
          page={page}
          totalPages={result.pagination.totalPages}
          onPageChange={setPage}
        />
      </div>
    );
  }

  if (result.items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="article-list">
      <div className="results-row">
        <p>
          Showing <strong>{result.items.length}</strong> stories
        </p>
        <span>{result.pagination.total} published in total</span>
      </div>

      <ArticleGrid articles={result.items} />

      <Pagination
        page={result.pagination.page}
        totalPages={result.pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
