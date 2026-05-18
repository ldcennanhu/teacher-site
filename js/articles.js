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

  const standardCategories = {
    zuowen: [
      "人物素材",
      "万能金句",
      "思辨议论文",
      "考场范文",
      "写作技巧",
      "开头结尾模板",
      "热点主题",
      "审题立意"
    ],
    wenyan: [
      "实词积累",
      "虚词大全",
      "通假字",
      "特殊句式",
      "课内精讲",
      "翻译口诀",
      "断句训练",
      "文化常识"
    ],
    shici: [
      "必背默写",
      "意象意境",
      "情感主旨",
      "表达技巧",
      "诗歌题型",
      "名句积累",
      "课内精讲",
      "鉴赏模板"
    ],
    yuedu: [
      "论述类文本",
      "文学类文本",
      "实用类文本",
      "散文阅读",
      "小说阅读",
      "信息类文本",
      "答题模板",
      "真题训练"
    ],
    mingzhu: [
      "人物形象",
      "情节梳理",
      "主题思想",
      "艺术特色",
      "高频考点",
      "简答训练",
      "整本书阅读",
      "名著比较"
    ],
    beike: [
      "课堂课件",
      "教案文稿",
      "课堂学案",
      "练习题",
      "答案解析",
      "月考讲评",
      "知识点汇总",
      "公开下载"
    ]
  };

  const categoryAliases = {
    zuowen: {
      "人物": "人物素材",
      "人物素材": "人物素材",
      "名人素材": "人物素材",
      "作文人物": "人物素材",
      "人物事例": "人物素材",

      "金句": "万能金句",
      "万能金句": "万能金句",
      "作文金句": "万能金句",
      "名言金句": "万能金句",

      "思辨": "思辨议论文",
      "思辨作文": "思辨议论文",
      "思辨议论文": "思辨议论文",
      "议论文": "思辨议论文",

      "范文": "考场范文",
      "考场范文": "考场范文",
      "优秀作文": "考场范文",
      "高分作文": "考场范文",

      "技巧": "写作技巧",
      "写作技巧": "写作技巧",
      "作文技巧": "写作技巧",
      "写法指导": "写作技巧",

      "开头": "开头结尾模板",
      "结尾": "开头结尾模板",
      "开头结尾": "开头结尾模板",
      "开头结尾模板": "开头结尾模板",
      "作文模板": "开头结尾模板",

      "热点": "热点主题",
      "热点主题": "热点主题",
      "时事热点": "热点主题",
      "时代主题": "热点主题",

      "审题": "审题立意",
      "立意": "审题立意",
      "审题立意": "审题立意"
    },

    wenyan: {
      "实词": "实词积累",
      "文言实词": "实词积累",
      "高频实词": "实词积累",
      "实词积累": "实词积累",

      "虚词": "虚词大全",
      "文言虚词": "虚词大全",
      "高频虚词": "虚词大全",
      "虚词大全": "虚词大全",

      "通假": "通假字",
      "通假字": "通假字",
      "通假整理": "通假字",

      "句式": "特殊句式",
      "文言句式": "特殊句式",
      "特殊句式": "特殊句式",
      "判断句": "特殊句式",
      "被动句": "特殊句式",
      "倒装句": "特殊句式",

      "课内": "课内精讲",
      "课内文言": "课内精讲",
      "课内精讲": "课内精讲",
      "课文精讲": "课内精讲",

      "翻译": "翻译口诀",
      "翻译方法": "翻译口诀",
      "文言翻译": "翻译口诀",
      "翻译口诀": "翻译口诀",

      "断句": "断句训练",
      "文言断句": "断句训练",
      "断句训练": "断句训练",

      "文化常识": "文化常识",
      "古代文化常识": "文化常识",
      "文学常识": "文化常识"
    },

    shici: {
      "默写": "必背默写",
      "必背": "必背默写",
      "必背默写": "必背默写",
      "古诗文默写": "必背默写",

      "意象": "意象意境",
      "意境": "意象意境",
      "意象意境": "意象意境",

      "情感": "情感主旨",
      "主旨": "情感主旨",
      "情感主旨": "情感主旨",
      "思想感情": "情感主旨",

      "技巧": "表达技巧",
      "手法": "表达技巧",
      "表达技巧": "表达技巧",
      "艺术手法": "表达技巧",

      "题型": "诗歌题型",
      "诗歌题型": "诗歌题型",
      "诗词题型": "诗歌题型",

      "名句": "名句积累",
      "名句积累": "名句积累",
      "诗词名句": "名句积累",

      "课内": "课内精讲",
      "课内诗词": "课内精讲",
      "课内精讲": "课内精讲",

      "鉴赏": "鉴赏模板",
      "诗歌鉴赏": "鉴赏模板",
      "鉴赏模板": "鉴赏模板"
    },

    yuedu: {
      "论述类": "论述类文本",
      "论述类文本": "论述类文本",
      "论说文": "论述类文本",

      "文学类": "文学类文本",
      "文学类文本": "文学类文本",

      "实用类": "实用类文本",
      "实用类文本": "实用类文本",

      "散文": "散文阅读",
      "散文阅读": "散文阅读",

      "小说": "小说阅读",
      "小说阅读": "小说阅读",

      "信息类": "信息类文本",
      "信息类文本": "信息类文本",
      "非连续性文本": "信息类文本",

      "模板": "答题模板",
      "答题模板": "答题模板",
      "阅读模板": "答题模板",
      "答题技巧": "答题模板",

      "真题": "真题训练",
      "真题训练": "真题训练",
      "阅读真题": "真题训练"
    },

    mingzhu: {
      "人物": "人物形象",
      "人物形象": "人物形象",
      "人物分析": "人物形象",

      "情节": "情节梳理",
      "情节梳理": "情节梳理",
      "情节概括": "情节梳理",

      "主题": "主题思想",
      "主题思想": "主题思想",
      "思想主题": "主题思想",

      "艺术": "艺术特色",
      "艺术特色": "艺术特色",
      "写作特色": "艺术特色",

      "考点": "高频考点",
      "高频考点": "高频考点",
      "名著考点": "高频考点",

      "简答": "简答训练",
      "简答训练": "简答训练",
      "简答题": "简答训练",

      "整本书": "整本书阅读",
      "整本书阅读": "整本书阅读",

      "比较": "名著比较",
      "名著比较": "名著比较",
      "比较阅读": "名著比较"
    },

    beike: {
      "课件": "课堂课件",
      "课堂课件": "课堂课件",
      "PPT": "课堂课件",
      "ppt": "课堂课件",

      "教案": "教案文稿",
      "教案文稿": "教案文稿",
      "教学设计": "教案文稿",

      "学案": "课堂学案",
      "课堂学案": "课堂学案",
      "导学案": "课堂学案",

      "练习": "练习题",
      "练习题": "练习题",
      "训练题": "练习题",

      "答案": "答案解析",
      "答案解析": "答案解析",
      "解析": "答案解析",

      "月考": "月考讲评",
      "月考讲评": "月考讲评",
      "试卷讲评": "月考讲评",

      "知识点": "知识点汇总",
      "知识点汇总": "知识点汇总",
      "基础知识": "知识点汇总",

      "公开": "公开下载",
      "公开下载": "公开下载",
      "学生下载": "公开下载"
    }
  };

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

  function normalizeCategory(category, section) {
    const raw = String(category || "").trim();
    if (!raw) return "未分类";

    const aliases = categoryAliases[section] || {};
    return aliases[raw] || raw;
  }

  function currentSection() {
    return articleList?.dataset?.section || "";
  }

  function sectionArticles(articles) {
    const section = currentSection();
    return sortByDate(articles.filter((article) => article.section === section));
  }

  function categoryOrder(section, categories) {
    const standard = standardCategories[section] || [];
    const standardSet = new Set(standard);

    const standardPart = standard.filter((category) => categories.includes(category));
    const extraPart = categories.filter((category) => !standardSet.has(category));

    return [...standardPart, ...extraPart];
  }

  function uniqueCategories(articles) {
    const section = currentSection();
    const categories = [];
    const seen = new Set();

    articles.forEach((article) => {
      const category = normalizeCategory(article.category, article.section || section);

      if (!seen.has(category)) {
        seen.add(category);
        categories.push(category);
      }
    });

    return categoryOrder(section, categories);
  }

  function articleCard(article) {
    const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const category = normalizeCategory(article.category, article.section);

    return `
      <article class="article-list-card">
        <div>
          <span class="data-meta">${escapeHtml(category)}</span>
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

        const nextCategory = link.getAttribute("data-auto-category") || "全部";
        if (nextCategory === activeCategory) {
          articleList.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        activeCategory = nextCategory;

        articleList.style.transition = "opacity 180ms ease, transform 180ms ease";
        articleList.style.opacity = "0.25";
        articleList.style.transform = "translateY(8px)";

        window.setTimeout(() => {
          renderSideNav(currentArticles);
          renderArticleList(currentArticles);

          articleList.scrollIntoView({ behavior: "smooth", block: "start" });

          window.requestAnimationFrame(() => {
            articleList.style.opacity = "1";
            articleList.style.transform = "translateY(0)";
          });
        }, 140);
      });
    });
  }

  function renderArticleList(articles) {
    if (!articleList) return;

    let filtered = sectionArticles(articles);

    if (activeCategory !== "全部") {
      filtered = filtered.filter((article) => {
        const category = normalizeCategory(article.category, article.section);
        return category === activeCategory;
      });
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
        <span>${escapeHtml(normalizeCategory(article.category, article.section))}</span>
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
