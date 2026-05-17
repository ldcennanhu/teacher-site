(function () {
  const INTERVAL = 7000;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function firstText() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = arguments[index];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return "";
  }

  function stripTopicOrder(text) {
    return String(text || "").replace(/^\s*\d+\s*\/\s*/, "").trim();
  }

  function normalizeMaterial(item) {
    return {
      id: firstText(item.id),
      topic: stripTopicOrder(firstText(item.topic)),
      title: firstText(item.title),
      summary: firstText(item.summary),
      tags: asArray(item.tags).filter(Boolean),
      points: asArray(item.points).filter(Boolean),
      mainQuote: firstText(item.mainQuote, item.main_quote),
      life: firstText(item.life),
      quotes: asArray(item.quotes).filter(Boolean),
      topics: asArray(item.topics).filter(Boolean),
      expand: firstText(item.expand),
      updatedAt: firstText(item.updatedAt, item.updated_at),
      publishedAt: firstText(item.publishedAt, item.published_at)
    };
  }

  function materials() {
    return asArray(window.GDTK_MATERIALS).map(normalizeMaterial);
  }

  function quoteList() {
    return materials().map((item) => item.mainQuote).filter(Boolean);
  }

  async function loadRemoteMaterials() {
    if (!window.fetch) return;

    const staticMaterials = materials();

    try {
      const response = await window.fetch("/api/materials", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data) || !data.length) return;

      const remoteMaterials = data.map(normalizeMaterial);
      const merged = [];
      const seen = new Set();

      remoteMaterials.concat(staticMaterials).forEach((item) => {
        const key = item.id || item.title;

        if (!key || seen.has(key)) return;

        seen.add(key);
        merged.push(item);
      });

      window.GDTK_MATERIALS = merged.slice(0, 12);
    } catch (error) {
      window.console.warn("素材卡片接口暂不可用，继续显示静态素材。", error);
    }
  }

  function startCarousels() {
    const quotes = quoteList();
    if (!quotes.length) return;

    document.querySelectorAll("[data-material-carousel]").forEach((box) => {
      const text = box.querySelector(".quote-text");
      if (!text) return;
      let index = 0;
      text.textContent = quotes[index];
      window.setInterval(() => {
        index = (index + 1) % quotes.length;
        text.style.opacity = "0";
        window.setTimeout(() => {
          text.textContent = quotes[index];
          text.style.opacity = "1";
        }, 240);
      }, INTERVAL);
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMaterialCards() {
    const grid = document.querySelector("[data-material-grid]");
    if (!grid) return;

    const rows = materials();
    if (!rows.length) {
      grid.innerHTML = '<p class="muted">暂无公开素材卡片，请稍后再来查看。</p>';
      return;
    }

    grid.innerHTML = rows.map((item, index) => {
      const order = String(index + 1).padStart(2, "0");

      return `
        <article class="material-card" role="button" tabindex="0" data-index="${index}">
          <div class="material-meta">${order} / ${escapeHtml(item.topic)}</div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.summary)}</p>
          <div class="material-tags">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          <blockquote>${escapeHtml(item.mainQuote)}</blockquote>
          <ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        </article>
      `;
    }).join("");
  }

  function fillList(target, items) {
    target.innerHTML = asArray(items).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function initModal() {
    const modal = document.getElementById("detailModal");
    if (!modal) return;

    const closeBtn = document.getElementById("detailClose");
    const titleEl = document.getElementById("detailTitle");
    const topicEl = document.getElementById("detailTopic");
    const lifeEl = document.getElementById("detailLife");
    const quotesEl = document.getElementById("detailQuotes");
    const topicsEl = document.getElementById("detailTopics");
    const expandEl = document.getElementById("detailExpand");

    function openDetail(index) {
      const detail = materials()[index];
      if (!detail) return;

      const order = String(index + 1).padStart(2, "0");

      topicEl.textContent = `${order} / ${detail.topic}`;
      titleEl.textContent = detail.title;
      lifeEl.textContent = detail.life;
      fillList(quotesEl, detail.quotes);
      fillList(topicsEl, detail.topics);
      expandEl.textContent = detail.expand;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      closeBtn.focus();
    }

    function closeDetail() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll(".material-card").forEach((card) => {
      card.addEventListener("click", () => openDetail(Number(card.dataset.index)));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail(Number(card.dataset.index));
        }
      });
    });

    closeBtn.addEventListener("click", closeDetail);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeDetail();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeDetail();
    });
  }

  function downloadMaterialsDoc() {
    const rows = materials().map((item) => `
      <h2>${escapeHtml(item.title)}</h2>
      <p><strong>分类：</strong>${escapeHtml(item.topic)}</p>
      <p><strong>人物概述：</strong>${escapeHtml(item.summary)}</p>
      <p><strong>核心金句：</strong>${escapeHtml(item.mainQuote)}</p>
      <p><strong>人物生平：</strong>${escapeHtml(item.life)}</p>
      <p><strong>更多金句：</strong></p>
      <ul>${item.quotes.map((quote) => `<li>${escapeHtml(quote)}</li>`).join("")}</ul>
      <p><strong>适用话题：</strong>${item.topics.map(escapeHtml).join("、")}</p>
      <p><strong>写作角度：</strong></p>
      <ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      <p><strong>同主题拓展素材：</strong>${escapeHtml(item.expand)}</p>
      <hr>
    `).join("");

    const doc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>2026 第20周高考作文素材卡片墙</title>
        <style>
          body { font-family: "SimSun", "Microsoft YaHei", serif; line-height: 1.8; color: #2c2c2c; }
          h1 { text-align: center; font-size: 24px; }
          h2 { margin-top: 24px; font-size: 18px; color: #5a7085; }
          p, li { font-size: 14px; }
          hr { border: 0; border-top: 1px solid #e8dccb; margin: 22px 0; }
        </style>
      </head>
      <body>
        <h1>2026 第20周高考作文素材卡片墙</h1>
        ${rows}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", doc], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "2026-第20周高考作文素材卡片墙.doc";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function initDownloads() {
    document.querySelectorAll("[data-download-materials]").forEach((button) => {
      button.addEventListener("click", downloadMaterialsDoc);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadRemoteMaterials();
    renderMaterialCards();
    startCarousels();
    initModal();
    initDownloads();
  });
})();
