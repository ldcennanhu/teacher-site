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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}


function decodeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function plainTextToHtml(value: string) {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return "<p class=\"article-empty\">暂无正文。</p>";
  }

  return blocks
    .map((block) => {
      const escaped = escapeHtml(block).replace(/\n/g, "<br>");
      return `<p>${escaped}</p>`;
    })
    .join("");
}

function sanitizeStyle(styleValue: string) {
  const allowed: string[] = [];

  styleValue.split(";").forEach((part) => {
    const [rawName, rawValue] = part.split(":");
    const name = String(rawName || "").trim().toLowerCase();
    const value = String(rawValue || "").trim().toLowerCase();

    if (!name || !value) return;

    if (name === "text-align" && /^(left|center|right|justify)$/.test(value)) {
      allowed.push(`${name}: ${value}`);
    }

    if (name === "text-indent" && /^(\d+(\.\d+)?)(px|em|rem)$/.test(value)) {
      allowed.push(`${name}: ${value}`);
    }

    if (name === "margin-left" && /^(\d+(\.\d+)?)(px|em|rem)$/.test(value)) {
      allowed.push(`${name}: ${value}`);
    }

    if (name === "font-weight" && /^(bold|700|800|900)$/.test(value)) {
      allowed.push(`${name}: ${value}`);
    }

    if (name === "font-style" && value === "italic") {
      allowed.push(`${name}: ${value}`);
    }

    if (name === "text-decoration" && /^(underline|line-through)$/.test(value)) {
      allowed.push(`${name}: ${value}`);
    }
  });

  return allowed.join("; ");
}

function sanitizeHtml(html: string) {
  let cleaned = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "")
    .replace(/javascript:/gi, "");

  cleaned = cleaned.replace(/\sstyle="([^"]*)"/gi, (_match, styleValue: string) => {
    const safeStyle = sanitizeStyle(styleValue);
    return safeStyle ? ` style="${safeStyle}"` : "";
  });

  cleaned = cleaned.replace(/\sstyle='([^']*)'/gi, (_match, styleValue: string) => {
    const safeStyle = sanitizeStyle(styleValue);
    return safeStyle ? ` style="${safeStyle}"` : "";
  });

  return cleaned;
}

function articleContentHtml(content: string | null) {
  const value = String(content || "").trim();

  if (!value) {
    return "<p class=\"article-empty\">暂无正文。</p>";
  }

  const decoded = decodeHtmlEntities(value);
  const htmlSource = looksLikeHtml(decoded) ? decoded : looksLikeHtml(value) ? value : plainTextToHtml(value);

  return sanitizeHtml(htmlSource);
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
  const articleUrl = `/articles/${article.section}/${article.slug}`;

  return (
    <>
      <main className="article-detail-shell">
        <article
          className="article-detail-card"
          data-reader-article
          data-title={article.title}
          data-column={sectionLabel}
          data-date={formatDate(date)}
          data-url={articleUrl}
        >
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

          <section
            className="article-detail-content rich-article-content"
            dangerouslySetInnerHTML={{ __html: articleContentHtml(article.content) }}
          />

          <footer className="article-detail-footer">
            <Link className="article-back-link" href={sectionHref}>
              ← 返回{sectionLabel}
            </Link>
          </footer>
        </article>
      </main>

      <script src="/js/reader-tools.js" />
    </>
  );
}
