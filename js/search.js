(function () {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const status = document.getElementById("searchStatus");
  const results = document.getElementById("searchResults");
  let index = [];

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(items, keyword) {
    if (!keyword) {
      status.textContent = "请输入关键词，例如：作文、文言实词、苏轼、默写易错、议论文。";
      results.innerHTML = "";
      return;
    }

    if (!items.length) {
      status.textContent = `没有找到与“${keyword}”相关的资料。可以换一个更短的关键词试试。`;
      results.innerHTML = "";
      return;
    }

    status.textContent = `找到 ${items.length} 条与“${keyword}”相关的资料。`;
    results.innerHTML = items.map((item) => `
      <article class="search-result">
        <span class="column">${escapeHtml(item.column)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.summary)}</p>
        <div class="data-tags">${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <a class="read-link" href="${escapeHtml(item.url)}">查看资料</a>
      </article>
    `).join("");
  }

  function search(keyword) {
    const trimmed = keyword.trim();
    const key = normalize(trimmed);
    const matched = index.filter((item) => {
      const haystack = normalize([
        item.title,
        item.column,
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

  function bootFallback() {
    if (Array.isArray(window.GDTK_SEARCH_INDEX)) {
      boot(window.GDTK_SEARCH_INDEX);
      return;
    }
    status.textContent = "搜索索引还没有生成。请先运行 npm run build，或检查 data/search-index.json 是否存在。";
  }

  fetch("data/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error("search index not found");
      return response.json();
    })
    .then(boot)
    .catch(bootFallback);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    search(input.value);
  });
})();
