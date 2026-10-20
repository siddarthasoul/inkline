"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentOwner } from "@/hooks/queries/useAuth";
import { useOwnerArticles } from "../../hooks/queries/useOwnerArticles";
import {
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
} from "@/hooks/mutations/useArticleMutations";
import { useLogout } from "@/hooks/mutations/useAuthMutations";
import { ApiError } from "@/lib/api-errors";
import type { ArticleStatus } from "@/types/article";

type Filter = "all" | ArticleStatus;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const router = useRouter();
  const ownerQuery = useCurrentOwner();
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const articlesQuery = useOwnerArticles({ page: 1, limit: 100 });
  const publish = usePublishArticle();
  const unpublish = useUnpublishArticle();
  const remove = useDeleteArticle();
  const logout = useLogout();

  useEffect(() => {
    if (ownerQuery.isError) {
      router.replace("/login");
    }
  }, [ownerQuery.isError, router]);

  const articles = articlesQuery.data?.items ?? [];
  const filteredArticles =
    filter === "all"
      ? articles
      : articles.filter((article) => article.status === filter);

  const drafts = articles.filter((article) => article.status === "draft").length;
  const published = articles.filter(
    (article) => article.status === "published",
  ).length;

  async function runAction(action: () => Promise<unknown>, success: string) {
    setNotice("");
    setActionError("");

    try {
      await action();
      setNotice(success);
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Action failed. Please try again.",
      );
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;

    await runAction(
      () => remove.mutateAsync(id),
      "Article deleted.",
    );
  }

  if (ownerQuery.isPending || (ownerQuery.isError && !ownerQuery.isFetched)) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-message">Checking owner access…</p>
      </main>
    );
  }

  if (ownerQuery.isError) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-message">Redirecting to sign in…</p>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <Link href="/" className="login-brand">
          inkline<span>.</span>
        </Link>
        <div className="dashboard-account">
          <span>{ownerQuery.data?.email}</span>
          <button
            className="dashboard-logout"
            disabled={logout.isPending}
            onClick={async () => {
              try {
                await logout.mutateAsync();
                router.replace("/login");
              } catch (error) {
                setActionError(
                  error instanceof ApiError
                    ? error.message
                    : "Could not sign out. Please try again.",
                );
              }
            }}
          >
            {logout.isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <p className="login-eyebrow">YOUR WORKSPACE</p>
            <h1 className="dashboard-title">Stories, managed.</h1>
            <p className="dashboard-subtitle">
              Write, refine, and publish your ideas.
            </p>
          </div>
          <Link href="/dashboard/new" className="dashboard-create">
            + Write an article
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <span>All articles</span>
            <strong>{articles.length}</strong>
          </div>
          <div className="dashboard-stat">
            <span>Published</span>
            <strong>{published}</strong>
          </div>
          <div className="dashboard-stat">
            <span>Drafts</span>
            <strong>{drafts}</strong>
          </div>
        </div>

        {notice && <p className="dashboard-notice" role="status">{notice}</p>}
        {actionError && <p className="login-error" role="alert">{actionError}</p>}

        <div className="dashboard-list-heading">
          <h2>Your articles</h2>
          <div className="dashboard-filters" aria-label="Filter articles">
            {(["all", "published", "draft"] as const).map((value) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {value === "all"
                  ? "All"
                  : value === "published"
                    ? "Published"
                    : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        {articlesQuery.isPending ? (
          <p className="dashboard-message">Loading your articles…</p>
        ) : articlesQuery.isError ? (
          <div className="dashboard-empty">
            <p>We couldn&apos;t load your articles.</p>
            <button onClick={() => articlesQuery.refetch()}>Try again</button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="dashboard-empty">
            <p>
              {filter === "all"
                ? "You haven&apos;t written any articles yet."
                : `No ${filter} articles yet.`}
            </p>
            {filter === "all" && (
              <Link href="/dashboard/new">Write your first article →</Link>
            )}
          </div>
        ) : (
          <div className="dashboard-article-list">
            {filteredArticles.map((article) => (
              <article className="dashboard-article" key={article._id}>
                <div className="dashboard-article-info">
                  <span
                    className={`dashboard-status ${article.status}`}
                  >
                    {article.status}
                  </span>
                  <h3>{article.title}</h3>
                  <p>
                    Updated {formatDate(article.updatedAt)}
                    {article.publishedAt
                      ? ` · Published ${formatDate(article.publishedAt)}`
                      : ""}
                  </p>

                  <div className="dashboard-article-stats">
                    <span>◉ {article.views ?? 0} views</span>
                    <span>♥ {article.likes ?? 0} likes</span>
                  </div>

                </div>
                <div className="dashboard-article-actions">
                  <Link href={`/dashboard/edit/${article._id}`}>Edit</Link>
                  {article.status === "draft" ? (
                    <button
                      disabled={publish.isPending}
                      onClick={() =>
                        void runAction(
                          () => publish.mutateAsync(article._id),
                          `"${article.title}" published.`,
                        )
                      }
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      disabled={unpublish.isPending}
                      onClick={() =>
                        void runAction(
                          () => unpublish.mutateAsync(article._id),
                          `"${article.title}" moved to drafts.`,
                        )
                      }
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    className="dashboard-delete"
                    disabled={remove.isPending}
                    onClick={() => void handleDelete(article._id, article.title)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
