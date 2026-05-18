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

  function normalizeSlot(slot) {
    const value = firstText(slot);

    const aliases = {
      hero: "home_hero",
      home_hero: "home_hero",

      quote: "home_quote",
      home_quote: "home_quote",

      feature: "home_featured",
      home_featured: "home_featured",

      home_latest: "home_latest",

      writing: "writing",
      reading: "reading",
      teaching: "teaching"
    };

    return aliases[value] || value;
  }

  function normalizeRecommendation(item) {
    return {
      id: firstText(item.id),
      title: firstText(item.title),
      subtitle: firstText(item.subtitle),
      description: firstText(item.description),
      linkText: firstText(item.linkText, item.link_text),
      linkUrl: firstText(item.linkUrl, item.link_url),
      slot: normalizeSlot(item.slot),
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

  function findColumnCardByHref(href) {
    if (!href) return null;

    const normalizedHref = href.replace(/^\//, "");

    return Array.from(document.querySelectorAll(".column-card")).find((card) => {
      const cardHref = card.getAttribute("href") || "";
      return cardHref === href || cardHref === normalizedHref || `/${cardHref}` === href;
    });
  }

  function applyColumnCard(recommendation, fallbackHref) {
    if (!recommendation) return;

    const target =
      findColumnCardByHref(recommendation.linkUrl) ||
      findColumnCardByHref(fallbackHref);

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

  function applyFeatured(recommendation) {
    if (!recommendation) return;

    const target =
      findColumnCardByHref(recommendation.linkUrl) ||
      document.querySelector(".column-card");

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

  function applyLatest(recommendation) {
    if (!recommendation) return;

    const section = document.querySelector(".latest-updates");
    if (!section) return;

    const heading = section.querySelector(".section-heading h2");
    const description = section.querySelector(".section-heading p");

    if (recommendation.title && heading) {
      heading.textContent = recommendation.title;
    }

    if (recommendation.description && description) {
      description.textContent = recommendation.description;
    }
  }

  function applyRecommendations(items) {
    const recommendations = asArray(items)
      .map(normalizeRecommendation)
      .filter((item) => item.id);

    if (!recommendations.length) return;

    applyHero(firstBySlot(recommendations, "home_hero"));
    applyQuote(firstBySlot(recommendations, "home_quote"));
    applyFeatured(firstBySlot(recommendations, "home_featured"));
    applyLatest(firstBySlot(recommendations, "home_latest"));

    applyColumnCard(firstBySlot(recommendations, "writing"), "zuowen.html");
    applyColumnCard(firstBySlot(recommendations, "reading"), "yuedu.html");
    applyColumnCard(firstBySlot(recommendations, "teaching"), "beike.html");
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
