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

  function normalizeRecommendation(item) {
    return {
      id: firstText(item.id),
      title: firstText(item.title),
      subtitle: firstText(item.subtitle),
      description: firstText(item.description),
      linkText: firstText(item.linkText, item.link_text),
      linkUrl: firstText(item.linkUrl, item.link_url),
      slot: firstText(item.slot),
      updatedAt: firstText(item.updatedAt, item.updated_at),
      publishedAt: firstText(item.publishedAt, item.published_at)
    };
  }

  function firstBySlot(items, slot) {
    return items.find((item) => item.slot === slot);
  }

  function applyText(selector, value) {
    if (!value) return;

    const target = document.querySelector(selector);
    if (target) {
      target.textContent = value;
    }
  }

  function applyHero(recommendation) {
    if (!recommendation) return;

    applyText("[data-home-hero-subtitle]", recommendation.subtitle);
    applyText("[data-home-hero-title]", recommendation.title);
    applyText("[data-home-hero-description]", recommendation.description);

    const primaryButton = document.querySelector("[data-home-hero-primary]");
    if (primaryButton) {
      if (recommendation.linkText) {
        primaryButton.textContent = recommendation.linkText;
      }

      if (recommendation.linkUrl) {
        primaryButton.setAttribute("href", recommendation.linkUrl);
      }
    }
  }

  function applyQuote(recommendation) {
    if (!recommendation) return;

    const text = recommendation.description || recommendation.title;
    if (!text) return;

    const target = document.querySelector("[data-home-quote-text]");
    if (!target) return;

    const carousel = target.closest("[data-material-carousel]");
    if (carousel) {
      carousel.removeAttribute("data-material-carousel");
    }

    const replacement = target.cloneNode(true);
    replacement.textContent = text;
    target.replaceWith(replacement);
  }

  function applyFeature(recommendation) {
    if (!recommendation) return;

    const featureLink = recommendation.linkUrl
      ? Array.from(document.querySelectorAll(".column-card")).find(
          (card) => card.getAttribute("href") === recommendation.linkUrl
        )
      : null;
    const target = featureLink || document.querySelector(".column-card");

    if (!target) return;

    const title = target.querySelector("h3");
    const description = target.querySelector("p");
    const enter = target.querySelector(".enter");

    if (recommendation.title && title) {
      title.textContent = recommendation.title;
    }

    if (recommendation.description && description) {
      description.textContent = recommendation.description;
    }

    if (recommendation.linkText && enter) {
      enter.textContent = recommendation.linkText;
    }

    if (recommendation.linkUrl) {
      target.setAttribute("href", recommendation.linkUrl);
    }
  }

  function applyRecommendations(items) {
    const recommendations = asArray(items).map(normalizeRecommendation).filter((item) => item.id);
    if (!recommendations.length) return;

    applyHero(firstBySlot(recommendations, "hero"));
    applyQuote(firstBySlot(recommendations, "quote"));
    applyFeature(firstBySlot(recommendations, "feature"));
  }

  async function loadHomeRecommendations() {
    if (!window.fetch) return;

    try {
      const response = await window.fetch("/api/home-recommendations", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data) || !data.length) return;

      applyRecommendations(data);
    } catch (error) {
      window.console.warn("首页推荐接口暂不可用，继续显示静态首页内容。", error);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHomeRecommendations);
})();
