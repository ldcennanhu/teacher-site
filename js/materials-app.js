(function () {
  const INTERVAL = 7000;

  function materials() {
    return window.GDTK_MATERIALS || [];
  }

  function quoteList() {
    return materials().map((item) => item.mainQuote).filter(Boolean);
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

  function renderMaterialCards() {
    const grid = document.querySelector("[data-material-grid]");
    if (!grid) return;
    grid.innerHTML = materials().map((item, index) => `
      <article class="material-card" role="button" tabindex="0" data-index="${index}">
        <div class="material-meta">${item.topic}</div>
        <h2>${item.title}</h2>
        <p>${item.summary}</p>
        <div class="material-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <blockquote>${item.mainQuote}</blockquote>
        <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
    `).join("");
  }

  function fillList(target, items) {
    target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
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
      topicEl.textContent = detail.topic;
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

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  document.addEventListener("DOMContentLoaded", () => {
    startCarousels();
    renderMaterialCards();
    initModal();
    initDownloads();
  });
})();
