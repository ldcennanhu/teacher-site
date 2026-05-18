(function () {
  const articleList = document.getElementById("article-list");
  const latestContainer = document.querySelector("[data-latest-articles]");
  const sideNav = document.querySelector(".side-nav");

  if (!articleList && !latestContainer) return;

  const supabaseSections = new Set([
    "zuowen",
    "wenyan",
    "shici",
    "yuedu",
    "mingzhu",
    "beike"
  ]);

  let currentArticles = [];
  let activeCategory = "全部";

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

  function normalizeCategory(category) {
    return String(category || "").trim() || "未分类";
  }

  function currentSection() {
    return articleList?.dataset?.section || "";
  }

  function sectionArticles(articles) {
    const section = currentSection();
    return sortByDate(articles.filter((article) => article.section === section));
  }

  function uniqueCategories(articles) {
    const categories = [];
    const seen = new Set();

    articles.forEach((article) => {
      const category = normalizeCategory(article.category);

      if (!seen.has(category)) {
        seen.add(category);
        categories.push(category);
      }
    });

    return categories;
  }

  function articleCard(article) {
    const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

    return `
      <article class="article-list-card">
        <div>
          <span class="data-meta">${escapeHtml(normalizeCategory(article.category))}</span>
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

  function renderSideNav(articles) {
    if (!sideNav || !articleList) return;

    const rows = sectionArticles(articles);
    if (!rows.length) return;

    const categories = ["全部", ...uniqueCategories(rows)];

    sideNav.innerHTML = categories.map((category) => `
      <a href="#article-list" data-auto-category="${escapeHtml(category)}" class="${category === activeCategory ? "active" : ""}">
        ${escapeHtml(category)}
      </a>
    `).join("");

    sideNav.querySelectorAll("[data-auto-category]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        activeCategory = link.getAttribute("data-auto-category") || "全部";
        renderSideNav(currentArticles);
        renderArticleList(currentArticles);
      });
    });
  }

  function renderArticleList(articles) {
    if (!articleList) return;

    let filtered = sectionArticles(articles);

    if (activeCategory !== "全部") {
      filtered = filtered.filter((article) => normalizeCategory(article.category) === activeCategory);
    }

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
        <span>${escapeHtml(normalizeCategory(article.category))}</span>
        <strong>${escapeHtml(article.title)}</strong>
        <time>${escapeHtml(article.date)}</time>
      </a>
    `).join("");
  }

  function boot(data, options = {}) {
    const articles = Array.isArray(data) ? data : [];
    currentArticles = articles;
    activeCategory = "全部";

    if (options.autoSideNav) {
      renderSideNav(articles);
    }

    renderArticleList(articles);
    renderLatest(articles);
  }

  function fail() {
    if (Array.isArray(window.GDTK_ARTICLES)) {
      boot(window.GDTK_ARTICLES, { autoSideNav: false });
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
      .then((data) => boot(data, { autoSideNav: false }))
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

  function shouldLoadSupabaseArticlesForSection() {
    const section = currentSection();
    return Boolean(articleList && supabaseSections.has(section));
  }

  function loadSupabaseArticles(endpoint, options = {}) {
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

        boot(articles, options);
      })
      .catch(loadLocalArticles);
  }

  if (shouldLoadSupabaseArticlesForSection()) {
    const section = currentSection();

    loadSupabaseArticles(`/api/articles?section=${encodeURIComponent(section)}`, {
      autoSideNav: true
    });

    return;
  }

  if (latestContainer && !articleList) {
    loadSupabaseArticles("/api/articles");
    return;
  }

  loadLocalArticles();
})();
