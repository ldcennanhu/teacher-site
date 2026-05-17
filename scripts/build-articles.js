const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const articlesDir = path.join(rootDir, "articles");
const searchIndexPath = path.join(rootDir, "data", "search-index.json");
const articlesIndexPath = path.join(rootDir, "data", "articles.json");
const searchIndexDataPath = path.join(rootDir, "data", "search-index-data.js");
const articlesDataPath = path.join(rootDir, "data", "articles-data.js");

const sections = {
  zuowen: "作文专区",
  wenyan: "文言文研习",
  shici: "诗词曲赋",
  yuedu: "现代文阅读",
  mingzhu: "名著导读",
  beike: "备课资源"
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeDataScript(filePath, variableName, data) {
  fs.writeFileSync(filePath, `window.${variableName} = ${JSON.stringify(data, null, 2)};\n`, "utf8");
}

function parseFrontMatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`缺少 front matter: ${filePath}`);
  }

  const meta = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
    }

    meta[key] = value;
  });

  return { meta, body: match[2].trim() };
}

function inlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

function renderTable(lines) {
  const rows = lines
    .filter((line) => !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line))
    .map((line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()));

  if (!rows.length) return "";
  const [head, ...body] = rows;
  return [
    "<table>",
    `<thead><tr>${head.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`,
    `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`,
    "</table>"
  ].join("");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let code = null;
  let table = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list) {
      blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  }

  function flushQuote() {
    if (quote.length) {
      blocks.push(`<blockquote>${quote.map((item) => `<p>${inlineMarkdown(item)}</p>`).join("")}</blockquote>`);
      quote = [];
    }
  }

  function flushTable() {
    if (table.length) {
      blocks.push(renderTable(table));
      table = [];
    }
  }

  lines.forEach((line) => {
    if (code) {
      if (/^```/.test(line)) {
        blocks.push(`<pre><code>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
        code = null;
      } else {
        code.lines.push(line);
      }
      return;
    }

    if (/^```/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      code = { lines: [] };
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      return;
    }

    if (/^\|.+\|$/.test(line.trim())) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(line);
      return;
    }

    flushTable();

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ul") list = { type: "ul", items: [] };
      list.items.push(unordered[1]);
      return;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ol") list = { type: "ol", items: [] };
      list.items.push(ordered[1]);
      return;
    }

    const blockquote = line.match(/^\s*>\s?(.+)$/);
    if (blockquote) {
      flushParagraph();
      flushList();
      quote.push(blockquote[1]);
      return;
    }

    flushList();
    flushQuote();
    paragraph.push(line.trim());
  });

  flushParagraph();
  flushList();
  flushQuote();
  flushTable();

  if (code) {
    blocks.push(`<pre><code>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
  }

  return blocks.join("\n");
}

function siteHeader(prefix, activeSection) {
  const navItems = [
    ["zuowen", "作文专区", "zuowen.html"],
    ["wenyan", "文言文研习", "wenyan.html"],
    ["shici", "诗词曲赋", "shici.html"],
    ["yuedu", "现代文阅读", "yuedu.html"],
    ["mingzhu", "名著导读", "mingzhu.html"],
    ["cards", "素材卡片墙", "pages/writing-cards-week20.html"],
    ["beike", "备课资源", "beike.html"],
    ["study", "学习路径", "study-guide.html"],
    ["updates", "更新日志", "updates.html"],
    ["about", "关于师者", "about.html"],
    ["search", "搜索资料", "search.html"],
    ["favorites", "我的收藏", "favorites.html"]
  ];

  const links = navItems.map(([key, label, href]) => {
    const className = key === activeSection ? ' class="active"' : "";
    return `<a${className} href="${prefix}${href}">${label}</a>`;
  }).join("");

  return `<header class="site-header"><nav class="nav"><a class="brand" href="${prefix}index.html"><span class="seal">文</span><span class="brand-title">孤登塔客语文馆</span></a><div class="nav-links">${links}</div></nav></header>`;
}

function siteFooter() {
  return `<footer class="site-footer"><div class="footer-inner"><div><h2>教师简介</h2><p>高中一线语文教师，持续整理适合课堂与自学使用的语文资料。</p></div><div><h2>教学寄语</h2><p>愿每一次阅读，都能照见更辽阔的精神世界；愿每一篇文字，都有真实思考与真挚性情。</p></div></div></footer>`;
}

function articleTemplate(article) {
  const prefix = "../../";
  const tags = article.meta.tags || [];
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(article.meta.summary)}">
  <title>${escapeHtml(article.meta.title)}｜孤登塔客语文馆</title>
  <link rel="stylesheet" href="${prefix}css/styles.css">
</head>
<body>
  ${siteHeader(prefix, article.meta.section)}
  <main>
    <article class="article-page" data-reader-article data-title="${escapeHtml(article.meta.title)}" data-column="${escapeHtml(article.meta.category)}" data-date="${escapeHtml(article.meta.date)}" data-url="${article.url}">
      <div class="breadcrumb"><a href="${prefix}index.html">首页</a> / <a href="${prefix}${article.meta.section}.html">${escapeHtml(article.meta.category)}</a> / 正文</div>
      <header class="article-hero">
        <p class="eyebrow">资料文章 · ${escapeHtml(article.meta.category)}</p>
        <h1>${escapeHtml(article.meta.title)}</h1>
        <p>${escapeHtml(article.meta.summary)}</p>
        <div class="article-meta">
          <span>更新：${escapeHtml(article.meta.date)}</span>
          <span>栏目：${escapeHtml(article.meta.category)}</span>
        </div>
        <div class="data-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="article-actions"><button class="read-link favorite-button" type="button" data-favorite-button>收藏本文</button><a class="read-link" href="${prefix}favorites.html">我的收藏</a></div>
      </header>
      <aside class="article-toc" data-article-toc></aside>
      <div class="article-content">
        ${article.html}
      </div>
      <section class="recent-panel"><div class="section-heading"><h2>最近浏览</h2><p>保存在当前浏览器中，方便继续阅读。</p></div><div class="recent-list" data-recent-articles></div></section>
    </article>
  </main>
  ${siteFooter()}
  <script src="${prefix}js/reader-tools.js"></script>
</body>
</html>
`;
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function buildArticles() {
  ensureDir(articlesDir);
  ensureDir(path.dirname(searchIndexPath));

  const markdownFiles = walkMarkdown(contentDir);
  const generated = markdownFiles.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontMatter(raw, filePath);
    const section = parsed.meta.section;
    if (!sections[section]) {
      throw new Error(`未知栏目 section: ${section} (${filePath})`);
    }

    const slug = path.basename(filePath, ".md");
    const outputDir = path.join(articlesDir, section);
    const outputPath = path.join(outputDir, `${slug}.html`);
    ensureDir(outputDir);

    const article = {
      title: parsed.meta.title,
      section,
      category: parsed.meta.category,
      summary: parsed.meta.summary,
      tags: parsed.meta.tags || [],
      date: parsed.meta.date,
      url: `articles/${section}/${slug}.html`
    };

    fs.writeFileSync(outputPath, articleTemplate({ meta: parsed.meta, html: markdownToHtml(parsed.body) }), "utf8");
    return article;
  }).sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title, "zh-CN"));

  const currentIndex = fs.existsSync(searchIndexPath)
    ? JSON.parse(fs.readFileSync(searchIndexPath, "utf8"))
    : [];

  const manualIndex = currentIndex.filter((item) => !String(item.url || "").startsWith("articles/"));
  const articleSearchIndex = generated.map((article) => ({
    title: article.title,
    section: article.section,
    category: article.category,
    summary: article.summary,
    tags: article.tags,
    date: article.date,
    url: article.url
  }));

  const searchIndex = [...manualIndex, ...articleSearchIndex];

  fs.writeFileSync(articlesIndexPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
  fs.writeFileSync(searchIndexPath, `${JSON.stringify(searchIndex, null, 2)}\n`, "utf8");
  writeDataScript(articlesDataPath, "GDTK_ARTICLES", generated);
  writeDataScript(searchIndexDataPath, "GDTK_SEARCH_INDEX", searchIndex);

  console.log(`已生成 ${generated.length} 篇文章，并更新文章索引、搜索索引和本地预览备用数据。`);
}

buildArticles();
