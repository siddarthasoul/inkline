"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCreateArticle } from "@/hooks/mutations/useArticleMutations";
import { useCurrentOwner } from "@/hooks/queries/useAuth";
import { ApiError } from "@/lib/api-errors";

export default function NewArticlePage() {
  const router = useRouter();
  const ownerQuery = useCurrentOwner();
  const createArticle = useCreateArticle();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ownerQuery.isError) {
      router.replace("/login");
    }
  }, [ownerQuery.isError, router]);

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
      await createArticle.mutateAsync({
        title: cleanTitle,
        content: cleanContent,
        ...(cleanExcerpt ? { excerpt: cleanExcerpt } : {}),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't save the draft. Please try again.",
      );
    }
  }

  if (ownerQuery.isPending) {
    return (
      <main className="editor-page">
        <p className="dashboard-message">Checking owner access…</p>
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
        <h1 className="editor-title">Write a new story.</h1>
        <p className="editor-description">
          Start with an idea. You can review and publish your draft later.
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
              Saved as draft
            </span>

            <button
              className="dashboard-create"
              type="submit"
              disabled={createArticle.isPending}
            >
              {createArticle.isPending ? "Saving draft…" : "Save draft"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
