import { Suspense } from "react";
import EditArticleClient from "./EditArticleClient";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="editor-page">
          <p className="dashboard-message">Loading editor…</p>
        </main>
      }
    >
      <EditArticleRoute params={params} />
    </Suspense>
  );
}

async function EditArticleRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditArticleClient id={id} />;
}
