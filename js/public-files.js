(function () {
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

  function normalizeFile(file) {
    return {
      id: firstText(file.id),
      title: firstText(file.title) || "未命名备课文件",
      fileType: firstText(file.fileType, file.file_type),
      category: firstText(file.category),
      grade: firstText(file.grade),
      textbook: firstText(file.textbook),
      unitName: firstText(file.unitName, file.unit_name),
      lessonType: firstText(file.lessonType, file.lesson_type),
      summary: firstText(file.summary),
      tags: asArray(file.tags).filter(Boolean),
      updatedAt: firstText(file.updatedAt, file.updated_at)
    };
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
  }

  function metaList(file) {
    return [
      ["类型", file.fileType],
      ["年级", file.grade],
      ["教材", file.textbook],
      ["单元", file.unitName],
      ["课型", file.lessonType]
    ].filter((item) => item[1]);
  }

  function renderFiles(target, files) {
    const rows = files.map(normalizeFile).filter((file) => file.id);
    if (!rows.length) return;

    const section = target.closest("[data-public-files-section]");
    if (section) {
      section.hidden = false;
    }

    target.innerHTML = `
      <div class="public-file-grid">
        ${rows.map((file) => `
          <article class="data-card public-file-card">
            <div>
              <span class="data-meta">公开备课文件${file.category ? ` · ${escapeHtml(file.category)}` : ""}</span>
              <h3>${escapeHtml(file.title)}</h3>
              <dl class="public-file-meta">
                ${metaList(file).map(([label, value]) => `
                  <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>
                `).join("")}
              </dl>
              ${file.summary ? `<p>${escapeHtml(file.summary)}</p>` : ""}
              ${file.tags.length ? `
                <div class="data-tags">
                  ${file.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
                </div>
              ` : ""}
            </div>
            <div class="data-card-footer">
              <span>更新：${escapeHtml(formatDate(file.updatedAt))}</span>
              <a class="read-link" href="/api/public-files/${encodeURIComponent(file.id)}/download">下载</a>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  async function loadPublicFiles() {
    const target = document.querySelector("[data-public-files]");
    if (!target || !window.fetch) return;

    try {
      const response = await window.fetch("/api/public-files", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data) || !data.length) return;

      renderFiles(target, data);
    } catch (error) {
      window.console.warn("公开备课文件暂不可用，继续显示静态备课内容。", error);
    }
  }

  document.addEventListener("DOMContentLoaded", loadPublicFiles);
})();
