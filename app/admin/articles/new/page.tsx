import ArticleForm from "../ArticleForm";
import { createArticleAction } from "../actions";
import { requireAdminUser } from "../../../../lib/admin/auth";

export default async function NewArticlePage() {
  await requireAdminUser();

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Articles / New</p>
        <h1>新建文章</h1>
        <ArticleForm action={createArticleAction} submitLabel="保存文章" />
      </section>
    </main>
  );
}
