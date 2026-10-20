"use client";

import Link from "next/link";

import { usePublishedArticle } from "@/hooks/queries/useArticles";
import { useArticleLikes } from "@/hooks/queries/useArticleLikes";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LoadingState } from "@/components/ui/LoadingState";

export default function ArticleDetailClient({ slug }: { slug: string }) {
  const articleQuery = usePublishedArticle(slug);
  const { likesQuery, likeMutation } = useArticleLikes(slug);

  return (
    <>
      <SiteHeader />

      <main className="article-detail-page">
        <div className="article-detail-container">
          <Link href="/" className="editor-back-link">
            ← Back to Inkline
          </Link>

          {articleQuery.isPending ? (
            <LoadingState />
          ) : articleQuery.isError || !articleQuery.data ? (
            <section className="article-detail-message">
              <div className="empty-state">
                <h1>Story unavailable.</h1>
                <p>
                  This story may not exist or may not be published yet.
                </p>
              </div>
              <Link href="/" className="dashboard-create">
                Explore Inkline
              </Link>
            </section>
          ) : (
            <article className="article-detail">
              <p className="login-eyebrow">INKLINE JOURNAL</p>

              <h1 className="article-detail-title">
                {articleQuery.data.title}
              </h1>

              {articleQuery.data.excerpt && (
                <p className="article-detail-excerpt">
                  {articleQuery.data.excerpt}
                </p>
              )}

              <div className="article-detail-meta">
                {articleQuery.data.publishedAt
                  ? new Intl.DateTimeFormat("en", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(articleQuery.data.publishedAt))
                  : "Inkline Journal"}
              </div>

              <div className="article-likes-row">
                <button
                  type="button"
                  className={`article-like-button${likesQuery.data?.liked ? " is-liked" : ""}`}
                  aria-pressed={likesQuery.data?.liked ?? false}
                  aria-label={
                    likesQuery.data?.liked ? "Unlike this article" : "Like this article"
                  }
                  disabled={
                    likesQuery.isPending ||
                    likesQuery.isError ||
                    likeMutation.isPending
                  }
                  onClick={() => {
                    if (likesQuery.data) {
                      likeMutation.mutate(likesQuery.data.liked);
                    }
                  }}
                >
                  <span aria-hidden="true">
                    {likesQuery.data?.liked ? "♥" : "♡"}
                  </span>
                  <span>
                    {likesQuery.isPending
                      ? "Loading likes…"
                      : likesQuery.isError
                        ? "Likes unavailable"
                        : `${likesQuery.data?.count ?? 0} ${
                            likesQuery.data?.count === 1 ? "like" : "likes"
                          }`}
                  </span>
                </button>

                {likeMutation.isError && (
                  <p className="article-likes-error" role="status">
                    Couldn&apos;t update your like. Please try again.
                  </p>
                )}
              </div>

              <div className="article-detail-content">
                {articleQuery.data.content}
              </div>
            </article>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
