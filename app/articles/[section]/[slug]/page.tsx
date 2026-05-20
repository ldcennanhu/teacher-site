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

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInlineMarkdown(text: string) {
  const escaped = escapeText(text);
  const parts = escaped.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

function isChineseSectionHeading(text: string) {
  const trimmed = text.trim();

  if (trimmed.length > 36) {
    return false;
  }

  return /^[一二三四五六七八九十]+[、.．]\s*/.test(trimmed);
}

function renderMarkdown(content: string | null) {
  const lines = String(content || "").split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let paragraphLines: string[] = [];
  let unorderedItems: string[] = [];
  let orderedItems: string[] = [];

  function flushParagraph() {
    if (!paragraphLines.length) return;

    const text = paragraphLines.join("\n").trim();

    if (!text) {
      paragraphLines = [];
      return;
    }

    if (isChineseSectionHeading(text)) {
      elements.push(
        <h2 key={`chinese-heading-${elements.length}`}>
          {renderInlineMarkdown(text)}
        </h2>
      );

      paragraphLines = [];
      return;
    }

    elements.push(
      <p key={`p-${elements.length}`}>
        <span>　　</span>
        {text.split("\n").map((line, index) => (
          <span key={index}>
            {index > 0 ? <br /> : null}
            {index > 0 ? "　　" : null}
            {renderInlineMarkdown(line)}
          </span>
        ))}
      </p>
    );

    paragraphLines = [];
  }

  function flushUnorderedList() {
    if (!unorderedItems.length) return;

    elements.push(
      <ul key={`ul-${elements.length}`}>
        {unorderedItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );

    unorderedItems = [];
  }

  function flushOrderedList() {
    if (!orderedItems.length) return;

    elements.push(
      <ol key={`ol-${elements.length}`}>
        {orderedItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>
    );

    orderedItems = [];
  }

  function flushAll() {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      return;
    }

    if (/^---+$/.test(trimmed)) {
      flushAll();
      elements.push(<hr key={`hr-${elements.length}`} />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushAll();
      elements.push(
        <h3 key={`h3-${elements.length}`}>
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushAll();
      elements.push(
        <h2 key={`h2-${elements.length}`}>
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushAll();
      elements.push(
        <h1 key={`h1-${elements.length}`}>
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushAll();
      elements.push(
        <blockquote key={`quote-${elements.length}`}>
          <p>{renderInlineMarkdown(trimmed.slice(2))}</p>
        </blockquote>
      );
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushUnorderedList();
      orderedItems.push(orderedMatch[1]);
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      flushOrderedList();
      unorderedItems.push(trimmed.slice(2));
      return;
    }

    flushUnorderedList();
    flushOrderedList();
    paragraphLines.push(trimmed);
  });

  flushAll();

  if (!elements.length) {
    return <p className="article-empty">暂无正文。</p>;
  }

  return elements;
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

          <section className="article-detail-content">
            {renderMarkdown(article.content)}
          </section>

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
