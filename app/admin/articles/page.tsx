import { createClient } from "../../../lib/supabase/server";

type Article = {
  id: string;
  title: string;
  section: string | null;
  updated_at: string | null;
};

export default async function AdminArticlesPage() {
  const supabase = createClient();
  let articles: Article[] = [];
  let message = "配置 Supabase 后会从 articles 表读取最近文章。";

  if (supabase) {
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,section,updated_at")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      message = error.message;
    } else {
      articles = data ?? [];
      message = articles.length ? "最近文章" : "articles 表暂无记录。";
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <p className="muted">Admin / Articles</p>
        <h1>文章管理</h1>
        <p>{message}</p>
        <div className="admin-grid">
          {articles.map((article) => (
            <article className="admin-card" key={article.id}>
              <h2>{article.title}</h2>
              <p className="muted">栏目：{article.section ?? "未分类"}</p>
              <p className="muted">更新：{article.updated_at ?? "未知"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
