import React, { useState } from 'react';
import { DEFAULT_HOME_BLOCKS, ExtensionConfig, HomeBlockId, LibSiteId, LIB_SITES } from '../types/extension';
import { Bell, BookOpen, Eye, Flame, MessageSquare, Pin, Play, Search, ShieldCheck, Sliders, Star, ThumbsUp, Volume2, Maximize2 } from 'lucide-react';

interface LibSiteSimulatorProps {
  config: ExtensionConfig;
  activeSite: LibSiteId;
  viewMode: 'catalog' | 'reader' | 'forum';
  onViewModeChange: (mode: 'catalog' | 'reader' | 'forum') => void;
}

interface MockMediaItem {
  id: string;
  title: string;
  type: string;
  rating: string;
  chapters: string;
  year: string;
  gradient: string;
  accentSvgColor: string;
}

const SITE_MOCK_DATA: Record<LibSiteId, MockMediaItem[]> = {
  mangalib: [
    { id: 'm1', title: 'Всеведущий читатель', type: 'Манхва', rating: '9.84', chapters: 'Глава 218', year: '2025', gradient: 'from-orange-950 via-slate-900 to-amber-900', accentSvgColor: '#FF7A00' },
    { id: 'm2', title: 'Милый дом', type: 'Манхва', rating: '9.71', chapters: 'Глава 142', year: '2024', gradient: 'from-rose-950 via-slate-900 to-red-900', accentSvgColor: '#FB7185' },
    { id: 'm3', title: 'Поднятие уровня в одиночку', type: 'Манхва', rating: '9.82', chapters: 'Глава 200', year: '2025', gradient: 'from-indigo-950 via-slate-900 to-purple-900', accentSvgColor: '#818CF8' },
    { id: 'm4', title: 'Система всемогущего дизайнера', type: 'Манхва', rating: '9.89', chapters: 'Глава 164', year: '2026', gradient: 'from-emerald-950 via-slate-900 to-teal-900', accentSvgColor: '#34D399' },
    { id: 'm5', title: 'Ветролом', type: 'Манхва', rating: '9.65', chapters: 'Глава 512', year: '2026', gradient: 'from-cyan-950 via-slate-900 to-blue-900', accentSvgColor: '#38BDF8' },
    { id: 'm6', title: 'Начало после конца', type: 'Манхва', rating: '9.54', chapters: 'Глава 195', year: '2026', gradient: 'from-amber-950 via-slate-900 to-yellow-900', accentSvgColor: '#FBBF24' },
  ],
  ranobelib: [
    { id: 'r1', title: 'Всеведущий читатель: За гранью эпох', type: 'Новелла Ю. Корея', rating: '9.91', chapters: 'Том 8 · Гл. 551', year: '2025', gradient: 'from-blue-950 via-slate-900 to-indigo-900', accentSvgColor: '#60A5FA' },
    { id: 'r2', title: 'Повелитель тайн: Багровый туман', type: 'Веб-новелла', rating: '9.88', chapters: 'Том 6 · Гл. 1394', year: '2024', gradient: 'from-purple-950 via-slate-900 to-slate-800', accentSvgColor: '#C084FC' },
    { id: 'r3', title: 'Библиотека небесного пути', type: 'Ранобэ', rating: '9.45', chapters: 'Том 12 · Гл. 820', year: '2026', gradient: 'from-sky-950 via-slate-900 to-cyan-900', accentSvgColor: '#38BDF8' },
    { id: 'r4', title: 'Механика разбитого времени', type: 'Авторское', rating: '9.67', chapters: 'Том 3 · Гл. 114', year: '2026', gradient: 'from-emerald-950 via-slate-900 to-teal-950', accentSvgColor: '#2DD4BF' },
    { id: 'r5', title: 'Алхимия седьмого предела', type: 'Ранобэ Япония', rating: '9.34', chapters: 'Том 5 · Гл. 205', year: '2025', gradient: 'from-amber-950 via-slate-900 to-orange-950', accentSvgColor: '#F59E0B' },
    { id: 'r6', title: 'Песнь пустоты и звёздной пыли', type: 'Новелла', rating: '9.59', chapters: 'Том 4 · Гл. 178', year: '2026', gradient: 'from-rose-950 via-slate-900 to-fuchsia-950', accentSvgColor: '#F472B6' },
  ],
  animelib: [
    { id: 'a1', title: 'Эхо кибер-призрака: Резонанс', type: 'ТВ Сериал', rating: '9.79', chapters: '12 / 12 эп.', year: '2026', gradient: 'from-violet-950 via-slate-900 to-fuchsia-900', accentSvgColor: '#A78BFA' },
    { id: 'a2', title: 'Путешествие к краю стратосферы', type: 'Полнометражный', rating: '9.64', chapters: '1 эп. (118 мин)', year: '2025', gradient: 'from-blue-950 via-slate-900 to-cyan-900', accentSvgColor: '#38BDF8' },
    { id: 'a3', title: 'Академия пепельных магов II', type: 'ТВ Сериал', rating: '9.51', chapters: '24 / 24 эп.', year: '2026', gradient: 'from-rose-950 via-slate-900 to-orange-900', accentSvgColor: '#FB923C' },
    { id: 'a4', title: 'Созвездие полуночного поезда', type: 'OVA', rating: '9.42', chapters: '4 / 4 эп.', year: '2025', gradient: 'from-indigo-950 via-slate-900 to-blue-950', accentSvgColor: '#818CF8' },
    { id: 'a5', title: 'Ритм стального сердца', type: 'ТВ Сериал', rating: '9.30', chapters: '10 / 13 эп.', year: '2026', gradient: 'from-emerald-950 via-slate-900 to-green-950', accentSvgColor: '#4ADE80' },
    { id: 'a6', title: 'Легенда о белом драконе', type: 'ONA', rating: '9.68', chapters: '16 / 16 эп.', year: '2026', gradient: 'from-amber-950 via-slate-900 to-red-950', accentSvgColor: '#FBBF24' },
  ],
  slashlib: [
    { id: 's1', title: 'Ночной экспресс через неоновый дождь', type: 'Ориджинал', rating: '9.72', chapters: 'Глава 74', year: '2026', gradient: 'from-pink-950 via-slate-900 to-rose-900', accentSvgColor: '#EC4899' },
    { id: 's2', title: 'Контракт на перекрёстке миров', type: 'Манхва', rating: '9.58', chapters: 'Глава 112', year: '2025', gradient: 'from-fuchsia-950 via-slate-900 to-purple-900', accentSvgColor: '#E879F9' },
    { id: 's3', title: 'Тень за кулисами театра', type: 'Маньхуа', rating: '9.49', chapters: 'Глава 88', year: '2026', gradient: 'from-indigo-950 via-slate-900 to-violet-900', accentSvgColor: '#A78BFA' },
    { id: 's4', title: 'Зимний сонет для двоих', type: 'Манга', rating: '9.63', chapters: 'Глава 45', year: '2025', gradient: 'from-sky-950 via-slate-900 to-blue-900', accentSvgColor: '#38BDF8' },
    { id: 's5', title: 'Пепел и бархат', type: 'Новелла', rating: '9.37', chapters: 'Глава 61', year: '2026', gradient: 'from-rose-950 via-slate-900 to-red-900', accentSvgColor: '#FB7185' },
    { id: 's6', title: 'Письма из зеркального города', type: 'Манхва', rating: '9.81', chapters: 'Глава 129', year: '2026', gradient: 'from-purple-950 via-slate-900 to-pink-950', accentSvgColor: '#F472B6' },
  ],
  hentailib: [
    { id: 'h1', title: 'Секретный архив полуночной гильдии', type: 'Додзинси 18+', rating: '9.65', chapters: 'Глава 24', year: '2026', gradient: 'from-rose-950 via-slate-900 to-red-950', accentSvgColor: '#F43F5E' },
    { id: 'h2', title: 'Иллюзия багрового курорта', type: 'Манхва 18+', rating: '9.78', chapters: 'Глава 92', year: '2025', gradient: 'from-fuchsia-950 via-slate-900 to-rose-900', accentSvgColor: '#FB7185' },
    { id: 'h3', title: 'Запретный этаж академии', type: 'Манга 18+', rating: '9.40', chapters: 'Глава 18', year: '2026', gradient: 'from-purple-950 via-slate-900 to-pink-900', accentSvgColor: '#E879F9' },
    { id: 'h4', title: 'Ночная смена в Нео-Токио', type: 'Манхва 18+', rating: '9.54', chapters: 'Глава 65', year: '2026', gradient: 'from-red-950 via-slate-900 to-orange-950', accentSvgColor: '#F97316' },
    { id: 'h5', title: 'Лабиринт искушений', type: 'Полный цвет', rating: '9.82', chapters: 'Глава 110', year: '2025', gradient: 'from-pink-950 via-slate-900 to-rose-950', accentSvgColor: '#EC4899' },
    { id: 'h6', title: 'Тайный дневник алхимика', type: 'Додзинси 18+', rating: '9.31', chapters: 'Глава 12', year: '2026', gradient: 'from-violet-950 via-slate-900 to-fuchsia-950', accentSvgColor: '#C084FC' },
  ],
};

