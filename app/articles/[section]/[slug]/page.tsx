import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

type ArticlePageProps = {
  params: {
    section: string;
    slug: string;
  };
};

const sectionLabels: Record<string, string> = {
  zuowen: "作文专区",
  wenyan: "文言文研习",
  shici: "诗词曲赋",
  yuedu: "现代文阅读",
  mingzhu: "名著导读",
  beike: "备课资源"
};

const sectionLinks: Record<string, string> = {
  zuowen: "/zuowen.html",
  wenyan: "/wenyan.html",
  shici: "/shici.html",
  yuedu: "/yuedu.html",
  mingzhu: "/mingzhu.html",
  beike: "/beike.html"
};

function formatDate(value: string | null) {
  if (!value) return "未知";

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderParagraphs(content: string | null) {
  const paragraphs = String(content || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return <p className="article-empty">暂无正文。</p>;
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index}>
      {paragraph.split("\n").map((line, lineIndex) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < paragraph.split("\n").length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  ));
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

  const sectionLabel = sectionLabels[article.section] ?? article.section;
  const sectionHref = sectionLinks[article.section] ?? "/";
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const date = article.published_at ?? article.updated_at ?? null;

  return (
    <main className="article-detail-shell">
      <article className="article-detail-card">
        <nav className="article-breadcrumb">
          <Link href="/">首页</Link>
          <span>/</span>
          <Link href={sectionHref}>{sectionLabel}</Link>
          <span>/</span>
          <span>正文</span>
        </nav>

        <header className="article-detail-header">
          <p className="article-eyebrow">
            {sectionLabel}
            {article.category ? ` · ${article.category}` : ""}
          </p>

          <h1>{article.title}</h1>

          {article.summary ? (
            <p className="article-summary">{article.summary}</p>
          ) : null}

          <div className="article-detail-meta">
            <span>更新：{formatDate(date)}</span>
            <span>栏目：{sectionLabel}</span>
          </div>

          {tags.length ? (
            <div className="article-detail-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </header>

        <section className="article-detail-content">
          {renderParagraphs(article.content)}
        </section>

        <footer className="article-detail-footer">
          <Link className="article-back-link" href={sectionHref}>
            ← 返回{sectionLabel}
          </Link>
        </footer>
      </article>
    </main>
  );
}
