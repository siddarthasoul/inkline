export function LoadingState() {
  return (
    <div
      className="article-grid"
      aria-label="Loading articles"
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="article-skeleton" key={index}>
          <div className="skeleton-line skeleton-category" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-title-short" />
          <div className="skeleton-line skeleton-excerpt" />
          <div className="skeleton-line skeleton-excerpt-short" />
          <div className="skeleton-line skeleton-meta" />
        </div>
      ))}
    </div>
  );
}
