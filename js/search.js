(function () {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const status = document.getElementById("searchStatus");
  const results = document.getElementById("searchResults");

  if (!form || !input || !status || !results) return;

  let index = [];

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function render(items, keyword) {
    if (!keyword) {
      status.textContent = "请输入关键词开始搜索。";
      results.innerHTML = "";
      return;
    }

    if (!items.length) {
      status.textContent = "没有找到相关资料，可以尝试更换关键词。";
      results.innerHTML = "";
      return;
    }

    status.textContent = `找到 ${items.length} 条相关资料。`;

    results.innerHTML = items.map((item) => `
      <article class="search-result">
        <span class="column">${escapeHtml(item.category)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.summary)}</p>
        <div class="data-tags">${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <a class="read-link" href="${escapeHtml(item.url || "#")}">阅读</a>
      </article>
    `).join("");
  }

  function search(keyword) {
    const trimmed = keyword.trim();
    const key = normalize(trimmed);

    const matched = index.filter((item) => {
      const haystack = normalize([
        item.title,
        item.section,
        item.category,
        item.summary,
        (item.tags || []).join(" ")
      ].join(" "));

      return haystack.includes(key);
    });

    render(matched, trimmed);
  }

  function boot(data) {
    index = Array.isArray(data) ? data : [];

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";

    input.value = q;
    search(q);
  }

  function fail() {
    if (Array.isArray(window.GDTK_SEARCH_INDEX)) {
      boot(window.GDTK_SEARCH_INDEX);
      return;
    }

    status.textContent = "搜索数据加载失败，请检查 data/search-index.json。";
  }

  function loadLocalSearchIndex() {
    return fetch("data/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("search data not found");
        return response.json();
      })
      .then(boot)
      .catch(fail);
  }

  function loadSupabaseSearchIndex() {
    return fetch("/api/articles")
      .then((response) => {
        if (!response.ok) throw new Error("supabase articles not found");
        return response.json();
      })
      .then((data) => {
        const articles = normalizeSupabaseArticles(data);

        if (!articles.length) {
          loadLocalSearchIndex();
          return;
        }

        boot(articles);
      })
      .catch(loadLocalSearchIndex);
  }

  loadSupabaseSearchIndex();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    search(input.value);
  });
})();
