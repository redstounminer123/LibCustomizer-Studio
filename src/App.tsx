import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Code2,
  Palette,
  LayoutGrid,
  BookOpen,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  Eye,
  Upload,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DEFAULT_CONFIG,
  ExtensionConfig,
  LIB_SITES,
  LibSiteId,
  THEME_PRESETS,
} from './types/extension';
import {
  compileDynamicCss,
  downloadExtensionZip,
  downloadUserscriptFile,
  generateContentScript,
  generateManifestJson,
  generatePopupHtml,
  generateUserscript,
} from './utils/extensionGenerator';
import { LibSiteSimulator } from './components/LibSiteSimulator';

type ConfigCategory = 'theme' | 'layout' | 'reader' | 'privacy' | 'custom_css';
type InspectorTab = 'preview' | 'manifest' | 'content_js' | 'styles_css' | 'userscript' | 'install_guide';

const STORAGE_KEY = 'lib_customizer_studio_v58_state';

const QUICK_WALLPAPERS = [
  {
    name: 'Без обоев',
    url: '',
  },
  {
    name: 'Звёздная туманность',
    url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    name: 'Ночной Нео-Токио',
    url: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    name: 'Туманные горы',
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
];

export default function App() {
  const [config, setConfig] = useState<ExtensionConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          cardOpacity: parsed.cardOpacity === 82 ? 92 : (parsed.cardOpacity || 92),
          forumOpacity: parsed.forumOpacity !== undefined ? parsed.forumOpacity : 92,
          homeBlocks: Array.isArray(parsed.homeBlocks) && parsed.homeBlocks.length > 0 ? parsed.homeBlocks : DEFAULT_CONFIG.homeBlocks,
        };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_CONFIG;
  });

  const [activeCategory, setActiveCategory] = useState<ConfigCategory>('layout');
  const [activeSite, setActiveSite] = useState<LibSiteId>('mangalib');
  const [simulatorViewMode, setSimulatorViewMode] = useState<'catalog' | 'reader' | 'forum'>('catalog');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('preview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [importJsonError, setImportJsonError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore storage errors
    }
  }, [config]);

  const updateConfig = <K extends keyof ExtensionConfig>(key: K, value: ExtensionConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleHomeBlock = (idx: number) => {
    setConfig((prev) => {
      const list = [...(prev.homeBlocks || DEFAULT_CONFIG.homeBlocks)];
      list[idx] = { ...list[idx], enabled: !list[idx].enabled };
      return { ...prev, homeBlocks: list };
    });
  };

  const moveHomeBlock = (idx: number, dir: -1 | 1) => {
    setConfig((prev) => {
      const list = [...(prev.homeBlocks || DEFAULT_CONFIG.homeBlocks)];
      const target = idx + dir;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[target];
      list[target] = temp;
      return { ...prev, homeBlocks: list };
    });
  };

  const applyThemePreset = (presetId: ExtensionConfig['themePreset']) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) {
      updateConfig('themePreset', 'custom');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      themePreset: presetId,
      ...found.colors,
    }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await downloadExtensionZip(config);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportJsonProfile = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `libcustomizer-profile-${config.themePreset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
        setImportJsonError(null);
      } catch {
        setImportJsonError('Некорректный JSON-файл профиля');
      }
    };
    reader.readAsText(file);
  };

  const compiledCss = useMemo(() => compileDynamicCss(config), [config]);
  const manifestCode = useMemo(() => generateManifestJson(), []);
  const contentJsCode = useMemo(() => generateContentScript(config), [config]);
  const userscriptCode = useMemo(() => generateUserscript(config), [config]);
  const popupHtmlCode = useMemo(() => generatePopupHtml(config), [config]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (4 Nav Links) — Zone 3 (1 Primary CTA) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-[#0B0F17]/95 sticky top-0 z-40 backdrop-blur-md">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setInspectorTab('preview');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          LibCustomizer Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setInspectorTab('preview')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorTab === 'preview' ? 'text-white underline underline-offset-8 decoration-orange-500' : ''
            }`}
          >
            Интерактивный стенд
          </button>
          <button
            type="button"
            onClick={() => setInspectorTab('userscript')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorTab === 'userscript' ? 'text-white underline underline-offset-8 decoration-orange-500' : ''
            }`}
          >
            UserScript (.user.js)
          </button>
          <button
            type="button"
            onClick={() => setInspectorTab('content_js')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorTab === 'content_js' || inspectorTab === 'manifest' || inspectorTab === 'styles_css'
                ? 'text-white underline underline-offset-8 decoration-orange-500'
                : ''
            }`}
          >
            Исходный код v5.8
          </button>
          <button
            type="button"
            onClick={() => setInspectorTab('install_guide')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorTab === 'install_guide' ? 'text-white underline underline-offset-8 decoration-orange-500' : ''
            }`}
          >
            Обновление и установка
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingZip ? 'Сборка архива...' : 'Скачать расширение v5.8 (.ZIP)'}</span>
          </button>
        </div>
      </header>

      {/* Sub-header Domain Bar & Secondary Export Actions */}
      <div className="border-b border-slate-800/60 bg-[#0F1522] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <span className="font-medium text-emerald-400">
            Обновление v5.8 (Настраиваемая прозрачность Форума 0–100%, border: transparent, адаптивная шапка):
          </span>
          <span>mangalib.me/.org</span>
          <span aria-hidden="true">·</span>
          <span>*.shlib.life</span>
          <span aria-hidden="true">·</span>
          <span>*.animelib.org</span>
          <span aria-hidden="true">·</span>
          <span>ranobelib.me/.org</span>
          <span aria-hidden="true">·</span>
          <span>hentailib.me</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadUserscriptFile(config)}
            className="px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border border-slate-700/70"
          >
            <FileCode className="w-3.5 h-3.5 text-orange-400" />
            <span>Скачать .user.js (v5.8)</span>
          </button>
          <button
            type="button"
            onClick={handleExportJsonProfile}
            className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-slate-800"
          >
            Экспорт JSON
          </button>
          <label className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-slate-800 flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span>Импорт JSON</span>
            <input type="file" accept=".json" onChange={handleImportJsonProfile} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-rose-950/60 hover:text-rose-200 text-slate-400 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer border border-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {importJsonError && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-2 text-xs text-rose-200 flex items-center justify-between">
          <span>{importJsonError}</span>
          <button type="button" onClick={() => setImportJsonError(null)} className="underline">
            Закрыть
          </button>
        </div>
      )}

      {/* Main Workspace Split */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-start">
        {/* LEFT COLUMN: Configuration Builder Panel */}
        <section className="lg:col-span-5 bg-[#111827] border border-slate-800/90 rounded-xl overflow-hidden flex flex-col">
          {/* Category Segmented Navigation */}
          <div className="p-2 bg-[#0B0F17]/60 border-b border-slate-800/80 grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => setActiveCategory('privacy')}
              className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'privacy'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AdBlock</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('theme')}
              className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'theme'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Палитра</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('layout')}
              className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'layout'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Сетка</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('reader')}
              className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'reader'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Читалка</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('custom_css')}
              className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'custom_css'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Свой CSS</span>
            </button>
          </div>

          {/* Controls Body */}
          <div className="p-5 space-y-6">
            {activeCategory === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    01. Встроенный блокировщик рекламы (AdBlock) и очистка
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Вырезает рекламные блоки Яндекс.РТБ, длинные баннерные плашки на главной странице, iframe-вставки и
                    защищает от спойлеров.
                  </p>
                </div>

                {/* AdBlock Core Controls */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">
                        Активный блокировщик рекламы (CSS + DOM Observer)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Блокирует yandex_rtb, adsbygoogle, adriver и рекламные контейнеры до загрузки
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.adblockEnabled}
                      onChange={(e) => updateConfig('adblockEnabled', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer text-xs">
                    <div>
                      <div className="font-medium text-slate-200">
                        Убрать длинную плашку с рекламой/объявлениями на главной
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Схлопывает растянутые промо-блоки и пустые места от баннеров до 0px
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.hideTopBanners}
                      onChange={(e) => updateConfig('hideTopBanners', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs cursor-pointer">
                    <div>
                      <div className="font-medium text-slate-200">Размытие комментариев (Анти-спойлер)</div>
                      <div className="text-[11px] text-slate-400">Текст комментария проявляется только при наведении мыши</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.blurSpoilerComments}
                      onChange={(e) => updateConfig('blurSpoilerComments', e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs cursor-pointer">
                    <div>
                      <div className="font-medium text-slate-200">Режим 18+ приватности (Блюр всех обложек)</div>
                      <div className="text-[11px] text-slate-400">
                        Размывает обложки в каталоге, возвращает чёткость при наведении курсора
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.nsfwBlurPosters}
                      onChange={(e) => updateConfig('nsfwBlurPosters', e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs cursor-pointer">
                      <span className="text-slate-300">Скрыть боковые виджеты</span>
                      <input
                        type="checkbox"
                        checked={config.hideSidebarWidgets}
                        onChange={(e) => updateConfig('hideSidebarWidgets', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs cursor-pointer">
                      <span className="text-slate-300">Скрыть блок комментариев</span>
                      <input
                        type="checkbox"
                        checked={config.hideCommentsSection}
                        onChange={(e) => updateConfig('hideCommentsSection', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Panic Key Configuration */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-rose-400">Экстренная клавиша «Panic Key»</div>
                      <div className="text-[11px] text-slate-400">
                        Мгновенно перенаправляет вкладку на нейтральный сайт при нажатии
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.panicKeyEnabled}
                      onChange={(e) => updateConfig('panicKeyEnabled', e.target.checked)}
                      className="w-4 h-4 accent-rose-500"
                    />
                  </div>

                  {config.panicKeyEnabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Клавиша</label>
                        <select
                          value={config.panicKeyCode}
                          onChange={(e) => updateConfig('panicKeyCode', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        >
                          <option value="F9">F9</option>
                          <option value="F10">F10</option>
                          <option value="Escape">Escape</option>
                          <option value="`">~ (Тильда)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">URL перенаправления</label>
                        <input
                          type="url"
                          value={config.panicRedirectUrl}
                          onChange={(e) => updateConfig('panicRedirectUrl', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeCategory === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    02. Цветовые пресеты и фоновые обои
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Исправлена кислотная заливка логотипа и вкладок, а также прозрачность обёрток сайта для отображения
                    фоновых обоев.
                  </p>
                </div>

                {/* Preset Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = config.themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyThemePreset(preset.id)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{preset.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{preset.badge}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.bgPrimary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.bgCard }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.accentColor }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Wallpaper Section with Quick Presets */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                      <span>Фоновые обои сайта (видимы сквозь прозрачный #app)</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_WALLPAPERS.map((wp) => (
                      <button
                        key={wp.name}
                        type="button"
                        onClick={() => updateConfig('customBgUrl', wp.url)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                          config.customBgUrl === wp.url
                            ? 'bg-orange-600/20 border-orange-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {wp.name}
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="Вставьте прямую ссылку на картинку (https://...jpg / .png / .webp)"
                    value={config.customBgUrl}
                    onChange={(e) => updateConfig('customBgUrl', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
                  />

                  {config.customBgUrl.trim() && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Затемнение обоев для читаемости текста</span>
                        <span className="font-mono tabular-nums text-orange-400">{config.bgDimming}%</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={92}
                        value={config.bgDimming}
                        onChange={(e) => updateConfig('bgDimming', Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Fine-grained Color Pickers */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300">Ручная настройка цветов (HEX)</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                      <span className="text-slate-300">Основной фон</span>
                      <input
                        type="color"
                        value={config.bgPrimary}
                        onChange={(e) => {
                          updateConfig('themePreset', 'custom');
                          updateConfig('bgPrimary', e.target.value);
                        }}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                      <span className="text-slate-300">Блоки и секции</span>
                      <input
                        type="color"
                        value={config.bgCard}
                        onChange={(e) => {
                          updateConfig('themePreset', 'custom');
                          updateConfig('bgCard', e.target.value);
                        }}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                      <span className="text-slate-300">Акцент (без заливки лого)</span>
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => {
                          updateConfig('themePreset', 'custom');
                          updateConfig('accentColor', e.target.value);
                        }}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                      <span className="text-slate-300">Основной текст</span>
                      <input
                        type="color"
                        value={config.textPrimary}
                        onChange={(e) => {
                          updateConfig('themePreset', 'custom');
                          updateConfig('textPrimary', e.target.value);
                        }}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    03. Управление видимостью секций главной (`data-home-block`) и сетка
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Отключайте любые ненужные блоки главной страницы через чистый CSS (без перемещения DOM-узлов и без мигания).
                  </p>
                </div>

                {/* Interactive Home Blocks Visibility Manager */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                    <span className="font-semibold text-white">Видимость секций главной (data-home-block)</span>
                    <span className="text-[11px] text-emerald-400 font-mono">0% миганий</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {(config.homeBlocks || DEFAULT_CONFIG.homeBlocks).map((block, idx) => (
                      <div
                        key={block.id}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                          block.enabled
                            ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                            : 'bg-slate-950/30 border-slate-900 text-slate-500 line-through'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={block.enabled}
                            onChange={() => toggleHomeBlock(idx)}
                            className="w-3.5 h-3.5 accent-orange-500 shrink-0"
                          />
                          <span className="truncate">{block.label}</span>
                        </label>
                        <code className="text-[10px] font-mono text-slate-500 shrink-0">[{block.id}]</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Максимальная ширина контейнера сайта</span>
                      <span className="font-mono tabular-nums text-orange-400">{config.containerMaxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1080}
                      max={1920}
                      step={20}
                      value={config.containerMaxWidth}
                      onChange={(e) => updateConfig('containerMaxWidth', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Скругление обложек и секций</span>
                      <span className="font-mono tabular-nums text-orange-400">{config.cardBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={2}
                      value={config.cardBorderRadius}
                      onChange={(e) => updateConfig('cardBorderRadius', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Плотность карточек и секций</span>
                      <span className="font-mono tabular-nums text-orange-400">{config.cardOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      step={2}
                      value={config.cardOpacity}
                      onChange={(e) => updateConfig('cardOpacity', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-500">
                      Единая плотность для секций и карточек главной страницы
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-orange-950/20 border border-orange-500/30">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-orange-300">Плотность подложки Форума (0–100%)</span>
                      <span className="font-mono tabular-nums text-orange-400 font-bold">{config.forumOpacity !== undefined ? config.forumOpacity : 92}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={2}
                      value={config.forumOpacity !== undefined ? config.forumOpacity : 92}
                      onChange={(e) => updateConfig('forumOpacity', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Регулирует прозрачность var(--forum-bg) для сайдбара и тем</span>
                      <span className="text-emerald-400 font-mono text-[10px]">border: transparent ✓</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="block text-xs font-medium text-slate-300">Пропорции обложек (Aspect Ratio)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: '2/3', label: '2:3 Классика' },
                          { id: '3/4', label: '3:4 Компакт' },
                          { id: '16/9', label: '16:9 Широкий' },
                        ] as const
                      ).map((ratio) => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => updateConfig('posterAspectRatio', ratio.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            config.posterAspectRatio === ratio.id
                              ? 'bg-orange-600/20 border-orange-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="text-slate-300">Эффект матового стекла (Glassmorphism)</span>
                      <input
                        type="checkbox"
                        checked={config.glassmorphism}
                        onChange={(e) => updateConfig('glassmorphism', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="text-slate-300">Компактная верхняя панель навигации</span>
                      <input
                        type="checkbox"
                        checked={config.compactHeader}
                        onChange={(e) => updateConfig('compactHeader', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="text-slate-300">Плавающая кнопка быстрых настроек (Alt + L)</span>
                      <input
                        type="checkbox"
                        checked={config.hotkeyFloatButton}
                        onChange={(e) => updateConfig('hotkeyFloatButton', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'reader' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold text-white">
                      04. Читалка манги, ранобэ и аниме-плеер
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Настройка ширины сканов, склейки вебтунов и шрифтов для чтения новелл.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulatorViewMode('reader')}
                    className="px-2.5 py-1 rounded bg-orange-500/15 border border-orange-500/40 text-orange-300 text-[11px] font-medium hover:bg-orange-500/25 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Показать в превью
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Ширина контейнера читалки</span>
                      <span className="font-mono tabular-nums text-orange-400">{config.mangaMaxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={1600}
                      step={20}
                      value={config.mangaMaxWidth}
                      onChange={(e) => updateConfig('mangaMaxWidth', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Отступ между страницами (0px = склейка вебтуна)</span>
                      <span className="font-mono tabular-nums text-orange-400">{config.mangaPageGap}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={32}
                      step={2}
                      value={config.mangaPageGap}
                      onChange={(e) => updateConfig('mangaPageGap', Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Яркость</span>
                        <span className="font-mono text-white">{config.mangaBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={130}
                        value={config.mangaBrightness}
                        onChange={(e) => updateConfig('mangaBrightness', Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Контраст</span>
                        <span className="font-mono text-white">{config.mangaContrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={140}
                        value={config.mangaContrast}
                        onChange={(e) => updateConfig('mangaContrast', Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Сепия</span>
                        <span className="font-mono text-white">{config.mangaSepia}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={config.mangaSepia}
                        onChange={(e) => updateConfig('mangaSepia', Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Ranobe Typography */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-blue-400">Типографика текста новелл (RanobeLib)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Lora', 'Plus Jakarta Sans', 'Georgia', 'JetBrains Mono'] as const).map((font) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => {
                          updateConfig('ranobeFontFamily', font);
                          setActiveSite('ranobelib');
                          setSimulatorViewMode('reader');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs border text-left transition-colors cursor-pointer ${
                          config.ranobeFontFamily === font
                            ? 'bg-blue-500/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'custom_css' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    05. Пользовательский CSS-редактор
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Добавьте собственные CSS-правила, которые автоматически войдут в итоговую сборку.
                  </p>
                </div>

                <textarea
                  rows={10}
                  value={config.customCss}
                  onChange={(e) => updateConfig('customCss', e.target.value)}
                  spellCheck={false}
                  className="w-full p-3.5 rounded-lg bg-[#080B11] border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Live Site Simulator & Code / Package Inspector */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-[#111827] border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {LIB_SITES.map((site) => {
                const active = activeSite === site.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => {
                      setActiveSite(site.id);
                      setInspectorTab('preview');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {site.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setInspectorTab('preview')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  inspectorTab === 'preview' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Превью сайта</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('styles_css')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  inspectorTab === 'styles_css' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                styles.css
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('content_js')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  inspectorTab === 'content_js' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                content.js
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('userscript')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  inspectorTab === 'userscript' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                .user.js
              </button>
            </div>
          </div>

          {inspectorTab === 'preview' && (
            <LibSiteSimulator
              config={config}
              activeSite={activeSite}
              viewMode={simulatorViewMode}
              onViewModeChange={setSimulatorViewMode}
            />
          )}

          {inspectorTab === 'styles_css' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-white">styles.css (v2.5)</span>
                  <span className="text-xs text-slate-400 ml-3">
                    Исправленные стили без поехавшего текста карточек и слепящих плашек
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(compiledCss, 'css')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedId === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'css' ? 'Скопировано' : 'Копировать CSS (для Stylus)'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
                {compiledCss}
              </pre>
            </div>
          )}

          {inspectorTab === 'content_js' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-white">content.js (v2.5)</span>
                  <span className="text-xs text-slate-400 ml-3">
                    Включает MutationObserver-блокировщик рекламы и прозрачность под фоновые обои
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(contentJsCode, 'content_js')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedId === 'content_js' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === 'content_js' ? 'Скопировано' : 'Копировать content.js'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
                {contentJsCode}
              </pre>
            </div>
          )}

          {inspectorTab === 'manifest' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-white">manifest.json (Manifest V3)</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(manifestCode, 'manifest')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedId === 'manifest' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === 'manifest' ? 'Скопировано' : 'Копировать manifest.json'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
                {manifestCode}
              </pre>
            </div>
          )}

          {inspectorTab === 'userscript' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-white">lib-customizer-v2.5.user.js</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(userscriptCode, 'userscript')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedId === 'userscript' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'userscript' ? 'Скопировано' : 'Копировать код'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadUserscriptFile(config)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать .user.js</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
                {userscriptCode}
              </pre>
            </div>
          )}

          {inspectorTab === 'install_guide' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Как обновить расширение до версии v5.8 и выгрузить в GitHub
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Все файлы расширения уже собраны в папке <code className="text-emerald-400">/extension</code> в корне проекта, а также доступны в виде ZIP-архива:
                </p>
              </div>

              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <li>
                  <strong>Выгрузка в GitHub (в 1 клик):</strong> Нажмите на значок <strong>GitHub (Save to GitHub)</strong> в верхней панели Google AI Studio — в ваш репозиторий автоматически загрузится как сама веб-студия, так и готовая папка <code className="text-orange-400">extension/</code> со всеми файлами расширения v5.8.
                </li>
                <li>
                  <strong>Локальная установка (.ZIP):</strong> Нажмите <strong>«Скачать расширение v5.8 (.ZIP)»</strong> в правом верхнем углу и распакуйте архив поверх старой папки.
                </li>
                <li>
                  Перейдите в <code className="text-orange-400">chrome://extensions</code> и нажмите кнопку{' '}
                  <strong>«Обновить» (значок круговой стрелки)</strong> на карточке расширения LibCustomizer Pro.
                </li>
              </ol>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleExportZip}
                  className="py-2.5 px-5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  Скачать обновлённый архив v5.8 (.ZIP)
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText(popupHtmlCode, 'popup')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedId === 'popup' ? 'HTML скопирован' : 'Копировать popup.html'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
