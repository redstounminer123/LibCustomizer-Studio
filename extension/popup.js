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
      row.innerHTML = `
        <label>
          <input type="checkbox" data-block-idx="${idx}" ${block.enabled ? 'checked' : ''} />
          <span>${block.label}</span>
        </label>
        <code style="font-size:10px;color:#64748B;">${block.id}</code>
      `;
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
