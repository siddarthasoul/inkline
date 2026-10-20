import { Suspense } from "react";
import ArticleDetailClient from "./ArticleDetailClient";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="editor-page">
          <p className="dashboard-message">Loading story…</p>
        </main>
      }
    >
      <ArticleRoute params={params} />
    </Suspense>
  );
}

async function ArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleDetailClient slug={slug} />;
}
