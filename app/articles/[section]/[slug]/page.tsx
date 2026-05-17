import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

type ArticlePageProps = {
  params: {
    section: string;
    slug: string;
  };
};

function formatDate(value: string | null) {
  if (!value) return "未知";

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function SupabaseArticlePage({ params }: ArticlePageProps) {
  const supabase = createClient();

  if (!supabase) {
    notFound();
  }

  const { data: article, error } = await supabase
    .from("articles")
    .select("title,slug,section,category,summary,tags,content,status,visibility,published_at,updated_at")
    .eq("section", params.section)
    .eq("slug", params.slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();

  if (error || !article) {
    notFound();
  }

  const tags = Array.isArray(article.tags) ? article.tags : [];
  const date = article.published_at ?? article.updated_at ?? null;

  return (
    <main className="admin-shell">
      <article className="admin-card">
        <p className="muted">
          {article.section} / {article.category ?? "未分类"}
        </p>

        <h1>{article.title}</h1>

        {article.summary ? <p>{article.summary}</p> : null}

        <p className="muted">更新：{formatDate(date)}</p>

        {tags.length ? (
          <div className="data-tags">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}

        <div className="article-content" style={{ whiteSpace: "pre-wrap", marginTop: "24px" }}>
          {article.content}
        </div>
      </article>
    </main>
  );
}
