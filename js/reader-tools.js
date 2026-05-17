(function () {
  const recentKey = "gdtk_recent_articles";
  const favoriteKey = "gdtk_favorite_articles";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readStore(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function currentUrl() {
    return window.location.pathname.split("/").slice(-3).join("/");
  }

  function createProgressBar() {
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.innerHTML = "<span></span>";
    document.body.appendChild(bar);

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const percent = height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0;
      bar.firstElementChild.style.width = `${percent}%`;
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function createBackTop() {
    const button = document.createElement("button");
    button.className = "back-top";
    button.type = "button";
    button.textContent = "↑";
    button.setAttribute("aria-label", "返回顶部");
    document.body.appendChild(button);

    function update() {
      button.classList.toggle("show", window.scrollY > 360);
    }

    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function articleMeta() {
    const article = document.querySelector("[data-reader-article]");
    if (!article) return null;
    return {
      title: article.dataset.title || document.title.replace("｜孤登塔客语文馆", ""),
      column: article.dataset.column || "",
      date: article.dataset.date || "",
      url: article.dataset.url || currentUrl()
    };
  }

  function saveRecent(meta) {
    if (!meta) return;
    const recent = readStore(recentKey).filter((item) => item.url !== meta.url);
    recent.unshift(meta);
    writeStore(recentKey, recent.slice(0, 5));
  }

  function renderRecent() {
    const containers = document.querySelectorAll("[data-recent-articles]");
    if (!containers.length) return;
    const recent = readStore(recentKey).slice(0, 5);

    containers.forEach((container) => {
      if (!recent.length) {
        container.innerHTML = '<p class="empty-note">暂无最近浏览记录。</p>';
        return;
      }

      container.innerHTML = recent.map((item) => `
        <a class="recent-item" href="${escapeHtml(item.url)}">
          <span>${escapeHtml(item.column)}</span>
          <strong>${escapeHtml(item.title)}</strong>
        </a>
      `).join("");
    });
  }

  function setupFavorite(meta) {
    const button = document.querySelector("[data-favorite-button]");
    if (!button || !meta) return;

    function isFavorite() {
      return readStore(favoriteKey).some((item) => item.url === meta.url);
    }

    function updateButton() {
      button.textContent = isFavorite() ? "取消收藏" : "收藏本文";
      button.classList.toggle("active", isFavorite());
    }

    button.addEventListener("click", () => {
      const favorites = readStore(favoriteKey);
      if (isFavorite()) {
        writeStore(favoriteKey, favorites.filter((item) => item.url !== meta.url));
      } else {
        writeStore(favoriteKey, [meta, ...favorites.filter((item) => item.url !== meta.url)]);
      }
      updateButton();
    });

    updateButton();
  }

  function setupToc() {
    const content = document.querySelector(".article-content");
    const toc = document.querySelector("[data-article-toc]");
    if (!content || !toc) return;

    const headings = Array.from(content.querySelectorAll("h2, h3"));
    if (!headings.length) {
      toc.innerHTML = '<p class="empty-note">本文暂无目录。</p>';
      return;
    }

    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
    });

    toc.innerHTML = `
      <button class="toc-toggle" type="button">文章目录</button>
      <nav class="toc-list">
        ${headings.map((heading) => `<a class="${heading.tagName.toLowerCase()}" href="#${heading.id}">${escapeHtml(heading.textContent)}</a>`).join("")}
      </nav>
    `;

    const toggle = toc.querySelector(".toc-toggle");
    const links = Array.from(toc.querySelectorAll("a"));
    toggle.addEventListener("click", () => toc.classList.toggle("open"));
    links.forEach((link) => link.addEventListener("click", () => toc.classList.remove("open")));

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.5, 1] });

    headings.forEach((heading) => observer.observe(heading));
  }

  function setupFavoritesPage() {
    const list = document.querySelector("[data-favorites-list]");
    if (!list) return;

    function render() {
      const favorites = readStore(favoriteKey);
      if (!favorites.length) {
        list.innerHTML = '<p class="empty-note">暂时还没有收藏文章。打开任意文章页，点击“收藏本文”即可保存到这里。</p>';
        return;
      }

      list.innerHTML = favorites.map((item) => `
        <article class="article-list-card">
          <div>
            <span class="data-meta">${escapeHtml(item.column)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.date || "本地收藏")}</p>
          </div>
          <div class="data-card-footer">
            <a class="read-link" href="${escapeHtml(item.url)}">阅读</a>
            <button class="read-link favorite-remove" type="button" data-remove-favorite="${escapeHtml(item.url)}">取消收藏</button>
          </div>
        </article>
      `).join("");

      list.querySelectorAll("[data-remove-favorite]").forEach((button) => {
        button.addEventListener("click", () => {
          writeStore(favoriteKey, readStore(favoriteKey).filter((item) => item.url !== button.dataset.removeFavorite));
          render();
        });
      });
    }

    render();
  }

  const meta = articleMeta();
  createProgressBar();
  createBackTop();
  saveRecent(meta);
  renderRecent();
  setupFavorite(meta);
  setupToc();
  setupFavoritesPage();
})();
