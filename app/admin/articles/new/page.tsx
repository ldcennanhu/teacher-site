import ArticleForm from "../ArticleForm";
import { createArticleAction } from "../actions";

import AdminNav from "../../AdminNav";
export default function NewArticlePage() {
  return (
    <main className="admin-shell">
      <AdminNav />
      <section className="admin-card">
        <p className="muted">Admin / Articles / New</p>
        <h1>新建文章</h1>
        <ArticleForm action={createArticleAction} submitLabel="保存文章" />
      </section>
    </main>
  );
}
