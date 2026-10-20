"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Article } from "@/types/article";

import { useUpdateArticle } from "@/hooks/mutations/useArticleMutations";
import { useCurrentOwner } from "@/hooks/queries/useAuth";
import { useOwnerArticle } from "@/hooks/queries/useOwnerArticles";
import { ApiError } from "@/lib/api-errors";

export default function EditArticleClient({ id }: { id: string }) {
  const router = useRouter();
  const ownerQuery = useCurrentOwner();
  const articleQuery = useOwnerArticle(
    id,
    !ownerQuery.isPending && !ownerQuery.isError,
  );


  useEffect(() => {
    if (ownerQuery.isError) {
      router.replace("/login");
    }
  }, [ownerQuery.isError, router]);


  if (ownerQuery.isPending || (!ownerQuery.isError && articleQuery.isPending)) {
    return (
      <main className="editor-page">
        <p className="dashboard-message">Loading article…</p>
      </main>
    );
  }

  if (ownerQuery.isError) {
    return (
      <main className="editor-page">
        <p className="dashboard-message">Redirecting to sign in…</p>
      </main>
    );
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <main className="editor-page">
        <header className="editor-topbar">
          <Link href="/" className="login-brand">
            inkline<span>.</span>
          </Link>
          <Link href="/dashboard" className="editor-back-link">
            ← Back to dashboard
          </Link>
        </header>

        <section className="editor-container">
          <h1 className="editor-title">Article unavailable.</h1>
          <p className="editor-description">
            This article could not be loaded. It may have been deleted, or the
            request may have failed.
          </p>
          <Link href="/dashboard" className="dashboard-create">
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return <ArticleEditForm key={articleQuery.data._id} article={articleQuery.data} />;
}

function ArticleEditForm({ article }: { article: Article }) {
  const router = useRouter();
  const updateArticle = useUpdateArticle();

  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [content, setContent] = useState(article.content);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanExcerpt = excerpt.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      setError("Please enter both a title and article content.");
      return;
    }

    try {
      await updateArticle.mutateAsync({
        id: article._id,
        input: {
          title: cleanTitle,
          excerpt: cleanExcerpt,
          content: cleanContent,
        },
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't update the article. Please try again.",
      );
    }
  }

  return (
    <main className="editor-page">
      <header className="editor-topbar">
        <Link href="/" className="login-brand">
          inkline<span>.</span>
        </Link>
        <Link href="/dashboard" className="editor-back-link">
          ← Back to dashboard
        </Link>
      </header>

      <section className="editor-container">
        <p className="login-eyebrow">THE WRITING ROOM</p>
        <h1 className="editor-title">Edit your story.</h1>
        <p className="editor-description">
          Update your article and save your changes. Existing publication status
          is preserved.
        </p>

        <form className="article-editor-form" onSubmit={handleSubmit}>
          <label className="editor-field">
            <span>Article title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your story a title"
              maxLength={180}
              required
            />
          </label>

          <label className="editor-field">
            <span>Short excerpt <small>Optional</small></span>
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="A short introduction for your readers"
              rows={3}
              maxLength={500}
            />
          </label>

          <label className="editor-field">
            <span>Article content</span>
            <textarea
              className="editor-content-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Start writing here…"
              rows={16}
              required
            />
          </label>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="editor-form-footer">
            <span className="editor-draft-label">
              <span className="editor-draft-dot" />
              {article.status === "published"
                ? "Published article"
                : "Draft"}
            </span>

            <button
              className="dashboard-create"
              type="submit"
              disabled={updateArticle.isPending}
            >
              {updateArticle.isPending ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
