/**
 * LibCustomizer Pro v5.6 — Top Header Fix, Uniform Dense Sections & Zero-Trace Block Hiding
 * Supported domains: mangalib.me, mangalib.org, *.shlib.life, *.animelib.org, ranobelib.me, ranobelib.org, hentailib.me
 */
(function () {
  'use strict';

  const STYLE_ID = 'lib-customizer-pro-styles';
  const FLOAT_BTN_ID = 'lib-customizer-float-trigger';
  const PANEL_ID = 'lib-customizer-inpage-drawer';

  const DEFAULT_CONFIG = {
  "themePreset": "dark_slate",
  "bgPrimary": "#0B0F17",
  "bgSecondary": "#111827",
  "bgCard": "#172033",
  "textPrimary": "#F1F5F9",
  "textMuted": "#94A3B8",
  "accentColor": "#FF7A00",
  "glassmorphism": true,
  "glassBlurPx": 14,
  "cardOpacity": 92,
  "forumOpacity": 92,
  "customBgUrl": "",
  "bgDimming": 68,
  "homeBlocks": [
    {
      "id": "popular-updates",
      "label": "Популярные обновления (верхняя карусель)",
      "enabled": true,
      "zone": "top"
    },
    {
      "id": "hot-newest",
      "label": "Горячие новинки",
      "enabled": true,
      "zone": "top"
    },
    {
      "id": "latest-views",
      "label": "Продолжить читать",
      "enabled": true,
      "zone": "top"
    },
    {
      "id": "top-views",
      "label": "Сейчас читают (Новинки / Набирающее / Популярное)",
      "enabled": true,
      "zone": "top"
    },
    {
      "id": "slider",
      "label": "Рекламный слайдер (Баннер)",
      "enabled": false,
      "zone": "top"
    },
    {
      "id": "latest-updates",
      "label": "Последние обновления (левая лента)",
      "enabled": true,
      "zone": "main"
    },
    {
      "id": "telegram",
      "label": "Плашка Telegram-канала",
      "enabled": false,
      "zone": "sidebar"
    },
    {
      "id": "forum",
      "label": "Последние темы форума",
      "enabled": true,
      "zone": "sidebar"
    },
    {
      "id": "reviews",
      "label": "Последние отзывы",
      "enabled": true,
      "zone": "sidebar"
    },
    {
      "id": "collections",
      "label": "Последние коллекции",
      "enabled": true,
      "zone": "sidebar"
    },
    {
      "id": "top-users",
      "label": "Топ чтения за неделю",
      "enabled": true,
      "zone": "sidebar"
    },
    {
      "id": "newest",
      "label": "Новинки (в боковой колонке)",
      "enabled": true,
      "zone": "sidebar"
    }
  ],
  "containerMaxWidth": 1440,
  "gridColumns": 5,
  "cardBorderRadius": 16,
  "posterAspectRatio": "2/3",
  "cardHoverEffect": "lift",
  "stickyHeaderMode": "always",
  "compactHeader": false,
  "customScrollbar": true,
  "mangaMaxWidth": 960,
  "mangaPageGap": 0,
  "mangaBrightness": 100,
  "mangaContrast": 102,
  "mangaSepia": 0,
  "mangaAutoCropBorders": false,
  "ranobeFontFamily": "Lora",
  "ranobeFontSize": 18,
  "ranobeLineHeight": 1.75,
  "ranobeParaSpacing": 16,
  "ranobeTextAlign": "justify",
  "animeTheaterMode": true,
  "animeAmbilightGlow": true,
  "animeHidePlayerControlsIdle": true,
  "adblockEnabled": true,
  "adblockYandexMetrika": true,
  "adblockFloatingBanners": true,
  "adblockCollapsePlaceholders": true,
  "hideTopBanners": true,
  "hideSidebarWidgets": false,
  "hideCommentsSection": false,
  "blurSpoilerComments": false,
  "hideRatingsAndScores": false,
  "hideChapterCounters": false,
  "nsfwBlurPosters": false,
  "panicKeyEnabled": true,
  "panicKeyCode": "F9",
  "panicRedirectUrl": "https://www.google.com",
  "customCss": "/* Ваши собственные CSS-правила для всех сайтов семейства Lib */",
  "hotkeyFloatButton": false
};
  let currentConfig = Object.assign({}, DEFAULT_CONFIG);

  function hexToRgb(hex) {
    const clean = (hex || '#FF7A00').replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const num = parseInt(full, 16) || 0;
    return ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255);
  }

  function buildCssFromConfig(cfg) {
    const primaryRgb = hexToRgb(cfg.bgPrimary);
    const cardRgb = hexToRgb(cfg.bgCard);
    const accentRgb = hexToRgb(cfg.accentColor);
    const hasWallpaper = Boolean(cfg.customBgUrl && cfg.customBgUrl.trim().length > 0);

    // Boost legacy 82% default to 92% so all sections have the dense lower-block look without double-stacking
    const rawOpacity = Number(cfg.cardOpacity) || 92;
    const normalizedOpacity = rawOpacity === 82 ? 92 : rawOpacity;
    const baseAlpha = Math.min(Math.max(normalizedOpacity / 100, 0.4), 1);

    const rawForumOpacity = cfg.forumOpacity !== undefined ? Number(cfg.forumOpacity) : normalizedOpacity;
    const forumAlpha = Math.min(Math.max(rawForumOpacity / 100, 0), 1).toFixed(2);

    const effectiveCardAlpha = baseAlpha.toFixed(2);
    const midElevatedAlpha = Math.min(baseAlpha + 0.03, 0.96).toFixed(2);
    const elevatedAlpha = Math.min(baseAlpha + 0.05, 0.98).toFixed(2);
    const nestedItemAlpha = Math.max(baseAlpha - 0.16, 0.58).toFixed(2);
    const radiusPx = Math.max(Number(cfg.cardBorderRadius) || 16, 12);
    const radiusSm = Math.max(radiusPx - 4, 10);

    const blocks = Array.isArray(cfg.homeBlocks) ? cfg.homeBlocks : DEFAULT_CONFIG.homeBlocks;
    const effectivelyDisabled = blocks.filter((b) => !b.enabled || (cfg.adblockEnabled && b.id === 'slider'));
    const effectivelyEnabled = blocks.filter((b) => b.enabled && !(cfg.adblockEnabled && b.id === 'slider'));
    const enabledSelectors = effectivelyEnabled.map((b) => '[data-home-block="' + b.id + '"]').join(', ');

    const disabledRules = effectivelyDisabled
      .map((b) =>
        '[data-home-block="' + b.id + '"], ' +
        '.section[data-home-block="' + b.id + '"], ' +
        'a[data-home-block="' + b.id + '"], ' +
        '.section:has([data-home-block="' + b.id + '"]):not(:has([data-home-block]:not([data-home-block="' + b.id + '"]))), ' +
        '.paper:has([data-home-block="' + b.id + '"]):not(:has([data-home-block]:not([data-home-block="' + b.id + '"]))), ' +
        'div:has(> [data-home-block="' + b.id + '"]):not(:has([data-home-block]:not([data-home-block="' + b.id + '"]))) ' +
        '{ display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: none !important; overflow: hidden !important; pointer-events: none !important; }'
      )
      .join('\n');

    const parentCleanRule = enabledSelectors
      ? '.section:has([data-home-block]):not(:has(' + enabledSelectors + ')), .paper:has([data-home-block]):not(:has(' + enabledSelectors + ')) { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; backdrop-filter: none !important; box-shadow: none !important; overflow: hidden !important; }'
      : '';

    const blockRules = disabledRules + '\n' + parentCleanRule;

    return `
:root, html, body, [data-theme], [data-scheme], [data-color-scheme], [data-mode] {
  --lib-bg-primary: ${cfg.bgPrimary} !important;
  --lib-bg-secondary: ${cfg.bgCard} !important;
  --lib-bg-card: rgba(${cardRgb}, ${effectiveCardAlpha}) !important;
  --lib-bg-elevated: rgba(${cardRgb}, ${elevatedAlpha}) !important;
  --lib-bg-nested: rgba(${cardRgb}, ${nestedItemAlpha}) !important;
  --lib-text-primary: ${cfg.textPrimary} !important;
  --lib-text-muted: color-mix(in srgb, var(--text-primary) 72%, #000000) !important;
  --lib-accent: ${cfg.accentColor} !important;
  --lib-accent-rgb: ${accentRgb} !important;
  --lib-radius: ${radiusPx}px !important;
  --lib-radius-sm: ${radiusSm}px !important;
  --lib-container-width: ${cfg.containerMaxWidth || 1440}px !important;

  /* Forum dedicated opacity & transparent border custom properties */
  --forum-opacity: ${forumAlpha} !important;
  --forum-bg: rgba(${cardRgb}, ${forumAlpha}) !important;
  --forum-border: transparent !important;

  /* --foreground repeats --background-elevated-1 at rich uniform density! */
  --background-elevated-1: rgba(${cardRgb}, ${effectiveCardAlpha}) !important;
  --background-elevated-2: rgba(${cardRgb}, ${midElevatedAlpha}) !important;
  --background-elevated-3: rgba(${cardRgb}, ${elevatedAlpha}) !important;
  --foreground: var(--background-elevated-1) !important;
  --foreground-rgb: ${cardRgb} !important;
  --btn-light-bg: rgba(${cardRgb}, ${nestedItemAlpha}) !important;
  --btn-light-bg-hover: rgba(${accentRgb}, 0.18) !important;

  /* Header & Navbar Tokens */
  --header-bg: var(--background-elevated-3) !important;
  --navbar-bg: var(--background-elevated-3) !important;
  --bg-header: var(--background-elevated-3) !important;
  --background-header: var(--background-elevated-3) !important;
  --background-navbar: var(--background-elevated-3) !important;
  --background-sticky: var(--background-elevated-3) !important;

  --background: ${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --background-base: ${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --bg-primary: ${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --bg-secondary: var(--background-elevated-1) !important;
  --bg-tertiary: var(--background-elevated-2) !important;
  --bg-elevated: var(--background-elevated-3) !important;
  --bg-elevated-1: var(--background-elevated-1) !important;
  --bg-elevated-2: var(--background-elevated-2) !important;
  --bg-elevated-3: var(--background-elevated-3) !important;
  --bg-modal: var(--background-elevated-3) !important;
  --bg-popover: var(--background-elevated-3) !important;
  --bg-dropdown: var(--background-elevated-3) !important;
  --bg-drawer: var(--background-elevated-3) !important;
  --bg-card: var(--background-elevated-1) !important;
  --bg-paper: var(--background-elevated-1) !important;
  --bg-surface: var(--background-elevated-1) !important;
  --bg-input: var(--btn-light-bg) !important;

  --border-radius: var(--lib-radius) !important;
  --radius: var(--lib-radius) !important;
  --radius-sm: var(--lib-radius-sm) !important;
  --radius-md: var(--lib-radius) !important;
  --primary-color: ${cfg.accentColor} !important;
  --accent-color: ${cfg.accentColor} !important;
  --color-primary: ${cfg.accentColor} !important;
  --orange: ${cfg.accentColor} !important;
  --blue: ${cfg.accentColor} !important;
  --border-color: rgba(255, 255, 255, 0.08) !important;
  --divider-color: rgba(255, 255, 255, 0.06) !important;
  --text-primary: ${cfg.textPrimary} !important;
  --text-secondary: color-mix(in srgb, var(--text-primary) 72%, #000000) !important;
  --text-muted: var(--text-secondary) !important;
}

html {
  background-color: ${cfg.bgPrimary} !important;
  color: ${cfg.textPrimary} !important;
  color-scheme: dark !important;
}

${hasWallpaper ? `
html::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: linear-gradient(rgba(${primaryRgb}, ${((cfg.bgDimming || 68) / 100).toFixed(2)}), rgba(${primaryRgb}, ${((cfg.bgDimming || 68) / 100).toFixed(2)})), url("${cfg.customBgUrl.trim()}");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}
body, #app, .app, .page, .layout, .site-wrapper, main,
[class*="layout__content"], [class*="page__wrapper"], [class*="reader-wrapper"] {
  background: transparent !important;
  background-color: transparent !important;
  color: ${cfg.textPrimary} !important;
  position: relative;
  z-index: 1;
}` : `
body, #app, .app, .page, .layout, .site-wrapper, main,
[class*="layout__content"], [class*="page__wrapper"] {
  background: ${cfg.bgPrimary} !important;
  background-color: ${cfg.bgPrimary} !important;
  color: ${cfg.textPrimary} !important;
}`}

/* Top Navigation Header Bar (where MangaLIB logo, Каталог, Поиск, Форум live) */
[data-lc-header="1"],
header,
.header,
.navbar,
.layout__header,
[role="banner"],
[class*="header__container"],
[class*="layout__header"],
[class*="app-header"],
[class*="reader-header"],
nav[class*="header"],
div[class*="header"]:not([class*="section"]):not([class*="card"]):not([class*="topic"]),
div[class*="navbar"],
div[class*="top-bar"],
div[class*="topbar"],
div:has(> div > a[href*="mangalib"]):not(:has([data-home-block])):not(:has(.section)):not(:has(main)),
div:has(> a[href*="mangalib"]):not(:has([data-home-block])):not(:has(.section)):not(:has(main)) {
  background: var(--background-elevated-3) !important;
  background-color: var(--background-elevated-3) !important;
  color: ${cfg.textPrimary} !important;
  ${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important;' : ''}
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
}

[data-lc-header-inner="1"],
header > div,
header > nav,
.header > div,
.navbar > div,
[role="banner"] > div,
[data-lc-header="1"] > div,
[data-lc-header="1"] > div > div {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

/* Main Sections & [data-home-block] Containers — Single Uniform Layer (No Double Opacity or Double Borders!) */
.section:not([data-home-block="slider"]),
[data-home-block]:not([data-home-block="slider"]),
[data-home-block="popular-updates"], [data-home-block="hot-newest"], [data-home-block="latest-views"],
[data-home-block="continue"], [data-home-block="top-views"], [data-home-block="forum"],
[data-home-block="reviews"], [data-home-block="collections"], [data-home-block="latest-updates"],
[data-home-block="top-users"], [data-home-block="newest"], [data-home-block="telegram"],
[class*="faq-content"], [class*="rules-content"], [class*="comments-section"] {
  background: var(--background-elevated-1) !important;
  background-color: var(--background-elevated-1) !important;
  color: ${cfg.textPrimary} !important;
  border-radius: var(--lib-radius) !important;
  ${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important;' : ''}
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Forum Page & Discussion Surfaces — Customizable Opacity & Transparent Border (as requested in DevTools) */
[class*="forum"],
[class*="topics"],
[class*="discussion"],
main:has([class*="forum"]) [class*="sidebar"],
main:has([class*="forum"]) aside,
[class*="forum"] [class*="sidebar"],
[class*="forum-sidebar"],
[class*="forum-categories"],
[class*="forum-content"],
[class*="forum-list"],
[class*="topics-list"],
[class*="pinned-topics"],
[class*="topic-item"],
[class*="thread-item"],
[class*="post-item"] {
  background-color: var(--forum-bg) !important;
  color: ${cfg.textPrimary} !important;
  ${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important;' : ''}
  border: 1px solid transparent !important;
  border-radius: var(--lib-radius) !important;
  box-shadow: none !important;
}

/* Forum search input & filter buttons */
[class*="forum"] input,
[class*="forum"] [class*="search"],
[class*="forum"] [class*="filter"],
[class*="forum"] [class*="select"] {
  background-color: var(--btn-light-bg) !important;
  color: ${cfg.textPrimary} !important;
  border: 1px solid transparent !important;
  border-radius: var(--lib-radius-sm) !important;
}

/* Topic rows inside the forum list — clean readable cards with transparent border */
[class*="topic-item"],
[class*="forum-item"],
[class*="thread-card"],
[class*="forum"] [class*="card"],
[class*="forum"] article,
[class*="pinned-topics"] > * {
  background-color: var(--btn-light-bg) !important;
  border: 1px solid transparent !important;
  border-radius: var(--lib-radius-sm) !important;
  margin-bottom: 8px !important;
  padding: 10px 14px !important;
  transition: background-color 0.16s ease, border-color 0.16s ease !important;
}

[class*="topic-item"]:hover,
[class*="forum-item"]:hover,
[class*="thread-card"]:hover,
[class*="forum"] [class*="card"]:hover,
[class*="forum"] article:hover,
[class*="pinned-topics"] > *:hover {
  background-color: var(--btn-light-bg-hover) !important;
  border-color: rgba(${accentRgb}, 0.35) !important;
}

/* Category menu items in forum sidebar */
[class*="forum"] [class*="category"],
[class*="forum"] [class*="nav-item"],
[class*="forum"] aside a,
[class*="forum"] [class*="sidebar"] a {
  border-radius: var(--lib-radius-sm) !important;
  color: ${cfg.textPrimary} !important;
  padding: 6px 10px !important;
  transition: background-color 0.15s ease, color 0.15s ease !important;
}

[class*="forum"] [class*="category"]:hover,
[class*="forum"] [class*="nav-item"]:hover,
[class*="forum"] aside a:hover,
[class*="forum"] [class*="sidebar"] a:hover {
  background-color: var(--btn-light-bg-hover) !important;
  color: #ffffff !important;
}

[class*="forum"] [class*="active"],
[class*="forum"] .is-active,
[class*="forum"] [aria-current="page"] {
  background-color: var(--btn-light-bg) !important;
  border-left: 3px solid ${cfg.accentColor} !important;
  font-weight: 600 !important;
}

/* Prevent nested homepage block wrappers from adding extra layers — NEVER affects forum */
.section[data-home-block] .section,
.section[data-home-block] .paper,
.section[data-home-block] .card-box,
.section[data-home-block] .box,
[data-home-block] .section,
[data-home-block] .paper,
[data-home-block] .card-box,
[data-home-block] .box,
.section[data-home-block] > div:not(.wb):not([class*="wb"]):not([class*="card"]):not([class*="item"]):not([class*="topic"]):not([class*="forum"]):not([class*="sidebar"]),
[data-home-block] > div:not(.wb):not([class*="wb"]):not([class*="card"]):not([class*="item"]):not([class*="topic"]):not([class*="forum"]):not([class*="sidebar"]) {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
}

.wb.c1, .wb_c1, .wb, [class*="wb"][class*="c1"],
[data-home-block="continue"] a[class],
[data-home-block="continue"] > div > div > div,
[data-home-block="reviews"] a[class],
[data-home-block="reviews"] article,
[data-home-block="collections"] a[class],
[data-home-block="top-users"] a[class],
[data-home-block="latest-views"] > div > div > div,
[class*="related"] a[class], [class*="similar"] a[class], [class*="translator"] a[class],
[class*="calendar"] [class*="day"], [class*="calendar"] [class*="cell"] {
  background-color: var(--btn-light-bg) !important;
  color: ${cfg.textPrimary} !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: var(--lib-radius-sm) !important;
  transition: background-color 0.16s ease, border-color 0.16s ease !important;
}

.wb.c1:hover, .wb_c1:hover, .wb:hover,
[data-home-block="continue"] a[class]:hover,
[data-home-block="reviews"] a[class]:hover,
[data-home-block="collections"] a[class]:hover,
[data-home-block="top-users"] a[class]:hover,
[data-home-block="latest-views"] > div > div > div:hover,
[class*="related"] a[class]:hover, [class*="similar"] a[class]:hover, [class*="translator"] a[class]:hover {
  background-color: var(--btn-light-bg-hover) !important;
  border-color: rgba(${accentRgb}, 0.45) !important;
  color: ${cfg.textPrimary} !important;
}

.section > [class*="header"], .section > [class*="body"], .section > [class*="footer"],
.paper > [class*="header"], .paper > [class*="body"], .paper > [class*="footer"],
[class*="section__header"], [class*="section__body"], [class*="section-header"], [class*="section-body"],
[class*="tabs-wrapper"], [class*="subnav"], [class*="filter-bar"], [class*="chapters-header"] {
  background: transparent !important;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

${blockRules}

.section:empty, .paper:empty {
  display: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.dropdown-menu, .popover, .modal, .dialog, .drawer, .offcanvas, .menu, .popper,
[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper] > *,
[data-floating-ui-portal] > *, .tippy-box, .v-popper__inner,
[class*="notifications"], [class*="notification-list"], [class*="popover"], [class*="dropdown"] {
  background-color: var(--background-elevated-3) !important;
  color: ${cfg.textPrimary} !important;
  ${cfg.glassmorphism ? 'backdrop-filter: blur(' + Math.max(cfg.glassBlurPx || 14, 16) + 'px) saturate(160%) !important; -webkit-backdrop-filter: blur(' + Math.max(cfg.glassBlurPx || 14, 16) + 'px) saturate(160%) !important;' : ''}
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: var(--lib-radius) !important;
}

[data-lc-comment-root="1"],
[class*="comments-section"],
[class*="comments-wrap"] {
  background-color: var(--background-elevated-1) !important;
  color: var(--text-primary) !important;
  border-radius: var(--lib-radius) !important;
}

.comment, .comment-item, [class*="comment__item"], [class*="comment-body"], [class*="comment__body"],
[class*="comment__content"], .comment__replies, .comment-reply,
[class*="comment-children"], [class*="comment-reply"], [class*="comments-item"],
[class*="comment"] [class*="comment"],
[class*="comments"] [class*="comment"],
[data-lc-comment-inner="1"] {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  color: var(--text-primary) !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.comment__replies, [class*="comment-children"], [class*="comment-replies"] {
  border-left: 2px solid rgba(${accentRgb}, 0.32) !important;
  padding-left: 14px !important;
  margin-left: 8px !important;
}

/* Bottom Footer (.x6_e4 & footer) — Unified Full-Width Theme Surface & Transparent Inner Rows */
.x6_e4,
[class*="x6_e4"],
footer,
.footer,
[role="contentinfo"],
[data-lc-footer="1"] {
  background: var(--background-elevated-3) !important;
  background-color: var(--background-elevated-3) !important;
  color: var(--text-primary) !important;
  ${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important;' : ''}
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

[data-lc-footer-sub="1"] {
  border-top: none !important;
}

.x6_e4 *:not(button):not(input),
[class*="x6_e4"] *:not(button):not(input),
footer *:not(button):not(input),
.footer *:not(button):not(input),
[data-lc-footer-sub="1"] *:not(button):not(input) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 1px solid transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.x6_e4 a,
[class*="x6_e4"] a,
footer a,
.footer a,
[data-lc-footer="1"] a {
  color: var(--text-primary) !important;
  text-decoration-color: rgba(255, 255, 255, 0.3) !important;
  transition: color 0.15s ease !important;
}

.x6_e4 a:hover,
[class*="x6_e4"] a:hover,
footer a:hover,
.footer a:hover,
[data-lc-footer="1"] a:hover {
  color: var(--lib-accent) !important;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
textarea, select, .input, .form-control, .select,
[class*="input-wrapper"], [class*="search-input"], [class*="comment-input"],
[class*="filter-input"], [class*="textarea"], [class*="select__control"] {
  background-color: var(--btn-light-bg) !important;
  color: ${cfg.textPrimary} !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: var(--lib-radius-sm) !important;
}

button, .btn, [role="button"], .tag, .chip {
  border-radius: var(--lib-radius-sm) !important;
}

button.btn-primary, .btn-primary, .button--primary, [class*="btn_variant_primary"],
[class*="btn-orange"], [class*="btn-blue"], [class*="btn-success"], [class*="btn-green"],
button[type="submit"] {
  background-color: var(--lib-accent) !important;
  border-color: var(--lib-accent) !important;
  color: #ffffff !important;
}

${cfg.adblockEnabled ? `
div.section[data-home-block="slider"],
.section[data-home-block="slider"],
[data-home-block="slider"],
.section:has([data-home-block="slider"]),
.paper:has([data-home-block="slider"]),
div.aaf_s,
.aaf_s,
.aaf_c9,
[class^="aaf_"],
[class*=" aaf_"],
[id^="yandex_rtb"],
[id*="yandex_rtb"],
[class*="yandex_rtb"],
[class*="ya-partner"],
ins.adsbygoogle,
iframe[src*="yandex"],
iframe[src*="ads"],
iframe[src*="doubleclick"],
iframe[src*="adriver"],
.ad-banner,
.ads-wrapper,
.adv-block,
.promo-banner {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  overflow: hidden !important;
}` : ''}

${cfg.customCss || ''}
`;
  }

  function markTopHeader() {
    if (!document.body && !document.documentElement) return;

    // 1. Scan for fixed or sticky bar at the top of the viewport
    const candidates = document.querySelectorAll('header, nav, [role="banner"], [class*="header"], [class*="navbar"], [class*="topbar"], [class*="app-header"], div');
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      if (el.tagName === 'MAIN' || el.tagName === 'FOOTER' || el.closest('main') || el.closest('footer')) continue;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const isTopAligned = rect.top >= -10 && rect.top <= 25;
      const isHeaderHeight = rect.height >= 36 && rect.height <= 100;
      const isHeaderWidth = rect.width >= window.innerWidth * 0.7;
      const isFixedOrSticky = style.position === 'fixed' || style.position === 'sticky';
      const hasHeaderClass = /header|navbar|topbar|nav-bar/i.test(el.className || '');

      if ((isFixedOrSticky && isTopAligned && isHeaderHeight && isHeaderWidth) || (hasHeaderClass && isTopAligned && isHeaderHeight && isHeaderWidth)) {
        if (!el.hasAttribute('data-lc-header')) {
          el.setAttribute('data-lc-header', '1');
          const inners = el.querySelectorAll(':scope > div, :scope > nav, :scope > div > div');
          inners.forEach(function (ch) { ch.setAttribute('data-lc-header-inner', '1'); });
        }
        break;
      }
    }

    // 2. Scan via MangaLIB logo anchor
    const logoLinks = document.querySelectorAll('a[href="/"], a[href^="/ru"], a[href*="mangalib"], a[href*="ranobelib"], a[href*="animelib"], [class*="logo"]');
    for (let i = 0; i < logoLinks.length; i++) {
      let cur = logoLinks[i].parentElement;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        const rect = cur.getBoundingClientRect();
        if (rect.top <= 25 && rect.height >= 36 && rect.height <= 100 && rect.width >= window.innerWidth * 0.7) {
          if (!cur.hasAttribute('data-lc-header')) {
            cur.setAttribute('data-lc-header', '1');
            cur.querySelectorAll(':scope > div, :scope > nav, :scope > div > div').forEach(function (ch) { ch.setAttribute('data-lc-header-inner', '1'); });
          }
          break;
        }
        cur = cur.parentElement;
      }
    }

    // 0. Clean up any stale attributes from parent layout containers
    document.querySelectorAll('[data-lc-footer], [data-lc-footer-inner], [data-lc-comment-root], [data-lc-comment-inner]').forEach(function (el) {
      if (
        el.tagName === 'MAIN' ||
        el.tagName === 'BODY' ||
        el.id === 'app' ||
        el.hasAttribute('data-home-block') ||
        el.classList.contains('section') ||
        el.querySelector('main, [data-home-block], .section, header')
      ) {
        el.removeAttribute('data-lc-footer');
        el.removeAttribute('data-lc-footer-inner');
        el.removeAttribute('data-lc-comment-root');
        el.removeAttribute('data-lc-comment-inner');
      }
    });

    // 3. Mark Bottom Footer (.x6_e4, footer, and copyright bar "ООО Мангалиб") without climbing into page layout
    const footerEls = document.querySelectorAll('.x6_e4, [class*="x6_e4"], footer, .footer, [role="contentinfo"]');
    footerEls.forEach(function (fEl) {
      if (fEl.querySelector('main, [data-home-block], .section, header')) return;
      if (!fEl.hasAttribute('data-lc-footer')) {
        fEl.setAttribute('data-lc-footer', '1');
      }
      if (fEl.nextElementSibling && fEl.nextElementSibling.tagName !== 'SCRIPT') {
        const nextEl = fEl.nextElementSibling;
        const nextRect = nextEl.getBoundingClientRect();
        const nextText = (nextEl.textContent || '').toLowerCase();
        if (
          nextRect.height <= 120 &&
          !nextEl.querySelector('main, [data-home-block], .section') &&
          (nextText.includes('мангалиб') || nextText.includes('mangalib') || nextText.includes('125319') || nextText.includes('ооо') || nextText.includes('все права'))
        ) {
          nextEl.setAttribute('data-lc-footer', '1');
          nextEl.setAttribute('data-lc-footer-sub', '1');
        }
      }
    });
  }

  let lcMarkTimer = null;
  function scheduleMarkLayout() {
    if (lcMarkTimer) return;
    lcMarkTimer = setTimeout(function () {
      lcMarkTimer = null;
      markTopHeader();
    }, 220);
  }

  // Hook markTopHeader across document lifecycle & dynamic comment loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markTopHeader);
  } else {
    markTopHeader();
  }
  window.addEventListener('load', markTopHeader);
  window.addEventListener('scroll', scheduleMarkLayout, { passive: true });
  window.addEventListener('click', scheduleMarkLayout, { passive: true });
  setTimeout(markTopHeader, 400);
  setTimeout(markTopHeader, 1200);
  setTimeout(markTopHeader, 2500);
  if (typeof MutationObserver !== 'undefined') {
    const obs = new MutationObserver(scheduleMarkLayout);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function injectOrUpdateStyle(cssText) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      styleEl.type = 'text/css';
      (document.head || document.documentElement).appendChild(styleEl);
    }
    if (styleEl.textContent !== cssText) {
      styleEl.textContent = cssText;
    }
  }

  function applyConfig(newCfg) {
    currentConfig = Object.assign({}, DEFAULT_CONFIG, newCfg || {});
    injectOrUpdateStyle(buildCssFromConfig(currentConfig));
    markTopHeader();
    syncFloatButton();
  }

  // Initial injection at document_start (pure CSS, zero DOM mutation loops, zero flickering!)
  applyConfig(DEFAULT_CONFIG);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['libCustomizerConfig'], (res) => {
      if (res && res.libCustomizerConfig) {
        applyConfig(res.libCustomizerConfig);
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.libCustomizerConfig && changes.libCustomizerConfig.newValue) {
        applyConfig(changes.libCustomizerConfig.newValue);
      }
    });
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === 'LIB_CUSTOMIZER_UPDATE' && msg.config) {
        applyConfig(msg.config);
        sendResponse({ ok: true });
      }
    });
  }

  window.addEventListener('keydown', function (e) {
    if (currentConfig.panicKeyEnabled && e.key === currentConfig.panicKeyCode) {
      e.preventDefault();
      window.location.replace(currentConfig.panicRedirectUrl || 'https://www.google.com');
    }
    if (e.altKey && (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д')) {
      e.preventDefault();
      toggleInPageDrawer();
    }
  });

  function toggleInPageDrawer() {
    let drawer = document.getElementById(PANEL_ID);
    if (drawer) {
      drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
      return;
    }

    const cardRgb = hexToRgb(currentConfig.bgCard);
    drawer = document.createElement('div');
    drawer.id = PANEL_ID;
    drawer.style.cssText = 'position:fixed;bottom:70px;right:18px;width:340px;background:rgba(' + cardRgb + ',0.96);backdrop-filter:blur(20px);color:' + currentConfig.textPrimary + ';border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px;z-index:2147483647;font-family:sans-serif;box-shadow:0 20px 45px rgba(0,0,0,0.75);';
    drawer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px;">
        <strong style="font-size:14px;">LibCustomizer Pro v5.6</strong>
        <button id="lc-close-drawer" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Блокировщик рекламы (AdBlock)</span>
          <input type="checkbox" id="lc-adblock" ${currentConfig.adblockEnabled ? 'checked' : ''} />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Основной фон сайта</span>
          <input type="color" id="lc-bgprimary" value="${currentConfig.bgPrimary}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Фон карточек и шапки</span>
          <input type="color" id="lc-bgcard" value="${currentConfig.bgCard}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Единый акцентный цвет</span>
          <input type="color" id="lc-accent" value="${currentConfig.accentColor}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <button id="lc-apply-drawer" style="margin-top:6px;padding:9px;border-radius:10px;border:none;background:${currentConfig.accentColor};color:#fff;font-weight:600;cursor:pointer;">Применить сейчас</button>
      </div>
    `;
    document.body.appendChild(drawer);

    drawer.querySelector('#lc-close-drawer').addEventListener('click', () => {
      drawer.style.display = 'none';
    });
    drawer.querySelector('#lc-apply-drawer').addEventListener('click', () => {
      const updated = Object.assign({}, currentConfig, {
        adblockEnabled: drawer.querySelector('#lc-adblock').checked,
        bgPrimary: drawer.querySelector('#lc-bgprimary').value,
        bgCard: drawer.querySelector('#lc-bgcard').value,
        accentColor: drawer.querySelector('#lc-accent').value,
      });
      applyConfig(updated);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ libCustomizerConfig: updated });
      }
    });
  }

  function syncFloatButton() {
    if (!document.body) return;
    let btn = document.getElementById(FLOAT_BTN_ID);
    if (!currentConfig.hotkeyFloatButton) {
      if (btn) btn.remove();
      return;
    }
    if (!btn) {
      const cardRgb = hexToRgb(currentConfig.bgCard);
      btn = document.createElement('button');
      btn.id = FLOAT_BTN_ID;
      btn.title = 'Быстрые настройки LibCustomizer (Alt + L)';
      btn.textContent = '⚙';
      btn.style.cssText = 'position:fixed;bottom:16px;right:16px;width:34px;height:34px;border-radius:12px;background:rgba(' + cardRgb + ',0.85);backdrop-filter:blur(10px);color:' + currentConfig.textPrimary + ';font-size:16px;border:1px solid rgba(255,255,255,0.14);cursor:pointer;z-index:2147483646;opacity:0.5;transition:opacity 0.2s ease;';
      btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
      btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.5'; });
      btn.addEventListener('click', toggleInPageDrawer);
      document.body.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      markTopHeader();
      syncFloatButton();
    });
  } else {
    markTopHeader();
    syncFloatButton();
  }
  window.addEventListener('load', markTopHeader);
})();
