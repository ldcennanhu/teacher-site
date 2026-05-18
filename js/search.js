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

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeSupabaseArticles(data) {
    if (!Array.isArray(data)) return [];

    return data.map((article) => ({
      type: "文章",
      title: article.title || "",
      section: article.section || "",
      category: article.category || "文章",
      summary: article.summary || "",
      tags: asArray(article.tags).filter(Boolean),
      date: article.date || article.published_at || article.updated_at || "",
      url: article.url || "#",
      actionText: "阅读"
    }));
  }

  function normalizeMaterials(data) {
    if (!Array.isArray(data)) return [];

    return data.map((material) => ({
      type: "素材卡片",
      title: material.title || "",
      section: "materials",
      category: material.topic || "素材卡片",
      summary: material.summary || material.main_quote || "",
      tags: asArray(material.tags).filter(Boolean),
      date: material.published_at || material.updated_at || "",
      url: "pages/writing-cards-week20.html",
      actionText: "查看素材"
    }));
  }

  function normalizePublicFiles(data) {
    if (!Array.isArray(data)) return [];

    return data.map((file) => ({
      type: "公开文件",
      title: file.title || "未命名备课文件",
      section: "files",
      category: file.file_type || file.fileType || "公开文件",
      summary: file.summary || "",
      tags: asArray(file.tags).filter(Boolean),
      date: file.updated_at || file.updatedAt || "",
      url: file.id ? `/api/public-files/${encodeURIComponent(file.id)}/download` : "#",
      actionText: "下载"
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
        <span class="column">${escapeHtml(item.type)} · ${escapeHtml(item.category)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.summary)}</p>
        <div class="data-tags">${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <a class="read-link" href="${escapeHtml(item.url || "#")}">${escapeHtml(item.actionText || "查看")}</a>
      </article>
    `).join("");
  }

  function search(keyword) {
    const trimmed = keyword.trim();
    const key = normalize(trimmed);

    const matched = index.filter((item) => {
      const haystack = normalize([
        item.type,
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
      boot(window.GDTK_SEARCH_INDEX.map((item) => ({
        ...item,
        type: "文章",
        actionText: "阅读"
      })));
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
      .then((data) => {
        const localArticles = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              type: "文章",
              actionText: "阅读"
            }))
          : [];

        boot(localArticles);
      })
      .catch(fail);
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async function loadSupabaseSearchIndex() {
    try {
      const [articleData, materialData, publicFileData] = await Promise.all([
        fetchJson("/api/articles"),
        fetchJson("/api/materials"),
        fetchJson("/api/public-files")
      ]);

      const articles = normalizeSupabaseArticles(articleData);
      const materials = normalizeMaterials(materialData);
      const publicFiles = normalizePublicFiles(publicFileData);

      const combined = [...articles, ...materials, ...publicFiles];

      if (!combined.length) {
        loadLocalSearchIndex();
        return;
      }

      boot(combined);
    } catch {
      loadLocalSearchIndex();
    }
  }

  loadSupabaseSearchIndex();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    search(input.value);
  });
})();
