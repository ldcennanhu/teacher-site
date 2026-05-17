(function () {
  const articleList = document.getElementById("article-list");
  const latestContainer = document.querySelector("[data-latest-articles]");

  if (!articleList && !latestContainer) return;

  const supabaseSections = new Set([
    "zuowen",
    "wenyan",
    "shici",
    "yuedu",
    "mingzhu",
    "beike"
  ]);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dataPath(fileName) {
    return window.location.pathname.includes("/pages/") || window.location.pathname.includes("/articles/")
      ? `../data/${fileName}`
      : `data/${fileName}`;
  }

  function linkPath(url) {
    if (!url || /^(https?:|mailto:|#|\/)/.test(url)) return url || "#";

    return window.location.pathname.includes("/pages/") || window.location.pathname.includes("/articles/")
      ? `../${url}`
      : url;
  }

  function sortByDate(items) {
    return [...items].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function articleCard(article) {
    const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

    return `
      <article class="article-list-card">
        <div>
          <span class="data-meta">${escapeHtml(article.category)}</span>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.summary)}</p>
          <div class="data-tags">${tags}</div>
        </div>
        <div class="data-card-footer">
          <span>更新：${escapeHtml(article.date)}</span>
          <a class="read-link" href="${escapeHtml(linkPath(article.url))}">阅读</a>
        </div>
      </article>
    `;
  }

  function renderArticleList(articles) {
    if (!articleList) return;

    const section = articleList.dataset.section;
    const filtered = sortByDate(articles.filter((article) => article.section === section));

    if (!filtered.length) {
      articleList.innerHTML = '<p class="empty-note">资料整理中，敬请期待。</p>';
      return;
    }

    articleList.innerHTML = filtered.map(articleCard).join("");
  }

  function renderLatest(articles) {
    if (!latestContainer) return;

    const latest = sortByDate(articles).slice(0, 6);

    if (!latest.length) {
      latestContainer.innerHTML = '<p class="empty-note">暂无更新，资料整理中。</p>';
      return;
    }

    latestContainer.innerHTML = latest.map((article) => `
      <a class="latest-item" href="${escapeHtml(linkPath(article.url))}">
        <span>${escapeHtml(article.category)}</span>
        <strong>${escapeHtml(article.title)}</strong>
        <time>${escapeHtml(article.date)}</time>
      </a>
    `).join("");
  }

  function boot(data) {
    const articles = Array.isArray(data) ? data : [];
    renderArticleList(articles);
    renderLatest(articles);
  }

  function fail() {
    if (Array.isArray(window.GDTK_ARTICLES)) {
      boot(window.GDTK_ARTICLES);
      return;
    }

    if (articleList) {
      articleList.innerHTML = '<p class="empty-note">文章数据加载失败，请检查 data/articles.json。</p>';
    }

    if (latestContainer) {
      latestContainer.innerHTML = '<p class="empty-note">暂无更新，资料整理中。</p>';
    }
  }

  function loadLocalArticles() {
    return fetch(dataPath("articles.json"))
      .then((response) => {
        if (!response.ok) throw new Error("articles data not found");
        return response.json();
      })
      .then(boot)
      .catch(fail);
  }

  function normalizeSupabaseArticles(data) {
    if (!Array.isArray(data)) return [];

    return data.map((article) => ({
      title: article.title || "",
      section: article.section || "",
      category: article.category || "",
      summary: article.summary || "",
      tags: Array.isArray(article.tags) ? article.tags : [],
      date: article.date || article.published_at || article.updated_at || "",
      url: article.url || "#"
    }));
  }

  function currentSection() {
    return articleList?.dataset?.section || "";
  }

  function shouldLoadSupabaseArticlesForSection() {
    const section = currentSection();
    return Boolean(articleList && supabaseSections.has(section));
  }

  function loadSupabaseArticles(endpoint) {
    return fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error("supabase articles not found");
        return response.json();
      })
      .then((data) => {
        const articles = normalizeSupabaseArticles(data);

        if (!articles.length) {
          loadLocalArticles();
          return;
        }

        boot(articles);
      })
      .catch(loadLocalArticles);
  }

  if (shouldLoadSupabaseArticlesForSection()) {
    const section = currentSection();
    loadSupabaseArticles(`/api/articles?section=${encodeURIComponent(section)}`);
    return;
  }

  if (latestContainer && !articleList) {
    loadSupabaseArticles("/api/articles");
    return;
  }

  loadLocalArticles();
})();
