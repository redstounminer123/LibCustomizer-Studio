import JSZip from 'jszip';
import { DEFAULT_HOME_BLOCKS, ExtensionConfig, LIB_SITES } from '../types/extension';

export const TARGET_MATCH_PATTERNS = [
  '*://mangalib.me/*',
  '*://*.mangalib.me/*',
  '*://mangalib.org/*',
  '*://*.mangalib.org/*',
  '*://*.shlib.life/*',
  '*://shlib.life/*',
  '*://*.animelib.org/*',
  '*://animelib.org/*',
  '*://ranobelib.me/*',
  '*://*.ranobelib.me/*',
  '*://ranobelib.org/*',
  '*://*.ranobelib.org/*',
  '*://hentailib.me/*',
  '*://*.hentailib.me/*',
];

/**
 * Generates manifest.json (Manifest V3) for Chrome / Edge / Brave / Firefox / Opera
 */
export function generateManifestJson(): string {
  const manifest = {
    manifest_version: 3,
    name: 'LibCustomizer Pro v5.8 — Настраиваемая прозрачность форума и прозрачные рамки',
    short_name: 'LibCustomizer',
    version: '5.8.0',
    description:
      'Персонализация MangaLib, RanobeLib, AnimeLib: настраиваемая прозрачность подложки форума, прозрачные рамки border, адаптивная шапка, обои и AdBlock.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: TARGET_MATCH_PATTERNS,
    action: {
      default_popup: 'popup.html',
      default_title: 'LibCustomizer Pro v5.8 — Настройки и Блоки главной',
    },
    background: {
      service_worker: 'background.js',
    },
    content_scripts: [
      {
        matches: TARGET_MATCH_PATTERNS,
        js: ['content.js'],
        run_at: 'document_start',
        all_frames: false,
      },
    ],
    browser_specific_settings: {
      gecko: {
        id: 'libcustomizer@libfamily.addons',
        strict_min_version: '109.0',
      },
    },
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * Compiles unified CSS (v5.6):
 * 1. Colors the top navigation header bar (where MangaLIB logo, Каталог, Поиск, Форум live) and strips opaque inner wrappers.
 * 2. Eliminates double-layering (.section + .paper) so upper blocks ("Популярные обновления", "Горячие новинки", "Продолжить читать", "Сейчас читают")
 *    and lower blocks ("Последние обновления", "Форум", "Отзывы", "Коллекции", "Новинки") have the exact same rich, dense opacity.
 * 3. Hides disabled [data-home-block] sections AND their parent .section/.paper wrappers using :has() so zero empty border traces remain.
 */
export function compileDynamicCss(cfg: ExtensionConfig): string {
  const hexToRgb = (hex: string) => {
    const clean = (hex || '#FF7A00').replace('#', '');
    const num =
      parseInt(
        clean.length === 3
          ? clean
              .split('')
              .map((c) => c + c)
              .join('')
          : clean,
        16
      ) || 0;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
  };

  const primaryRgb = hexToRgb(cfg.bgPrimary);
  const cardRgb = hexToRgb(cfg.bgCard);
  const accentRgb = hexToRgb(cfg.accentColor);
  const hasWallpaper = Boolean(cfg.customBgUrl && cfg.customBgUrl.trim().length > 0);

  // Boost legacy 82% default to 92% so all sections match the dense lower-block look without double-stacking
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

  const homeBlocks = Array.isArray(cfg.homeBlocks) && cfg.homeBlocks.length > 0 ? cfg.homeBlocks : DEFAULT_HOME_BLOCKS;
  const effectivelyDisabledBlocks = homeBlocks.filter(
    (block) => !block.enabled || (cfg.adblockEnabled && block.id === 'slider')
  );
  const effectivelyEnabledBlocks = homeBlocks.filter(
    (block) => block.enabled && !(cfg.adblockEnabled && block.id === 'slider')
  );

  const enabledDataSelectors = effectivelyEnabledBlocks.map((b) => `[data-home-block="${b.id}"]`).join(', ');

  const homeBlockRules = [
    ...effectivelyDisabledBlocks.map(
      (block) => `[data-home-block="${block.id}"],
.section[data-home-block="${block.id}"],
a[data-home-block="${block.id}"],
.section:has([data-home-block="${block.id}"]):not(:has([data-home-block]:not([data-home-block="${block.id}"]))),
.paper:has([data-home-block="${block.id}"]):not(:has([data-home-block]:not([data-home-block="${block.id}"]))),
div:has(> [data-home-block="${block.id}"]):not(:has([data-home-block]:not([data-home-block="${block.id}"]))) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
  pointer-events: none !important;
}`
    ),
    enabledDataSelectors
      ? `.section:has([data-home-block]):not(:has(${enabledDataSelectors})),
.paper:has([data-home-block]):not(:has(${enabledDataSelectors})) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `/* === LibCustomizer Pro v5.8 — Customizable Forum Opacity, Transparent Borders & Dynamic Header === */
:root, html, body, [data-theme], [data-scheme], [data-color-scheme], [data-mode] {
  --lib-bg-primary: ${cfg.bgPrimary} !important;
  --lib-bg-secondary: ${cfg.bgCard} !important;
  --lib-bg-card: rgba(${cardRgb}, ${effectiveCardAlpha}) !important;
  --lib-bg-elevated: rgba(${cardRgb}, ${elevatedAlpha}) !important;
  --lib-bg-nested: rgba(${cardRgb}, ${nestedItemAlpha}) !important;
  --lib-text-primary: ${cfg.textPrimary} !important;
  --lib-text-muted: ${cfg.textMuted} !important;
  --lib-accent: ${cfg.accentColor} !important;
  --lib-accent-rgb: ${accentRgb} !important;
  --lib-radius: ${radiusPx}px !important;
  --lib-radius-sm: ${Math.max(radiusPx - 4, 10)}px !important;
  --lib-container-width: ${cfg.containerMaxWidth}px !important;

  /* Forum dedicated opacity & transparent border custom properties */
  --forum-opacity: ${forumAlpha} !important;
  --forum-bg: rgba(${cardRgb}, ${forumAlpha}) !important;
  --forum-border: transparent !important;

  /* CRITICAL LIB ENGINE SURFACE TOKENS:
     --foreground repeats --background-elevated-1 at rich uniform density (no double-layer mismatch). */
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

  --background-primary: ${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --background-secondary: var(--background-elevated-1) !important;
  --background-tertiary: var(--background-elevated-2) !important;
  --background-elevated: var(--background-elevated-3) !important;
  --background-paper: var(--background-elevated-1) !important;
  --background-modal: var(--background-elevated-3) !important;
  --surface-primary: var(--background-elevated-1) !important;
  --surface-secondary: var(--background-elevated-2) !important;
  --surface-elevated: var(--background-elevated-3) !important;

  /* Native Border Radius Variables */
  --border-radius: var(--lib-radius) !important;
  --radius: var(--lib-radius) !important;
  --radius-sm: var(--lib-radius-sm) !important;
  --radius-md: var(--lib-radius) !important;
  --radius-lg: calc(var(--lib-radius) + 4px) !important;

  /* Native Accent & Text Variables */
  --primary-color: ${cfg.accentColor} !important;
  --accent-color: ${cfg.accentColor} !important;
  --color-primary: ${cfg.accentColor} !important;
  --color-accent: ${cfg.accentColor} !important;
  --brand-color: ${cfg.accentColor} !important;
  --orange: ${cfg.accentColor} !important;
  --blue: ${cfg.accentColor} !important;
  --primary-500: ${cfg.accentColor} !important;
  --primary-600: ${cfg.accentColor} !important;
  --border-color: rgba(255, 255, 255, 0.08) !important;
  --divider-color: rgba(255, 255, 255, 0.06) !important;
  --text-primary: ${cfg.textPrimary} !important;
  --text-secondary: ${cfg.textMuted} !important;
  --text-muted: ${cfg.textMuted} !important;
}

/* 1. Root & Primary Background Layer */
html {
  background-color: ${cfg.bgPrimary} !important;
  color: ${cfg.textPrimary} !important;
  color-scheme: dark !important;
}

${
  hasWallpaper
    ? `html::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: linear-gradient(rgba(${primaryRgb}, ${(cfg.bgDimming / 100).toFixed(2)}), rgba(${primaryRgb}, ${(cfg.bgDimming / 100).toFixed(2)})), url("${cfg.customBgUrl.trim()}");
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
}`
    : `body, #app, .app, .page, .layout, .site-wrapper, main,
[class*="layout__content"], [class*="page__wrapper"] {
  background: ${cfg.bgPrimary} !important;
  background-color: ${cfg.bgPrimary} !important;
  color: ${cfg.textPrimary} !important;
}`
}

/* 2. Top Navigation Header Bar (where MangaLIB logo, Каталог, Поиск, Форум are located) */
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
  ${cfg.glassmorphism ? `backdrop-filter: blur(${cfg.glassBlurPx}px) saturate(150%) !important;\n  -webkit-backdrop-filter: blur(${cfg.glassBlurPx}px) saturate(150%) !important;` : ''}
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
  ${cfg.stickyHeaderMode === 'always' ? 'position: sticky !important; top: 0 !important; z-index: 1000 !important;' : ''}
  ${cfg.compactHeader ? 'min-height: 48px !important; padding-top: 2px !important; padding-bottom: 2px !important;' : ''}
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

/* 3. Main Sections & [data-home-block] Containers — Single Uniform Layer (No Double Opacity or Double Borders!) */
.section:not([data-home-block="slider"]),
[data-home-block="popular-updates"], [data-home-block="hot-newest"], [data-home-block="latest-views"],
[data-home-block="continue"], [data-home-block="top-views"], [data-home-block="forum"],
[data-home-block="reviews"], [data-home-block="collections"], [data-home-block="latest-updates"],
[data-home-block="top-users"], [data-home-block="newest"], [data-home-block="telegram"],
[class*="faq-content"], [class*="rules-content"], [class*="comments-section"] {
  background-color: var(--background-elevated-1) !important;
  color: ${cfg.textPrimary} !important;
  border-radius: var(--lib-radius) !important;
  ${cfg.glassmorphism ? `backdrop-filter: blur(${cfg.glassBlurPx}px) !important;\n  -webkit-backdrop-filter: blur(${cfg.glassBlurPx}px) !important;` : ''}
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* 3.1 Forum Page & Discussion Surfaces — Customizable Opacity & Transparent Border (as requested in DevTools) */
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
  ${cfg.glassmorphism ? `backdrop-filter: blur(${cfg.glassBlurPx}px) !important;\n  -webkit-backdrop-filter: blur(${cfg.glassBlurPx}px) !important;` : ''}
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

/* 4. Interactive Surface Harmonization for .wb.c1, Continue Reading, Reviews, Collections, Translators, Related/Similar & Calendar Cells */
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

/* Ensure inner headers/toolbars (Chapter sort/download bar, Calendar day headers) never get pitch-black or white strips */
.section > [class*="header"], .section > [class*="body"], .section > [class*="footer"],
.paper > [class*="header"], .paper > [class*="body"], .paper > [class*="footer"],
[class*="section__header"], [class*="section__body"], [class*="section-header"], [class*="section-body"],
[class*="tabs-wrapper"], [class*="subnav"], [class*="filter-bar"], [class*="chapters-header"] {
  background: transparent !important;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/* 5. Hide Disabled Home Page Blocks ([data-home-block]) & Empty Parent Wrappers — Pure CSS, Zero Trace */
${homeBlockRules}

.section:empty, .paper:empty {
  display: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 6. Popovers, Notifications Dropdown, Modals & Reader Settings Drawer */
.dropdown-menu, .popover, .modal, .dialog, .drawer, .offcanvas,
[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper] > *,
.tippy-box, .v-popper__inner, [class*="notifications"], [class*="notification-list"] {
  background-color: var(--background-elevated-3) !important;
  color: ${cfg.textPrimary} !important;
  ${cfg.glassmorphism ? `backdrop-filter: blur(${Math.max(cfg.glassBlurPx, 16)}px) saturate(160%) !important;\n  -webkit-backdrop-filter: blur(${Math.max(cfg.glassBlurPx, 16)}px) saturate(160%) !important;` : ''}
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: var(--lib-radius) !important;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.65) !important;
}

/* 7. Clean Comment Threads & Replies */
.comment, .comment-item, [class*="comment__item"], [class*="comment-body"], [class*="comment__body"],
[class*="comment__content"], .comment__replies, .comment-reply,
[class*="comment-children"], [class*="comment-reply"], [class*="comments-item"] {
  background: transparent !important;
  background-color: transparent !important;
  color: ${cfg.textPrimary} !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: var(--lib-radius-sm) !important;
}

.comment__replies, [class*="comment-children"], [class*="comment-replies"] {
  border-left: 2px solid rgba(${accentRgb}, 0.32) !important;
  padding-left: 14px !important;
  margin-left: 8px !important;
  border-radius: 0 !important;
}

/* 8. Inputs, Selects & Search Bars */
input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
textarea, select, .input, .form-control, .select,
[class*="input-wrapper"], [class*="search-input"], [class*="comment-input"],
[class*="filter-input"], [class*="textarea"], [class*="select__control"] {
  background-color: var(--btn-light-bg) !important;
  color: ${cfg.textPrimary} !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: var(--lib-radius-sm) !important;
  box-shadow: none !important;
}

[class*="input-wrapper"] input, [class*="search-input"] input, [class*="comment-input"] textarea {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 9. Buttons & Accent Harmonizer */
button, .btn, [role="button"], .tag, .chip {
  border-radius: var(--lib-radius-sm) !important;
}

button.btn-primary, .btn-primary, .button--primary, [class*="btn_variant_primary"],
[class*="btn-orange"], [class*="btn-blue"], [class*="btn-success"], [class*="btn-green"],
button[type="submit"] {
  background-color: var(--lib-accent) !important;
  border-color: var(--lib-accent) !important;
  color: #ffffff !important;
  border-radius: var(--lib-radius-sm) !important;
}

.tabs__item--active, .tab--active, [class*="tabs"] .is-active, [role="tab"][aria-selected="true"] {
  background-color: rgba(${accentRgb}, 0.14) !important;
  color: ${cfg.textPrimary} !important;
  border-bottom: 2px solid var(--lib-accent) !important;
  border-radius: var(--lib-radius-sm) var(--lib-radius-sm) 0 0 !important;
  box-shadow: none !important;
}

[class*="tabs__line"], [class*="tab-indicator"], [class*="progress-bar"], [class*="progress__fill"],
input[type="range"]::-webkit-slider-thumb, [class*="slider__fill"], [class*="switch--checked"] {
  background-color: var(--lib-accent) !important;
  border-color: var(--lib-accent) !important;
}

input[type="range"], input[type="checkbox"], input[type="radio"] {
  accent-color: var(--lib-accent) !important;
}

.header__logo, [class*="logo"], .navbar-brand, header a[href="/"] {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

/* 10. Clean Catalog Media Cards */
.container, .layout__container, .page__inner {
  max-width: var(--lib-container-width) !important;
}

.media-card, .card-item {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: var(--lib-radius) !important;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.media-card__title, .card-item__title, [class*="card-title"] {
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.35 !important;
  margin-top: 6px !important;
  padding: 0 2px !important;
  color: ${cfg.textPrimary} !important;
  font-weight: 600 !important;
}

.media-card__subtitle, .card-item__subtitle, [class*="card-meta"] {
  display: block !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.3 !important;
  margin-top: 2px !important;
  padding: 0 2px !important;
  color: ${cfg.textMuted} !important;
  font-size: 12px !important;
}

.media-card__cover, .cover, .card-item__cover, .media-card__cover img, .cover img {
  aspect-ratio: ${cfg.posterAspectRatio} !important;
  border-radius: var(--lib-radius) !important;
  overflow: hidden !important;
  position: relative !important;
}

/* 11. Manga & Ranobe Reader Overrides */
.reader-view, .reader-pages, [class*="reader-canvas"], [class*="reader-pages"] {
  max-width: ${cfg.mangaMaxWidth}px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  background: transparent !important;
  background-color: transparent !important;
  display: flex !important;
  flex-direction: column !important;
  gap: ${cfg.mangaPageGap}px !important;
}

.reader-view img, .reader-pages img, [class*="reader-page"] img {
  filter: brightness(${cfg.mangaBrightness}%) contrast(${cfg.mangaContrast}%) sepia(${cfg.mangaSepia}%) !important;
  ${cfg.mangaAutoCropBorders ? 'clip-path: inset(1% 1.5% 1% 1.5%);' : ''}
  display: block !important;
  width: 100% !important;
  height: auto !important;
}

.reader-text, .ranobe-reader__content, .reader-container {
  font-family: '${cfg.ranobeFontFamily}', Georgia, serif !important;
  font-size: ${cfg.ranobeFontSize}px !important;
  line-height: ${cfg.ranobeLineHeight} !important;
  text-align: ${cfg.ranobeTextAlign} !important;
  color: ${cfg.textPrimary} !important;
  max-width: ${cfg.mangaMaxWidth}px !important;
  margin: 0 auto !important;
}

/* 12. Real AdBlocker Engine (Targets exact Lib homepage slider & chapter ads) */
${
  cfg.adblockEnabled
    ? `div.section[data-home-block="slider"],
.section[data-home-block="slider"],
[data-home-block="slider"],
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
iframe[src*="bet"],
.ad-banner,
.ads-wrapper,
.adv-block,
.promo-banner,
.top-banner,
.header-banner,
.footer-banner,
[class*="ad-container"],
[class*="ads-container"],
[class*="banner-block"],
[class*="promo-strip"],
[data-ad],
[data-ad-block],
[data-banner] {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  overflow: hidden !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}`
    : ''
}

${
  cfg.customScrollbar
    ? `::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${cfg.bgPrimary}; }
::-webkit-scrollbar-thumb { background: rgba(${accentRgb}, 0.55); border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: ${cfg.accentColor}; }`
    : ''
}

/* === User Custom CSS === */
${cfg.customCss || ''}
`;
}

/**
 * Generates content.js with:
 * - Zero flickering! No DOM node moving (appendChild) and no inline-style mutation loops on [data-home-block].
 * - `--foreground` set equal to `--background-elevated-1` so Forum, Profile, Team, and Chapter panels match the card surface color.
 * - Harmonization of pitch-black notifications/calendar/related blocks into semi-transparent elevated surfaces.
 */
export function generateContentScript(defaultConfig: ExtensionConfig): string {
  return `/**
 * LibCustomizer Pro v5.6 — Top Header Fix, Uniform Dense Sections & Zero-Trace Block Hiding
 * Supported domains: mangalib.me, mangalib.org, *.shlib.life, *.animelib.org, ranobelib.me, ranobelib.org, hentailib.me
 */
(function () {
  'use strict';

  const STYLE_ID = 'lib-customizer-pro-styles';
  const FLOAT_BTN_ID = 'lib-customizer-float-trigger';
  const PANEL_ID = 'lib-customizer-inpage-drawer';

  const DEFAULT_CONFIG = ${JSON.stringify(defaultConfig, null, 2)};
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
      .join('\\n');

    const parentCleanRule = enabledSelectors
      ? '.section:has([data-home-block]):not(:has(' + enabledSelectors + ')), .paper:has([data-home-block]):not(:has(' + enabledSelectors + ')) { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; backdrop-filter: none !important; box-shadow: none !important; overflow: hidden !important; }'
      : '';

    const blockRules = disabledRules + '\\n' + parentCleanRule;

    return \`
:root, html, body, [data-theme], [data-scheme], [data-color-scheme], [data-mode] {
  --lib-bg-primary: \${cfg.bgPrimary} !important;
  --lib-bg-secondary: \${cfg.bgCard} !important;
  --lib-bg-card: rgba(\${cardRgb}, \${effectiveCardAlpha}) !important;
  --lib-bg-elevated: rgba(\${cardRgb}, \${elevatedAlpha}) !important;
  --lib-bg-nested: rgba(\${cardRgb}, \${nestedItemAlpha}) !important;
  --lib-text-primary: \${cfg.textPrimary} !important;
  --lib-text-muted: \${cfg.textMuted} !important;
  --lib-accent: \${cfg.accentColor} !important;
  --lib-accent-rgb: \${accentRgb} !important;
  --lib-radius: \${radiusPx}px !important;
  --lib-radius-sm: \${radiusSm}px !important;
  --lib-container-width: \${cfg.containerMaxWidth || 1440}px !important;

  /* Forum dedicated opacity & transparent border custom properties */
  --forum-opacity: \${forumAlpha} !important;
  --forum-bg: rgba(\${cardRgb}, \${forumAlpha}) !important;
  --forum-border: transparent !important;

  /* --foreground repeats --background-elevated-1 at rich uniform density! */
  --background-elevated-1: rgba(\${cardRgb}, \${effectiveCardAlpha}) !important;
  --background-elevated-2: rgba(\${cardRgb}, \${midElevatedAlpha}) !important;
  --background-elevated-3: rgba(\${cardRgb}, \${elevatedAlpha}) !important;
  --foreground: var(--background-elevated-1) !important;
  --foreground-rgb: \${cardRgb} !important;
  --btn-light-bg: rgba(\${cardRgb}, \${nestedItemAlpha}) !important;
  --btn-light-bg-hover: rgba(\${accentRgb}, 0.18) !important;

  /* Header & Navbar Tokens */
  --header-bg: var(--background-elevated-3) !important;
  --navbar-bg: var(--background-elevated-3) !important;
  --bg-header: var(--background-elevated-3) !important;
  --background-header: var(--background-elevated-3) !important;
  --background-navbar: var(--background-elevated-3) !important;
  --background-sticky: var(--background-elevated-3) !important;

  --background: \${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --background-base: \${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
  --bg-primary: \${hasWallpaper ? 'transparent' : cfg.bgPrimary} !important;
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
  --primary-color: \${cfg.accentColor} !important;
  --accent-color: \${cfg.accentColor} !important;
  --color-primary: \${cfg.accentColor} !important;
  --orange: \${cfg.accentColor} !important;
  --blue: \${cfg.accentColor} !important;
  --border-color: rgba(255, 255, 255, 0.08) !important;
  --divider-color: rgba(255, 255, 255, 0.06) !important;
  --text-primary: \${cfg.textPrimary} !important;
  --text-secondary: \${cfg.textMuted} !important;
}

html {
  background-color: \${cfg.bgPrimary} !important;
  color: \${cfg.textPrimary} !important;
  color-scheme: dark !important;
}

\${hasWallpaper ? \`
html::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: linear-gradient(rgba(\${primaryRgb}, \${((cfg.bgDimming || 68) / 100).toFixed(2)}), rgba(\${primaryRgb}, \${((cfg.bgDimming || 68) / 100).toFixed(2)})), url("\${cfg.customBgUrl.trim()}");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}
body, #app, .app, .page, .layout, .site-wrapper, main,
[class*="layout__content"], [class*="page__wrapper"], [class*="reader-wrapper"] {
  background: transparent !important;
  background-color: transparent !important;
  color: \${cfg.textPrimary} !important;
  position: relative;
  z-index: 1;
}\` : \`
body, #app, .app, .page, .layout, .site-wrapper, main,
[class*="layout__content"], [class*="page__wrapper"] {
  background: \${cfg.bgPrimary} !important;
  background-color: \${cfg.bgPrimary} !important;
  color: \${cfg.textPrimary} !important;
}\`}

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
  color: \${cfg.textPrimary} !important;
  \${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) saturate(150%) !important;' : ''}
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
[data-home-block="popular-updates"], [data-home-block="hot-newest"], [data-home-block="latest-views"],
[data-home-block="continue"], [data-home-block="top-views"], [data-home-block="forum"],
[data-home-block="reviews"], [data-home-block="collections"], [data-home-block="latest-updates"],
[data-home-block="top-users"], [data-home-block="newest"], [data-home-block="telegram"],
[class*="faq-content"], [class*="rules-content"], [class*="comments-section"] {
  background-color: var(--background-elevated-1) !important;
  color: \${cfg.textPrimary} !important;
  border-radius: var(--lib-radius) !important;
  \${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important;' : ''}
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
  color: \${cfg.textPrimary} !important;
  \${cfg.glassmorphism ? 'backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important; -webkit-backdrop-filter: blur(' + (cfg.glassBlurPx || 14) + 'px) !important;' : ''}
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
  color: \${cfg.textPrimary} !important;
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
  border-color: rgba(\${accentRgb}, 0.35) !important;
}

/* Category menu items in forum sidebar */
[class*="forum"] [class*="category"],
[class*="forum"] [class*="nav-item"],
[class*="forum"] aside a,
[class*="forum"] [class*="sidebar"] a {
  border-radius: var(--lib-radius-sm) !important;
  color: \${cfg.textPrimary} !important;
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
  border-left: 3px solid \${cfg.accentColor} !important;
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
  color: \${cfg.textPrimary} !important;
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
  border-color: rgba(\${accentRgb}, 0.45) !important;
  color: \${cfg.textPrimary} !important;
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

\${blockRules}

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
  color: \${cfg.textPrimary} !important;
  \${cfg.glassmorphism ? 'backdrop-filter: blur(' + Math.max(cfg.glassBlurPx || 14, 16) + 'px) saturate(160%) !important; -webkit-backdrop-filter: blur(' + Math.max(cfg.glassBlurPx || 14, 16) + 'px) saturate(160%) !important;' : ''}
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: var(--lib-radius) !important;
}

.comment, .comment-item, [class*="comment__item"], [class*="comment-body"], [class*="comment__body"],
[class*="comment__content"], .comment__replies, .comment-reply,
[class*="comment-children"], [class*="comment-reply"], [class*="comments-item"] {
  background: transparent !important;
  background-color: transparent !important;
  color: \${cfg.textPrimary} !important;
  border: none !important;
  box-shadow: none !important;
}

.comment__replies, [class*="comment-children"], [class*="comment-replies"] {
  border-left: 2px solid rgba(\${accentRgb}, 0.32) !important;
  padding-left: 14px !important;
  margin-left: 8px !important;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
textarea, select, .input, .form-control, .select,
[class*="input-wrapper"], [class*="search-input"], [class*="comment-input"],
[class*="filter-input"], [class*="textarea"], [class*="select__control"] {
  background-color: var(--btn-light-bg) !important;
  color: \${cfg.textPrimary} !important;
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

\${cfg.adblockEnabled ? \`
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
}\` : ''}

\${cfg.customCss || ''}
\`;
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
          return;
        }
        cur = cur.parentElement;
      }
    }
  }

  // Hook markTopHeader across document lifecycle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markTopHeader);
  } else {
    markTopHeader();
  }
  window.addEventListener('load', markTopHeader);
  window.addEventListener('scroll', markTopHeader, { passive: true });
  setTimeout(markTopHeader, 400);
  setTimeout(markTopHeader, 1200);
  setTimeout(markTopHeader, 2500);

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
    drawer.innerHTML = \`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px;">
        <strong style="font-size:14px;">LibCustomizer Pro v5.6</strong>
        <button id="lc-close-drawer" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Блокировщик рекламы (AdBlock)</span>
          <input type="checkbox" id="lc-adblock" \${currentConfig.adblockEnabled ? 'checked' : ''} />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Основной фон сайта</span>
          <input type="color" id="lc-bgprimary" value="\${currentConfig.bgPrimary}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Фон карточек и шапки</span>
          <input type="color" id="lc-bgcard" value="\${currentConfig.bgCard}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
          <span>Единый акцентный цвет</span>
          <input type="color" id="lc-accent" value="\${currentConfig.accentColor}" style="border:none;background:transparent;width:32px;height:24px;cursor:pointer;" />
        </label>
        <button id="lc-apply-drawer" style="margin-top:6px;padding:9px;border-radius:10px;border:none;background:\${currentConfig.accentColor};color:#fff;font-weight:600;cursor:pointer;">Применить сейчас</button>
      </div>
    \`;
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
`;
}

/**
 * Generates popup.html with 2 tabs:
 * 1) Палитра и тема (with "Применить сейчас" button)
 * 2) Блоки главной (clean checkboxes to hide/show any data-home-block section without flickering or empty border traces)
 */
export function generatePopupHtml(defaultConfig: ExtensionConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>LibCustomizer Pro v5.8</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 380px;
      background: #0B0F17;
      color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 14px;
      font-size: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { font-weight: 700; font-size: 14px; color: #fff; }
    .version { font-size: 11px; color: #10B981; font-family: monospace; background: rgba(16,185,129,0.12); padding: 2px 8px; border-radius: 8px; }
    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      background: #111827;
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    .tab-btn {
      padding: 7px;
      border: none;
      background: transparent;
      color: #94A3B8;
      font-weight: 600;
      font-size: 12px;
      border-radius: 7px;
      cursor: pointer;
    }
    .tab-btn.active {
      background: #1E293B;
      color: #fff;
    }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .presets {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-bottom: 10px;
    }
    .preset-btn {
      padding: 6px;
      background: #172033;
      color: #CBD5E1;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      font-size: 11px;
      cursor: pointer;
      font-weight: 600;
    }
    .preset-btn:hover { border-color: #FF7A00; color: #fff; }
    .control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .control label { color: #CBD5E1; font-size: 12px; }
    input[type="color"] {
      width: 36px; height: 24px; border: none; background: transparent; cursor: pointer;
    }
    input[type="range"] {
      width: 115px; accent-color: #FF7A00; cursor: pointer;
    }
    input[type="url"] {
      width: 155px; background: #172033; border: 1px solid #334155; color: #fff; padding: 4px 8px; border-radius: 7px; font-size: 11px;
    }
    .blocks-list {
      max-height: 260px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-right: 4px;
    }
    .block-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 10px;
      background: #172033;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
    }
    .block-item label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      flex: 1;
      font-size: 11px;
      color: #E2E8F0;
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .btn {
      flex: 1;
      padding: 9px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
      border: 1px solid transparent;
    }
    .btn-apply {
      background: #FF7A00;
      color: #fff;
    }
    .btn-apply.dirty {
      box-shadow: 0 0 0 2px rgba(255,122,0,0.45);
    }
    .btn-reset {
      background: #1E293B;
      color: #CBD5E1;
      border-color: #334155;
      flex: 0.45;
    }
    .status {
      margin-top: 8px;
      font-size: 11px;
      color: #10B981;
      text-align: center;
      min-height: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">LibCustomizer Pro</span>
    <span class="version">v5.8 Stable</span>
  </div>

  <div class="tabs">
    <button type="button" class="tab-btn active" data-tab="palette">Палитра и тема</button>
    <button type="button" class="tab-btn" data-tab="blocks">Скрытие блоков (12)</button>
  </div>

  <div class="tab-panel active" id="tab-palette">
    <div class="presets">
      <button type="button" class="preset-btn" data-preset="dark_slate">Nordic Slate</button>
      <button type="button" class="preset-btn" data-preset="oled">OLED Black</button>
      <button type="button" class="preset-btn" data-preset="catppuccin">Catppuccin</button>
      <button type="button" class="preset-btn" data-preset="tokyo_night">Tokyo Night</button>
      <button type="button" class="preset-btn" data-preset="sepia">Warm Sepia</button>
    </div>

    <div class="control">
      <label for="adblockEnabled">Блокировщик рекламы (Слайдер + Главы)</label>
      <input type="checkbox" id="adblockEnabled" ${defaultConfig.adblockEnabled ? 'checked' : ''} />
    </div>
    <div class="control">
      <label for="bgPrimary">Основной фон сайта</label>
      <input type="color" id="bgPrimary" value="${defaultConfig.bgPrimary}" />
    </div>
    <div class="control">
      <label for="bgCard">Фон карточек и шапки (--foreground)</label>
      <input type="color" id="bgCard" value="${defaultConfig.bgCard}" />
    </div>
    <div class="control">
      <label for="accentColor">Единый акцентный цвет</label>
      <input type="color" id="accentColor" value="${defaultConfig.accentColor}" />
    </div>
    <div class="control">
      <label for="textPrimary">Основной цвет текста</label>
      <input type="color" id="textPrimary" value="${defaultConfig.textPrimary}" />
    </div>
    <div class="control">
      <label for="cardBorderRadius">Скругление углов (<span id="radiusVal">${defaultConfig.cardBorderRadius}</span>px)</label>
      <input type="range" id="cardBorderRadius" min="8" max="28" value="${defaultConfig.cardBorderRadius}" />
    </div>
    <div class="control">
      <label for="cardOpacity">Плотность карточек (<span id="opacityVal">${defaultConfig.cardOpacity}</span>%)</label>
      <input type="range" id="cardOpacity" min="40" max="100" value="${defaultConfig.cardOpacity}" />
    </div>
    <div class="control">
      <label for="forumOpacity">Плотность подложки форума (<span id="forumOpacityVal">${defaultConfig.forumOpacity !== undefined ? defaultConfig.forumOpacity : 92}</span>%)</label>
      <input type="range" id="forumOpacity" min="0" max="100" value="${defaultConfig.forumOpacity !== undefined ? defaultConfig.forumOpacity : 92}" />
    </div>
    <div class="control">
      <label for="customBgUrl">URL фоновых обоев</label>
      <input type="url" id="customBgUrl" placeholder="https://..." value="${defaultConfig.customBgUrl}" />
    </div>
  </div>

  <div class="tab-panel" id="tab-blocks">
    <div style="font-size:11px;color:#94A3B8;margin-bottom:8px;">
      Отключайте ненужные секции <code>data-home-block</code> на главной странице (без миганий и без пустых следов), затем нажмите «Применить сейчас»:
    </div>
    <div class="blocks-list" id="blocksList"></div>
  </div>

  <div class="actions">
    <button type="button" class="btn btn-apply" id="applyBtn">Применить сейчас</button>
    <button type="button" class="btn btn-reset" id="resetBtn">Сброс</button>
  </div>

  <div class="status" id="statusMsg">Изменения применяются по нажатию кнопки</div>

  <script src="popup.js"></script>
</body>
</html>`;
}

export function generatePopupJs(defaultConfig: ExtensionConfig): string {
  return `const DEFAULT_CONFIG = ${JSON.stringify(defaultConfig, null, 2)};

const PRESETS = {
  dark_slate: { bgPrimary: '#0B0F17', bgSecondary: '#111827', bgCard: '#172033', textPrimary: '#F1F5F9', textMuted: '#94A3B8', accentColor: '#FF7A00' },
  oled: { bgPrimary: '#000000', bgSecondary: '#08080A', bgCard: '#101014', textPrimary: '#FAFAFA', textMuted: '#8E8E93', accentColor: '#FF7A00' },
  catppuccin: { bgPrimary: '#1E1E2E', bgSecondary: '#181825', bgCard: '#313244', textPrimary: '#CDD6F4', textMuted: '#A6ADC8', accentColor: '#CBA6F7' },
  tokyo_night: { bgPrimary: '#1A1B26', bgSecondary: '#16161E', bgCard: '#24283B', textPrimary: '#C0CAF5', textMuted: '#9AA5CE', accentColor: '#7AA2F7' },
  sepia: { bgPrimary: '#1C1814', bgSecondary: '#25201A', bgCard: '#2E2720', textPrimary: '#EAE0D5', textMuted: '#B5A695', accentColor: '#E09F3E' }
};

document.addEventListener('DOMContentLoaded', () => {
  const fields = ['adblockEnabled', 'bgPrimary', 'bgCard', 'accentColor', 'textPrimary', 'cardBorderRadius', 'cardOpacity', 'forumOpacity', 'customBgUrl'];
  const statusEl = document.getElementById('statusMsg');
  const radiusVal = document.getElementById('radiusVal');
  const opacityVal = document.getElementById('opacityVal');
  const forumOpacityVal = document.getElementById('forumOpacityVal');
  const applyBtn = document.getElementById('applyBtn');
  const blocksListEl = document.getElementById('blocksList');

  let pendingConfig = Object.assign({}, DEFAULT_CONFIG);

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = 'tab-' + btn.getAttribute('data-tab');
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('active');
    });
  });

  function markPending() {
    if (statusEl) {
      statusEl.style.color = '#FBBF24';
      statusEl.textContent = 'Есть изменения — нажмите «Применить сейчас»';
    }
    if (applyBtn) applyBtn.classList.add('dirty');
  }

  function renderBlocksList() {
    if (!blocksListEl) return;
    const blocks = Array.isArray(pendingConfig.homeBlocks) && pendingConfig.homeBlocks.length > 0
      ? pendingConfig.homeBlocks
      : DEFAULT_CONFIG.homeBlocks.slice();
    pendingConfig.homeBlocks = blocks;

    blocksListEl.innerHTML = '';
    blocks.forEach((block, idx) => {
      const row = document.createElement('div');
      row.className = 'block-item';
      row.innerHTML = \`
        <label>
          <input type="checkbox" data-block-idx="\${idx}" \${block.enabled ? 'checked' : ''} />
          <span>\${block.label}</span>
        </label>
        <code style="font-size:10px;color:#64748B;">\${block.id}</code>
      \`;
      blocksListEl.appendChild(row);
    });

    blocksListEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const i = Number(e.target.getAttribute('data-block-idx'));
        pendingConfig.homeBlocks[i].enabled = e.target.checked;
        markPending();
      });
    });
  }

  function renderForm(cfg) {
    fields.forEach((key) => {
      const el = document.getElementById(key);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = Boolean(cfg[key]);
      else el.value = cfg[key] !== undefined ? cfg[key] : '';
    });
    if (radiusVal) radiusVal.textContent = cfg.cardBorderRadius || 16;
    if (opacityVal) opacityVal.textContent = cfg.cardOpacity === 82 ? 92 : (cfg.cardOpacity || 92);
    if (forumOpacityVal) forumOpacityVal.textContent = cfg.forumOpacity !== undefined ? cfg.forumOpacity : 92;
    renderBlocksList();
  }

  function commitAndApplyConfig(cfg, message) {
    chrome.storage.local.set({ libCustomizerConfig: cfg }, () => {
      if (chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'LIB_CUSTOMIZER_UPDATE', config: cfg }, () => {
              void chrome.runtime.lastError;
            });
          }
        });
      }
      if (applyBtn) applyBtn.classList.remove('dirty');
      if (statusEl) {
        statusEl.style.color = '#10B981';
        statusEl.textContent = message || '✓ Настройки применены без миганий';
      }
    });
  }

  chrome.storage.local.get(['libCustomizerConfig'], (res) => {
    pendingConfig = Object.assign({}, DEFAULT_CONFIG, res.libCustomizerConfig || {});
    if (pendingConfig.cardOpacity === 82) pendingConfig.cardOpacity = 92;
    if (pendingConfig.forumOpacity === undefined) pendingConfig.forumOpacity = 92;
    if (!Array.isArray(pendingConfig.homeBlocks) || pendingConfig.homeBlocks.length === 0) {
      pendingConfig.homeBlocks = DEFAULT_CONFIG.homeBlocks.slice();
    }
    renderForm(pendingConfig);
  });

  fields.forEach((key) => {
    const el = document.getElementById(key);
    if (!el) return;
    const eventName = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      const val = el.type === 'checkbox' ? el.checked : (el.type === 'range' || el.type === 'number' ? Number(el.value) : el.value);
      pendingConfig[key] = val;
      if (key === 'cardBorderRadius' && radiusVal) radiusVal.textContent = val;
      if (key === 'cardOpacity' && opacityVal) opacityVal.textContent = val;
      if (key === 'forumOpacity' && forumOpacityVal) forumOpacityVal.textContent = val;
      markPending();
    });
  });

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const preset = PRESETS[presetKey];
      if (!preset) return;
      pendingConfig = Object.assign({}, pendingConfig, preset, { themePreset: presetKey });
      renderForm(pendingConfig);
      markPending();
    });
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      commitAndApplyConfig(pendingConfig, '✓ Все настройки успешно применены!');
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      pendingConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      renderForm(pendingConfig);
      commitAndApplyConfig(pendingConfig, '✓ Сброшено к настройкам студии');
    });
  }
});
`;
}

export function generateBackgroundJs(defaultConfig: ExtensionConfig): string {
  return `/**
 * LibCustomizer Pro v5.8 — Background Service Worker
 */
const DEFAULT_CONFIG = ${JSON.stringify(defaultConfig, null, 2)};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['libCustomizerConfig'], (res) => {
    if (!res.libCustomizerConfig) {
      chrome.storage.local.set({ libCustomizerConfig: DEFAULT_CONFIG });
    }
  });
});
`;
}

/**
 * Generates a standalone Tampermonkey / Violentmonkey UserScript (.user.js) with v5.8 fixes
 */
export function generateUserscript(cfg: ExtensionConfig): string {
  const compiledCss = compileDynamicCss(cfg);
  const domainMatches = [
    '*://mangalib.me/*',
    '*://*.mangalib.me/*',
    '*://mangalib.org/*',
    '*://*.mangalib.org/*',
    '*://*.shlib.life/*',
    '*://shlib.life/*',
    '*://*.animelib.org/*',
    '*://animelib.org/*',
    '*://ranobelib.me/*',
    '*://*.ranobelib.me/*',
    '*://ranobelib.org/*',
    '*://*.ranobelib.org/*',
    '*://hentailib.me/*',
    '*://*.hentailib.me/*',
  ];

  return `// ==UserScript==
// @name         LibCustomizer Pro v5.8 — Настраиваемый форум + Прозрачные рамки (${cfg.themePreset.toUpperCase()})
// @namespace    https://libcustomizer.studio/
// @version      5.8.0
// @description  Перекраска верхней шапки MangaLIB, настраиваемая плотность подложки форума, прозрачные рамки border, однородные карточки без двойных рамок и AdBlock.
// @author       LibCustomizer Studio
${domainMatches.map((m) => `// @match        ${m}`).join('\n')}
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const CSS_RULES = ${JSON.stringify(compiledCss)};
  const PANIC_ENABLED = ${cfg.panicKeyEnabled};
  const PANIC_KEY = ${JSON.stringify(cfg.panicKeyCode)};
  const PANIC_URL = ${JSON.stringify(cfg.panicRedirectUrl)};

  function injectStyles() {
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(CSS_RULES);
    } else {
      const style = document.createElement('style');
      style.id = 'lib-customizer-userscript-css';
      style.textContent = CSS_RULES;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  function markTopHeader() {
    if (!document.body && !document.documentElement) return;
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
          return;
        }
        cur = cur.parentElement;
      }
    }
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markTopHeader);
  } else {
    markTopHeader();
  }
  window.addEventListener('load', markTopHeader);
  window.addEventListener('scroll', markTopHeader, { passive: true });
  setTimeout(markTopHeader, 400);
  setTimeout(markTopHeader, 1200);
  setTimeout(markTopHeader, 2500);

  window.addEventListener('keydown', function (e) {
    if (PANIC_ENABLED && e.key === PANIC_KEY) {
      e.preventDefault();
      window.location.replace(PANIC_URL);
    }
  });
})();
`;
}

/**
 * Generates README.md in Russian with v5.8 changelog
 */
export function generateReadmeMd(): string {
  const sitesList = LIB_SITES.map((s) => `- **${s.name}**: \`${s.domains.join('`, `')}\``).join('\n');
  return `# LibCustomizer Pro v5.8 — Настраиваемая прозрачность Форума и Прозрачные рамки

Сгенерировано в **LibCustomizer Studio**.

## Что исправлено в v5.8:
1. **Настраиваемая прозрачность подложки форума**:
   - Добавлен отдельный параметр \`forumOpacity\` (от 0% до 100%) со слайдером в popup и веб-студии.
   - Подложка форума использует переменную \`--forum-bg\`, позволяя пользователю настроить идеальный уровень затемнения под свои обои.
2. **Прозрачные границы (border: 1px solid transparent)**:
   - Как было продемонстрировано в DevTools пользователя (\`image_14c66245.png\`), граница \`border\` для блоков форума, сайдбара и карточек тем сделана прозрачной (\`border: 1px solid transparent !important\`), убирая резкие белые или серые линии.
3. **Адаптивная шапка MangaLIB и чистые секции**:
   - Верхняя панель сайта окрашена в цвет темы с эффектом размытия и динамическим детектором в \`markTopHeader()\`.

## Поддерживаемые сайты
${sitesList}
`;
}

/**
 * Packages the entire Manifest V3 extension into a downloadable .zip Blob
 */
export async function buildExtensionZipBlob(config: ExtensionConfig): Promise<Blob> {
  const zip = new JSZip();

  zip.file('manifest.json', generateManifestJson());
  zip.file('styles.css', compileDynamicCss(config));
  zip.file('content.js', generateContentScript(config));
  zip.file('popup.html', generatePopupHtml(config));
  zip.file('popup.js', generatePopupJs(config));
  zip.file('background.js', generateBackgroundJs(config));
  zip.file('libcustomizer.user.js', generateUserscript(config));
  zip.file('README.md', generateReadmeMd());

  return await zip.generateAsync({ type: 'blob' });
}

export async function downloadExtensionZip(config: ExtensionConfig): Promise<void> {
  const blob = await buildExtensionZipBlob(config);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lib-customizer-pro-v5.8-${config.themePreset}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadUserscriptFile(config: ExtensionConfig): void {
  const code = generateUserscript(config);
  const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `libcustomizer-v5.8-${config.themePreset}.user.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
