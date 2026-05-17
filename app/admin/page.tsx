import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

type Article = {
  id: string;
  title: string | null;
  section: string | null;
  category: string | null;
  status: string | null;
  is_pinned: boolean | null;
  updated_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminArticlesPage() {
  const supabase = createClient();
  let articles: Article[] = [];
  let message = "配置 Supabase 后会从 articles 表读取文章列表。";

  if (supabase) {
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,section,category,status,is_pinned,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      message = error.message;
    } else {
      articles = data ?? [];
      message = articles.length ? "按更新时间倒序显示全部文章。" : "暂无文章，请先新建";
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <div className="admin-heading-row">
          <div>
            <p className="muted">Admin / Articles</p>
            <h1>文章管理</h1>
          </div>

          <Link className="admin-button" href="/admin/articles/new">
            新建文章
          </Link>
        </div>

        <p>{message}</p>

        {articles.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题 title</th>
                  <th>栏目 section</th>
                  <th>分类 category</th>
                  <th>状态 status</th>
                  <th>置顶 is_pinned</th>
                  <th>更新时间 updated_at</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>{article.title ?? "未命名"}</td>
                    <td>{article.section ?? "-"}</td>
                    <td>{article.category ?? "-"}</td>
                    <td>{article.status ?? "draft"}</td>
                    <td>{article.is_pinned ? "是" : "否"}</td>
                    <td>{formatDate(article.updated_at)}</td>
                    <td>
                      <Link className="admin-link-button" href={`/admin/articles/${article.id}/edit`}>
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
