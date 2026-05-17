(function () {
  const articleSections = document.querySelectorAll("[data-article-section]");
  const latestContainer = document.querySelector("[data-latest-articles]");

  if (!articleSections.length && !latestContainer) return;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sortByDate(items) {
    return [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title, "zh-CN"));
  }

  function articleCard(article) {
    const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="article-list-card">
        <div>
          <span class="data-meta">${escapeHtml(article.column)}</span>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.summary)}</p>
          <div class="data-tags">${tags}</div>
        </div>
        <div class="data-card-footer">
          <span>更新：${escapeHtml(article.date)}</span>
          <a class="read-link" href="${escapeHtml(article.url)}">阅读</a>
        </div>
      </article>
    `;
  }

  function renderArticleSection(container, allArticles) {
    const section = container.dataset.articleSection;
    const filterBox = container.querySelector("[data-article-filters]");
    const list = container.querySelector("[data-article-list]");
    const status = container.querySelector("[data-article-status]");
    const articles = sortByDate(allArticles.filter((article) => article.section === section));
    let activeTag = "全部";

    function renderFilters() {
      const tags = Array.from(new Set(articles.flatMap((article) => article.tags || [])));
      filterBox.innerHTML = ["全部", ...tags].map((tag) => (
        `<button type="button" class="${tag === activeTag ? "active" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
      )).join("");
    }

    function renderList() {
      const shown = activeTag === "全部"
        ? articles
        : articles.filter((article) => (article.tags || []).includes(activeTag));

      if (!articles.length) {
        status.textContent = "资料整理中，敬请期待。";
        list.innerHTML = "";
        return;
      }

      if (!shown.length) {
        status.textContent = `暂无“${activeTag}”标签下的文章。`;
        list.innerHTML = "";
        return;
      }

      status.textContent = activeTag === "全部"
        ? `共 ${shown.length} 篇本栏目文章。`
        : `“${activeTag}”标签下共 ${shown.length} 篇文章。`;
      list.innerHTML = shown.map(articleCard).join("");
    }

    filterBox.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-tag]");
      if (!button) return;
      activeTag = button.dataset.tag;
      renderFilters();
      renderList();
    });

    renderFilters();
    renderList();
  }

  function renderLatest(allArticles) {
    const articles = sortByDate(allArticles).slice(0, 6);

    if (!articles.length) {
      latestContainer.innerHTML = '<p class="empty-note">资料整理中，敬请期待。</p>';
      return;
    }

    latestContainer.innerHTML = articles.map((article) => `
      <a class="latest-item" href="${escapeHtml(article.url)}">
        <span>${escapeHtml(article.column)}</span>
        <strong>${escapeHtml(article.title)}</strong>
        <time>${escapeHtml(article.date)}</time>
      </a>
    `).join("");
  }

  function boot(data) {
    const articles = Array.isArray(data) ? data : [];
    articleSections.forEach((container) => renderArticleSection(container, articles));
    if (latestContainer) renderLatest(articles);
  }

  function bootFallback() {
    if (Array.isArray(window.GDTK_ARTICLES)) {
      boot(window.GDTK_ARTICLES);
      return;
    }

    articleSections.forEach((container) => {
      const status = container.querySelector("[data-article-status]");
      if (status) status.textContent = "文章索引还没有生成。请先运行 npm run build。";
    });
    if (latestContainer) {
      latestContainer.innerHTML = '<p class="empty-note">文章索引还没有生成。请先运行 npm run build。</p>';
    }
  }

  fetch("data/articles.json")
    .then((response) => {
      if (!response.ok) throw new Error("articles index not found");
      return response.json();
    })
    .then(boot)
    .catch(bootFallback);
})();
