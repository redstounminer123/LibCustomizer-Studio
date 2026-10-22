/**
 * LibCustomizer Pro v5.8 — Background Service Worker
 */
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['libCustomizerConfig'], (res) => {
    if (!res.libCustomizerConfig) {
      chrome.storage.local.set({ libCustomizerConfig: DEFAULT_CONFIG });
    }
  });
});