export const LibSiteSimulator: React.FC<LibSiteSimulatorProps> = ({
  config,
  activeSite,
  viewMode,
  onViewModeChange,
}) => {
  const [activeUpdatesTab, setActiveUpdatesTab] = useState<'all' | 'my'>('all');
  const [showOverlayDemo, setShowOverlayDemo] = useState<'none' | 'notifications' | 'catalog_menu' | 'reader_drawer'>('none');
  const siteMeta = LIB_SITES.find((s) => s.id === activeSite) || LIB_SITES[0];
  const items = SITE_MOCK_DATA[activeSite];

  const hexToRgb = (hex: string) => {
    const clean = (hex || '#FF7A00').replace('#', '');
    const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16) || 0;
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  const primaryRgb = hexToRgb(config.bgPrimary);
  const cardRgb = hexToRgb(config.bgCard);
  const accentRgb = hexToRgb(config.accentColor);
  const hasWallpaper = Boolean(config.customBgUrl && config.customBgUrl.trim().length > 0);
  const rawOpacity = Number(config.cardOpacity) || 92;
  const normalizedOpacity = rawOpacity === 82 ? 92 : rawOpacity;
  const baseAlpha = Math.min(Math.max(normalizedOpacity / 100, 0.4), 1);

  const cardAlpha = baseAlpha.toFixed(2);
  const midElevatedAlpha = Math.min(baseAlpha + 0.03, 0.96).toFixed(2);
  const elevatedAlpha = Math.min(baseAlpha + 0.05, 0.98).toFixed(2);
  const nestedAlpha = Math.max(baseAlpha - 0.16, 0.58).toFixed(2);
  const rawForumOpacity = config.forumOpacity !== undefined ? config.forumOpacity : 92;
  const forumAlpha = (Math.min(Math.max(Number(rawForumOpacity), 0), 100) / 100).toFixed(2);
  const radiusPx = Math.max(Number(config.cardBorderRadius) || 16, 12);
  const radiusSm = Math.max(radiusPx - 4, 10);

  const homeBlocks = Array.isArray(config.homeBlocks) && config.homeBlocks.length > 0 ? config.homeBlocks : DEFAULT_HOME_BLOCKS;
  const topBlocks = homeBlocks.filter((b) => b.zone === 'top' && b.enabled && !(b.id === 'slider' && config.adblockEnabled));
  const mainBlocks = homeBlocks.filter((b) => b.zone === 'main' && b.enabled);
  const sidebarBlocks = homeBlocks.filter((b) => b.zone === 'sidebar' && b.enabled);

  const renderHomeBlock = (blockId: HomeBlockId) => {
    switch (blockId) {
      case 'popular-updates':
        return (
          <div
            key="popular-updates"
            data-home-block="popular-updates"
            className="p-3.5 border border-white/10"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
              backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
            }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {items.slice(0, 6).map((item) => (
                <div key={item.id} className="group flex flex-col cursor-pointer">
                  <div
                    className={`w-full bg-gradient-to-br ${item.gradient} border border-white/10`}
                    style={{ aspectRatio: config.posterAspectRatio, borderRadius: `${radiusSm}px` }}
                  />
                  <span className="text-[11px] font-semibold mt-1.5 line-clamp-1" style={{ color: config.textPrimary }}>
                    {item.title}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hot-newest':
        return (
          <div
            key="hot-newest"
            data-home-block="hot-newest"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
              backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
            }}
          >
            <h4 className="text-xs font-semibold" style={{ color: config.textPrimary }}>
              Горячие новинки ▾
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {items.slice().reverse().map((item) => (
                <div key={item.id} className="flex flex-col">
                  <div
                    className={`w-full bg-gradient-to-tr ${item.gradient} border border-white/10`}
                    style={{ aspectRatio: config.posterAspectRatio, borderRadius: `${radiusSm}px` }}
                  />
                  <span className="text-[11px] font-semibold mt-1.5 line-clamp-1" style={{ color: config.textPrimary }}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'latest-views':
        return (
          <div
            key="latest-views"
            data-home-block="latest-views"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
              backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Продолжить читать
              </h4>
              <span className="text-[10px] font-mono opacity-60">data-home-block="latest-views"</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {items.slice(0, 3).map((it, idx) => (
                <div
                  key={it.id}
                  className="wb c1 p-2.5 border border-white/10 flex items-center gap-2.5"
                  style={{
                    backgroundColor: 'var(--lib-bg-nested)',
                    borderRadius: `${radiusSm}px`,
                  }}
                >
                  <div className={`w-9 h-12 rounded bg-gradient-to-br ${it.gradient} shrink-0 border border-white/10`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs font-semibold truncate" style={{ color: config.textPrimary }}>
                      {it.title}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      {it.chapters} — {idx === 0 ? '4 из 67' : '11 из 48'}
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: idx === 0 ? '45%' : '75%', backgroundColor: config.accentColor }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'top-views':
        return (
          <div
            key="top-views"
            data-home-block="top-views"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
              backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Сейчас читают ▾
              </h4>
              <span className="text-[10px] font-mono opacity-60">data-home-block="top-views"</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {['Новинки', 'Набирающее популярность', 'Популярное'].map((colTitle, cIdx) => (
                <div key={colTitle} className="space-y-2">
                  <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {colTitle}
                  </div>
                  {items.slice(cIdx * 2, cIdx * 2 + 2).map((it) => (
                    <div key={it.id} className="flex items-center gap-2.5">
                      <div className={`w-8 h-11 rounded bg-gradient-to-br ${it.gradient} shrink-0 border border-white/10`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: config.textPrimary }}>
                          {it.title}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {it.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div
            key="slider"
            data-home-block="slider"
            className="p-3 border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 flex items-center justify-between"
            style={{ borderRadius: `${radiusPx}px` }}
          >
            <span>Рекламный слайдер (data-home-block="slider") — включите AdBlock, чтобы скрыть</span>
          </div>
        );

      case 'latest-updates':
        return (
          <div
            key="latest-updates"
            data-home-block="latest-updates"
            className="p-4 border border-white/10 space-y-3"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
              backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Последние обновления
              </span>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveUpdatesTab('all')}
                  className="px-2.5 py-1 rounded-t font-medium cursor-pointer"
                  style={
                    activeUpdatesTab === 'all'
                      ? {
                          backgroundColor: `rgba(${accentRgb}, 0.14)`,
                          color: config.textPrimary,
                          borderBottom: `2px solid ${config.accentColor}`,
                        }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  Все обновления
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUpdatesTab('my')}
                  className="px-2.5 py-1 rounded-t font-medium cursor-pointer"
                  style={
                    activeUpdatesTab === 'my'
                      ? {
                          backgroundColor: `rgba(${accentRgb}, 0.14)`,
                          color: config.textPrimary,
                          borderBottom: `2px solid ${config.accentColor}`,
                        }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  Мои обновления
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                >
                  <div className={`w-11 h-15 rounded-lg bg-gradient-to-br ${it.gradient} shrink-0 border border-white/10`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: config.textPrimary }}>
                      {it.title}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: config.textPrimary }}>
                      Том 2 · {it.chapters}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {idx * 4 + 2} минут назад
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'telegram':
        return (
          <div
            key="telegram"
            data-home-block="telegram"
            className="p-3 border border-white/10 flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div>
              <div className="font-semibold" style={{ color: config.textPrimary }}>
                Telegram-канал {siteMeta.name}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                data-home-block="telegram"
              </div>
            </div>
            <span style={{ color: config.accentColor }}>→</span>
          </div>
        );

      case 'forum':
        return (
          <div
            key="forum"
            data-home-block="forum"
            className="p-3.5 border border-white/10 space-y-2"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Последние темы форума →
              </span>
              <span className="text-[10px] font-mono opacity-60">forum</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {['Помощь в поиске тайтла', 'Обсуждение 218 главы', 'Набор в команду перевода'].map((topic, i) => (
                <div
                  key={topic}
                  className="wb c1 px-2.5 py-1.5 flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--lib-bg-nested)',
                    borderRadius: `${radiusSm}px`,
                    color: config.textPrimary,
                  }}
                >
                  <span className="truncate">{topic}</span>
                  <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {(i + 1) * 14} отв.
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div
            key="reviews"
            data-home-block="reviews"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Последние отзывы → (Исправлен контраст!)
              </span>
              <span className="text-[10px] font-mono opacity-60">reviews</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.slice(0, 2).map((it, idx) => (
                <div
                  key={it.id}
                  className="wb c1 overflow-hidden border border-white/10 flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--lib-bg-nested)',
                    borderRadius: `${radiusSm}px`,
                    color: config.textPrimary,
                  }}
                >
                  <div className={`h-14 w-full bg-gradient-to-r ${it.gradient} p-2 flex items-end`}>
                    <span className="text-[10px] font-semibold text-white drop-shadow">{it.title}</span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-emerald-400 font-medium">
                        {idx === 0 ? '✓ Положительный' : '○ Нейтральный'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-snug" style={{ color: config.textPrimary }}>
                      {idx === 0 ? 'Отличная рисовка и продуманный сюжет' : 'Крепкий середнячок на вечер'}
                    </div>
                    <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      Текст отзыва теперь чётко виден на тёмном фоне карточки и никогда не сливается с подложкой.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {240 + idx * 37}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {12 + idx * 5}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'collections':
        return (
          <div
            key="collections"
            data-home-block="collections"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Последние коллекции → (Чёткий текст!)
              </span>
              <span className="text-[10px] font-mono opacity-60">collections</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {['Топ сюжетных манхв 2026', 'Неизбежный конец света'].map((colName, idx) => (
                <div
                  key={colName}
                  className="wb c1 p-2.5 border border-white/10 flex flex-col justify-between gap-2"
                  style={{
                    backgroundColor: 'var(--lib-bg-nested)',
                    borderRadius: `${radiusSm}px`,
                    color: config.textPrimary,
                  }}
                >
                  <div className="text-xs font-semibold text-center" style={{ color: config.textPrimary }}>
                    {colName}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    <span>👁 {2687 + idx * 1420}</span>
                    <span>·</span>
                    <span>★ {67 + idx * 49}</span>
                  </div>
                  <div className="flex items-center justify-center -space-x-2 pt-1">
                    {items.slice(idx, idx + 3).map((sub) => (
                      <div
                        key={sub.id}
                        className={`w-8 h-11 rounded bg-gradient-to-br ${sub.gradient} border border-white/20 shadow`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'top-users':
        return (
          <div
            key="top-users"
            data-home-block="top-users"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Топ чтения за неделю → (Видны все ники и уровни!)
              </span>
              <span className="text-[10px] font-mono opacity-60">top-users</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { rank: '#1', name: 'ShadowReader', chapters: '1 420 глав', pct: '92%' },
                { rank: '#2', name: 'Kuroko_Tetsuya', chapters: '1 185 глав', pct: '80%' },
                { rank: '#3', name: 'Nightura', chapters: '964 главы', pct: '68%' },
                { rank: '#4', name: 'SigizmundSD', chapters: '810 глав', pct: '55%' },
              ].map((u) => (
                <div
                  key={u.rank}
                  className="wb c1 p-2 border border-white/10 flex items-center gap-2.5"
                  style={{
                    backgroundColor: 'var(--lib-bg-nested)',
                    borderRadius: `${radiusSm}px`,
                    color: config.textPrimary,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold truncate" style={{ color: config.textPrimary }}>
                        {u.name}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {u.rank}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: u.pct, backgroundColor: config.accentColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'newest':
        return (
          <div
            key="newest"
            data-home-block="newest"
            className="p-3.5 border border-white/10 space-y-2.5"
            style={{
              backgroundColor: 'var(--background-elevated-1)',
              borderRadius: `${radiusPx}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: config.textPrimary }}>
                Новинки →
              </span>
              <span className="text-[10px] font-mono opacity-60">newest</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {items.slice(0, 4).map((it) => (
                <div key={it.id} className="flex flex-col">
                  <div
                    className={`w-full bg-gradient-to-br ${it.gradient} border border-white/10`}
                    style={{ aspectRatio: config.posterAspectRatio, borderRadius: `${radiusSm}px` }}
                  />
                  <span className="text-[10px] font-medium mt-1 truncate" style={{ color: config.textPrimary }}>
                    {it.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-800/80 transition-colors duration-200 select-none"
      style={
        {
          backgroundColor: config.bgPrimary,
          color: config.textPrimary,
          '--text-primary': config.textPrimary,
          '--text-secondary': `color-mix(in srgb, ${config.textPrimary} 72%, #000000)`,
          '--foreground': `rgba(${cardRgb}, ${cardAlpha})`,
          '--btn-light-bg': `rgba(${cardRgb}, ${nestedAlpha})`,
          '--lib-bg-nested': `rgba(${cardRgb}, ${nestedAlpha})`,
          '--background-elevated-1': `rgba(${cardRgb}, ${cardAlpha})`,
          '--background-elevated-2': `rgba(${cardRgb}, ${midElevatedAlpha})`,
          '--background-elevated-3': `rgba(${cardRgb}, ${elevatedAlpha})`,
          '--forum-bg': `rgba(${cardRgb}, ${forumAlpha})`,
          '--forum-border': 'transparent',
        } as React.CSSProperties
      }
    >
      {/* Background Wallpaper Layer */}
      {hasWallpaper && (
        <div
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(${primaryRgb}, ${(config.bgDimming / 100).toFixed(2)}), rgba(${primaryRgb}, ${(config.bgDimming / 100).toFixed(2)})), url(${config.customBgUrl.trim()})`,
          }}
        />
      )}

      {/* Simulated Browser / Site Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-black/55 border-b border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400">https://{siteMeta.domains[0]}/</span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>v5.9: Единый подвал .x6_e4 · Плотность форума ({config.forumOpacity ?? 92}%) · border: transparent</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowOverlayDemo(showOverlayDemo === 'catalog_menu' ? 'none' : 'catalog_menu')}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              showOverlayDemo === 'catalog_menu'
                ? 'border-white/40 text-white bg-white/10'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Меню «Каталог»
          </button>
          <button
            type="button"
            onClick={() => setShowOverlayDemo(showOverlayDemo === 'notifications' ? 'none' : 'notifications')}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              showOverlayDemo === 'notifications'
                ? 'border-white/40 text-white bg-white/10'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Уведомления
          </button>

          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/10 ml-1">
            <button
              type="button"
              onClick={() => {
                onViewModeChange('catalog');
                setShowOverlayDemo('none');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'catalog' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              style={viewMode === 'catalog' ? { backgroundColor: config.accentColor } : undefined}
            >
              Главная (data-home-block)
            </button>
            <button
              type="button"
              onClick={() => {
                onViewModeChange('forum');
                setShowOverlayDemo('none');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'forum' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              style={viewMode === 'forum' ? { backgroundColor: config.accentColor } : undefined}
            >
              Форум ({config.forumOpacity ?? 92}%, border: 0%)
            </button>
            <button
              type="button"
              onClick={() => {
                onViewModeChange('reader');
                setShowOverlayDemo('reader_drawer');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'reader' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              style={viewMode === 'reader' ? { backgroundColor: config.accentColor } : undefined}
            >
              {activeSite === 'animelib'
                ? 'Аниме-плеер'
                : activeSite === 'ranobelib'
                  ? 'Читалка новелл'
                  : 'Читалка + Шторка'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Lib Header */}
      {config.stickyHeaderMode !== 'minimal' && (
        <div
          className={`relative z-20 flex items-center justify-between px-5 border-b border-white/10 transition-all ${
            config.compactHeader ? 'py-2' : 'py-3'
          }`}
          style={{
            backgroundColor: 'var(--background-elevated-3)',
            backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
          }}
        >
          <div className="flex items-center gap-6">
            <div className="font-display font-bold text-base tracking-tight flex items-center select-none bg-transparent">
              <span className="text-white">{siteMeta.name.replace(/Lib$/i, '')}</span>
              <span style={{ color: config.accentColor }}>LIB</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <button
                type="button"
                onClick={() => {
                  onViewModeChange('catalog');
                  setShowOverlayDemo(showOverlayDemo === 'catalog_menu' ? 'none' : 'catalog_menu');
                }}
                className="cursor-pointer transition-colors hover:text-white flex items-center gap-1 bg-transparent border-0 p-0 text-inherit"
                style={{ color: viewMode === 'catalog' ? '#fff' : config.textPrimary }}
              >
                <span>Каталог</span>
                <span className="text-[10px]">▾</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onViewModeChange('forum');
                  setShowOverlayDemo('none');
                }}
                className="cursor-pointer hover:text-white transition-colors bg-transparent border-0 p-0 text-inherit"
                style={{ color: viewMode === 'forum' ? config.accentColor : 'var(--text-secondary)', fontWeight: viewMode === 'forum' ? 600 : 400 }}
              >
                Форум
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOverlayDemo(showOverlayDemo === 'notifications' ? 'none' : 'notifications')}
              className="p-1.5 rounded-lg border border-white/10 cursor-pointer relative"
              style={{ backgroundColor: 'var(--lib-bg-nested)', color: config.textPrimary }}
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 p-5 space-y-4">
        {viewMode === 'catalog' ? (
          <>
            {/* Top Full-Width Home Blocks (popular-updates, hot-newest, latest-views, top-views) */}
            <div className="flex flex-col gap-4">
              {topBlocks.map((b) => renderHomeBlock(b.id))}
            </div>

            {/* Two-Column Split: Left (latest-updates) + Right Sidebar (telegram, forum, reviews, collections, top-users, newest) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-7 flex flex-col gap-4">
                {mainBlocks.map((b) => renderHomeBlock(b.id))}
              </div>
              {!config.hideSidebarWidgets && (
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {sidebarBlocks.map((b) => renderHomeBlock(b.id))}
                </div>
              )}
            </div>
          </>
        ) : viewMode === 'forum' ? (
          /* FORUM VIEW: Dedicated Surface with Customizable --forum-bg and Transparent Borders */
          <div className="space-y-4" style={{ maxWidth: `${config.containerMaxWidth}px`, margin: '0 auto' }}>
            {/* Forum Breadcrumbs & Toolbar */}
            <div
              className="p-4 flex flex-wrap items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--forum-bg)',
                backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                WebkitBackdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                borderRadius: `${radiusPx}px`,
                border: '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => onViewModeChange('catalog')}
                  className="text-slate-400 hover:text-white transition-colors bg-transparent border-0 p-0 cursor-pointer"
                >
                  Главная
                </button>
                <span className="text-slate-600">/</span>
                <span className="font-semibold text-white">Форум {siteMeta.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-transparent">
                  Плотность: {config.forumOpacity ?? 92}% · border: transparent
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Поиск по темам форума..."
                    className="pl-8 pr-3 py-1.5 rounded-lg text-xs border border-transparent outline-none w-48 sm:w-64"
                    style={{
                      backgroundColor: 'var(--btn-light-bg)',
                      color: config.textPrimary,
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer shadow-sm border border-transparent"
                  style={{ backgroundColor: config.accentColor }}
                >
                  + Создать тему
                </button>
              </div>
            </div>

            {/* Two Column Layout: Categories Sidebar (left) + Topics List & Pinned (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Forum Categories Sidebar */}
              <div
                className="lg:col-span-4 p-4 space-y-3"
                style={{
                  backgroundColor: 'var(--forum-bg)',
                  backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                  WebkitBackdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                  borderRadius: `${radiusPx}px`,
                  border: '1px solid transparent',
                }}
              >
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-white/5">
                  <span style={{ color: config.textPrimary }}>Категории форума</span>
                  <span className="text-[10px] text-slate-400">14.8k тем</span>
                </div>
                <div className="space-y-1">
                  {[
                    { name: 'Все обсуждения', count: '14.8k', active: true },
                    { name: 'Вопросы и ответы по сайту', count: '3.2k', active: false },
                    { name: 'Поиск манги / тайтлов', count: '5.1k', active: false },
                    { name: 'Обсуждение глав и релизов', count: '4.6k', active: false },
                    { name: 'Переводчики и команды', count: '1.2k', active: false },
                    { name: 'Творчество и арты', count: '890', active: false },
                    { name: 'Флудилка и общение', count: '2.1k', active: false },
                  ].map((cat) => (
                    <div
                      key={cat.name}
                      className="px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors"
                      style={{
                        backgroundColor: cat.active ? 'var(--btn-light-bg)' : 'transparent',
                        border: '1px solid transparent',
                        color: cat.active ? config.accentColor : config.textPrimary,
                        fontWeight: cat.active ? 600 : 400,
                      }}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] font-mono opacity-60">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics Main Column */}
              <div className="lg:col-span-8 space-y-4">
                {/* Pinned Topics Container */}
                <div
                  className="p-4 space-y-2.5"
                  style={{
                    backgroundColor: 'var(--forum-bg)',
                    backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                    WebkitBackdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                    borderRadius: `${radiusPx}px`,
                    border: '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold pb-2" style={{ color: config.textPrimary }}>
                    <Pin className="w-3.5 h-3.5 text-orange-400" />
                    <span>Закреплённые важные темы</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        title: 'Правила поведения на форуме MangaLib & ветках обсуждений v5.8',
                        author: 'Администрация MangaLib',
                        badge: 'Важно',
                        replies: 284,
                        views: '45.1k',
                        time: 'Сегодня в 12:40',
                      },
                      {
                        title: 'Гайд: Настройка стилей, кастомных тем и прозрачности форума через LibCustomizer Pro',
                        author: 'LibTeam',
                        badge: 'Гайд',
                        replies: 192,
                        views: '28.9k',
                        time: 'Вчера',
                      },
                    ].map((topic) => (
                      <div
                        key={topic.title}
                        className="p-3 rounded-lg flex items-center justify-between gap-3 text-xs cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          backgroundColor: 'var(--btn-light-bg)',
                          border: '1px solid transparent',
                        }}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shrink-0"
                              style={{ backgroundColor: config.accentColor }}
                            >
                              {topic.badge}
                            </span>
                            <span className="font-medium truncate" style={{ color: config.textPrimary }}>
                              {topic.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            <span>Автор: {topic.author}</span>
                            <span>·</span>
                            <span>{topic.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] shrink-0 font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-orange-400" /> {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {topic.views}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regular Topics List Container */}
                <div
                  className="p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--forum-bg)',
                    backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                    WebkitBackdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
                    borderRadius: `${radiusPx}px`,
                    border: '1px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold pb-2" style={{ color: config.textPrimary }}>
                    <span>Все свежие темы форума</span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-orange-400 font-medium">Новые</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Популярные</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Без ответа</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        title: 'Помощь в поиске манхвы про охотника с системой алхимии',
                        category: 'Поиск тайтлов',
                        author: 'MangaFan99',
                        replies: 38,
                        views: '1.4k',
                        time: '14 минут назад',
                      },
                      {
                        title: 'Обсуждение финальной битвы в «Всеведущий читатель» (глава 218)',
                        category: 'Обсуждение глав',
                        author: 'DokjaReader',
                        replies: 124,
                        views: '8.2k',
                        time: '42 минуты назад',
                      },
                      {
                        title: 'Набор клинеров и тайперов в команду GoldenScans',
                        category: 'Переводчики',
                        author: 'GoldenLead',
                        replies: 19,
                        views: '940',
                        time: '2 часа назад',
                      },
                      {
                        title: 'Какую читалку лучше использовать на планшетах для вебтунов?',
                        category: 'Вопросы и ответы',
                        author: 'TabletLover',
                        replies: 53,
                        views: '2.8k',
                        time: '4 часа назад',
                      },
                      {
                        title: 'Любимые цитаты из новелл и ранобэ: делимся отрывками',
                        category: 'Флудилка',
                        author: 'RainyNight',
                        replies: 87,
                        views: '4.1k',
                        time: 'Сегодня',
                      },
                    ].map((topic) => (
                      <div
                        key={topic.title}
                        className="p-3 rounded-lg flex items-center justify-between gap-3 text-xs cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          backgroundColor: 'var(--btn-light-bg)',
                          border: '1px solid transparent',
                        }}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {topic.category}
                            </span>
                            <span className="font-medium truncate" style={{ color: config.textPrimary }}>
                              {topic.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            <span>{topic.author}</span>
                            <span>·</span>
                            <span>{topic.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] shrink-0 font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-orange-400" /> {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {topic.views}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 relative">
            {activeSite === 'ranobelib' ? (
              <div
                className="mx-auto p-6 sm:p-8 border border-white/10 shadow-xl space-y-4"
                style={{
                  maxWidth: `${Math.min(config.mangaMaxWidth, 860)}px`,
                  backgroundColor: 'var(--background-elevated-1)',
                  borderRadius: `${radiusPx}px`,
                  fontFamily: config.ranobeFontFamily,
                  fontSize: `${config.ranobeFontSize}px`,
                  lineHeight: config.ranobeLineHeight,
                  textAlign: config.ranobeTextAlign,
                  color: config.textPrimary,
                }}
              >
                <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between font-sans">
                  <div>
                    <div className="text-xs font-mono" style={{ color: config.accentColor }}>
                      RanobeLib · Том 4, Глава 82
                    </div>
                    <h3 className="text-lg font-bold mt-0.5" style={{ color: config.textPrimary }}>
                      Горизонт замерзшего времени
                    </h3>
                  </div>
                </div>
                <p style={{ marginBottom: `${config.ranobeParaSpacing}px` }}>
                  Воздух в обсерватории казался густым, словно расплавленное стекло. Сквозь купол пробивался тусклый
                  свет далёкой туманности.
                </p>
              </div>
            ) : activeSite === 'animelib' ? (
              <div className="space-y-4">
                <div
                  className="mx-auto relative overflow-hidden border border-white/15 bg-slate-950 aspect-video flex flex-col justify-between p-5"
                  style={{
                    maxWidth: config.animeTheaterMode ? '100%' : '760px',
                    borderRadius: `${radiusPx}px`,
                    boxShadow: config.animeAmbilightGlow
                      ? `0 0 70px -10px rgba(${accentRgb}, 0.45)`
                      : '0 10px 30px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
                    <span className="font-semibold">Эхо кибер-призрака — Эпизод 12 (1080p)</span>
                  </div>
                  <div className="relative z-10 m-auto">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-2">
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full rounded-full" style={{ backgroundColor: config.accentColor }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex flex-col items-center" style={{ maxWidth: `${Math.min(config.mangaMaxWidth, 680)}px` }}>
                <div className="w-full flex flex-col" style={{ gap: `${config.mangaPageGap}px` }}>
                  {[1, 2].map((pageNumber) => (
                    <div
                      key={pageNumber}
                      className="w-full aspect-[3/4] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-x border-white/10 flex flex-col items-center justify-between p-6 relative overflow-hidden"
                      style={{
                        filter: `brightness(${config.mangaBrightness}%) contrast(${config.mangaContrast}%) sepia(${config.mangaSepia}%)`,
                      }}
                    >
                      <div className="w-full flex justify-between text-[11px] font-mono text-slate-400">
                        <span>{siteMeta.name} Reader v5.0</span>
                        <span>Стр. 0{pageNumber} / 18</span>
                      </div>
                      <div className="my-auto text-center space-y-2">
                        <BookOpen className="w-8 h-8 mx-auto" style={{ color: config.accentColor }} />
                        <div className="text-xs font-semibold text-white">
                          Поля вокруг сканов прозрачны — виден ваш фон ({config.bgPrimary})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simulated Nested Comments Block (Zero Opacity Stacking!) */}
        {!config.hideCommentsSection && (
          <div className="px-4 pb-5">
            <div
              className="mx-auto p-4 border border-white/10 space-y-3"
              style={{
                maxWidth: `${config.containerMaxWidth}px`,
                backgroundColor: 'var(--background-elevated-1)',
                borderRadius: `${radiusPx}px`,
                backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px)` : 'none',
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold" style={{ color: config.textPrimary }}>
                  Комментарии (вложенные ветки без наслаивания прозрачности)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">background: transparent !important</span>
              </div>

              {/* Root Comment */}
              <div className="space-y-2 text-xs" style={{ backgroundColor: 'transparent' }}>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-700/80 inline-flex items-center justify-center text-[10px] font-bold">S</span>
                  <span className="font-bold" style={{ color: config.textPrimary }}>SimbiAnT29</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>2 дня назад</span>
                </div>
                <p style={{ color: config.textPrimary }}>
                  А куда вы нажали, что оно наслоилось друг на друга.
                </p>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: config.accentColor }}>
                  <span className="cursor-pointer">ответить</span>
                  <span className="cursor-pointer">жалоба</span>
                </div>

                {/* Reply Level 1 */}
                <div
                  className="pl-3.5 ml-2 space-y-2"
                  style={{
                    backgroundColor: 'transparent',
                    borderLeft: `2px solid rgba(${accentRgb}, 0.32)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-rose-900/60 inline-flex items-center justify-center text-[10px] font-bold">127</span>
                    <span className="font-bold" style={{ color: config.textPrimary }}>Читатель #127</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>2 дня назад</span>
                  </div>
                  <p style={{ color: config.textPrimary }}>
                    Просто на тайтл перешёл, теперь вложенные ответы полностью прозрачны и не затемняют друг друга.
                  </p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: config.accentColor }}>
                    <span className="cursor-pointer">ответить</span>
                    <span className="cursor-pointer">жалоба</span>
                  </div>

                  {/* Reply Level 2 */}
                  <div
                    className="pl-3.5 ml-2 space-y-1.5"
                    style={{
                      backgroundColor: 'transparent',
                      borderLeft: `2px solid rgba(${accentRgb}, 0.32)`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-700/80 inline-flex items-center justify-center text-[10px] font-bold">S</span>
                      <span className="font-bold" style={{ color: config.textPrimary }}>SimbiAnT29</span>
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>2 дня назад</span>
                    </div>
                    <p style={{ color: config.textPrimary }}>
                      Отлично, у всех уровней вложенности единая прозрачность родительского блока!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulated Bottom Footer (.x6_e4) — Unified Full-Width Theme Bar Without Inner Borders */}
        <footer
          className="x6_e4 px-4 py-4 border-t border-white/10 text-xs transition-colors"
          style={{
            backgroundColor: 'var(--background-elevated-3)',
            backdropFilter: config.glassmorphism ? `blur(${config.glassBlurPx}px) saturate(150%)` : 'none',
            color: config.textPrimary,
          }}
        >
          <div className="mx-auto flex flex-col gap-2" style={{ maxWidth: `${config.containerMaxWidth}px` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 text-[11px]">
                <div>
                  В случаях нарушения авторских прав - обращайтесь на почту{' '}
                  <span className="underline cursor-pointer">info@{siteMeta.domains[0]}</span>
                </div>
                <div>
                  По вопросам сотрудничества и PR -{' '}
                  <span className="underline cursor-pointer">pr@{siteMeta.domains[0]}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 underline">
                  <span>Обратная связь</span>
                  <span>Пользовательское соглашение</span>
                  <span>Политика конфиденциальности</span>
                  <span>Лицензионная оферта</span>
                  <span>Для правообладателей (DMCA)</span>
                  <span>ИТ-деятельность</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  .x6_e4
                </span>
                <div
                  className="w-7 h-7 flex items-center justify-center font-display font-bold text-sm"
                  style={{
                    color: config.textPrimary,
                    borderTop: `2px solid ${config.accentColor}`,
                    borderBottom: `2px solid ${config.accentColor}`,
                  }}
                >
                  M
                </div>
              </div>
            </div>
            <div className="pt-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              ООО “Мангалиб”, 125319, г. Москва, ул. Академика Ильюшина, д.12, помещ. 2/1
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
