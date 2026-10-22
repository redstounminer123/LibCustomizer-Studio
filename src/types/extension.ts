export type LibSiteId = 'mangalib' | 'ranobelib' | 'animelib' | 'slashlib' | 'hentailib';

export interface LibSiteMeta {
  id: LibSiteId;
  name: string;
  domains: string[];
  defaultAccent: string;
  description: string;
}

export const LIB_SITES: LibSiteMeta[] = [
  {
    id: 'mangalib',
    name: 'MangaLib',
    domains: ['mangalib.me', 'mangalib.org'],
    defaultAccent: '#FF7A00',
    description: 'Чтение манги, манхвы и маньхуа',
  },
  {
    id: 'ranobelib',
    name: 'RanobeLib',
    domains: ['ranobelib.me', 'ranobelib.org'],
    defaultAccent: '#3B82F6',
    description: 'Чтение ранобэ, новелл и фанфиков',
  },
  {
    id: 'animelib',
    name: 'AnimeLib',
    domains: ['animelib.org', '*.animelib.org'],
    defaultAccent: '#8B5CF6',
    description: 'Просмотр аниме с кастомным плеером',
  },
  {
    id: 'slashlib',
    name: 'SlashLib / ShLib',
    domains: ['*.shlib.life', 'shlib.life'],
    defaultAccent: '#EC4899',
    description: 'Специализированный каталог и проекты ShLib',
  },
  {
    id: 'hentailib',
    name: 'HentaiLib',
    domains: ['hentailib.me'],
    defaultAccent: '#F43F5E',
    description: 'Каталог 18+ с режимом приватности',
  },
];

export type HomeBlockId =
  | 'popular-updates'
  | 'hot-newest'
  | 'latest-views'
  | 'slider'
  | 'top-views'
  | 'telegram'
  | 'forum'
  | 'reviews'
  | 'collections'
  | 'latest-updates'
  | 'top-users'
  | 'newest';

export interface HomeBlockConfig {
  id: HomeBlockId;
  label: string;
  enabled: boolean;
  zone: 'top' | 'main' | 'sidebar';
}

export const DEFAULT_HOME_BLOCKS: HomeBlockConfig[] = [
  { id: 'popular-updates', label: 'Популярные обновления (верхняя карусель)', enabled: true, zone: 'top' },
  { id: 'hot-newest', label: 'Горячие новинки', enabled: true, zone: 'top' },
  { id: 'latest-views', label: 'Продолжить читать', enabled: true, zone: 'top' },
  { id: 'top-views', label: 'Сейчас читают (Новинки / Набирающее / Популярное)', enabled: true, zone: 'top' },
  { id: 'slider', label: 'Рекламный слайдер (Баннер)', enabled: false, zone: 'top' },
  { id: 'latest-updates', label: 'Последние обновления (левая лента)', enabled: true, zone: 'main' },
  { id: 'telegram', label: 'Плашка Telegram-канала', enabled: false, zone: 'sidebar' },
  { id: 'forum', label: 'Последние темы форума', enabled: true, zone: 'sidebar' },
  { id: 'reviews', label: 'Последние отзывы', enabled: true, zone: 'sidebar' },
  { id: 'collections', label: 'Последние коллекции', enabled: true, zone: 'sidebar' },
  { id: 'top-users', label: 'Топ чтения за неделю', enabled: true, zone: 'sidebar' },
  { id: 'newest', label: 'Новинки (в боковой колонке)', enabled: true, zone: 'sidebar' },
];

export interface ExtensionConfig {
  // 1. Visual Theme & Palette
  themePreset: 'oled' | 'dark_slate' | 'catppuccin' | 'tokyo_night' | 'sepia' | 'custom';
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  textPrimary: string;
  textMuted: string;
  accentColor: string;
  glassmorphism: boolean;
  glassBlurPx: number;
  cardOpacity: number;
  forumOpacity: number;
  customBgUrl: string;
  bgDimming: number;

  // 2. Layout, Home Blocks & Cards
  homeBlocks: HomeBlockConfig[];
  containerMaxWidth: number;
  gridColumns: number;
  cardBorderRadius: number;
  posterAspectRatio: '2/3' | '3/4' | '16/9';
  cardHoverEffect: 'lift' | 'glow' | 'none';
  stickyHeaderMode: 'always' | 'autohide' | 'minimal';
  compactHeader: boolean;
  customScrollbar: boolean;

  // 3. Reader & Player (Manga / Ranobe / Anime)
  mangaMaxWidth: number;
  mangaPageGap: number;
  mangaBrightness: number;
  mangaContrast: number;
  mangaSepia: number;
  mangaAutoCropBorders: boolean;
  ranobeFontFamily: 'Plus Jakarta Sans' | 'Lora' | 'JetBrains Mono' | 'Georgia';
  ranobeFontSize: number;
  ranobeLineHeight: number;
  ranobeParaSpacing: number;
  ranobeTextAlign: 'left' | 'justify';
  animeTheaterMode: boolean;
  animeAmbilightGlow: boolean;
  animeHidePlayerControlsIdle: boolean;

  // 4. AdBlock, Content & Privacy Filters
  adblockEnabled: boolean;
  adblockYandexMetrika: boolean;
  adblockFloatingBanners: boolean;
  adblockCollapsePlaceholders: boolean;
  hideTopBanners: boolean;
  hideSidebarWidgets: boolean;
  hideCommentsSection: boolean;
  blurSpoilerComments: boolean;
  hideRatingsAndScores: boolean;
  hideChapterCounters: boolean;
  nsfwBlurPosters: boolean; // Unblurs on hover
  panicKeyEnabled: boolean;
  panicKeyCode: string;
  panicRedirectUrl: string;

  // 5. Custom User CSS & Scripts
  customCss: string;
  hotkeyFloatButton: boolean;
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  themePreset: 'dark_slate',
  bgPrimary: '#0B0F17',
  bgSecondary: '#111827',
  bgCard: '#172033',
  textPrimary: '#F1F5F9',
  textMuted: '#94A3B8',
  accentColor: '#FF7A00',
  glassmorphism: true,
  glassBlurPx: 14,
  cardOpacity: 92,
  forumOpacity: 92,
  customBgUrl: '',
  bgDimming: 68,

  homeBlocks: DEFAULT_HOME_BLOCKS,
  containerMaxWidth: 1440,
  gridColumns: 5,
  cardBorderRadius: 16,
  posterAspectRatio: '2/3',
  cardHoverEffect: 'lift',
  stickyHeaderMode: 'always',
  compactHeader: false,
  customScrollbar: true,

  mangaMaxWidth: 960,
  mangaPageGap: 0,
  mangaBrightness: 100,
  mangaContrast: 102,
  mangaSepia: 0,
  mangaAutoCropBorders: false,
  ranobeFontFamily: 'Lora',
  ranobeFontSize: 18,
  ranobeLineHeight: 1.75,
  ranobeParaSpacing: 16,
  ranobeTextAlign: 'justify',
  animeTheaterMode: true,
  animeAmbilightGlow: true,
  animeHidePlayerControlsIdle: true,

  adblockEnabled: true,
  adblockYandexMetrika: true,
  adblockFloatingBanners: true,
  adblockCollapsePlaceholders: true,
  hideTopBanners: true,
  hideSidebarWidgets: false,
  hideCommentsSection: false,
  blurSpoilerComments: false,
  hideRatingsAndScores: false,
  hideChapterCounters: false,
  nsfwBlurPosters: false,
  panicKeyEnabled: true,
  panicKeyCode: 'F9',
  panicRedirectUrl: 'https://www.google.com',

  customCss: `/* Ваши собственные CSS-правила для всех сайтов семейства Lib */`,
  hotkeyFloatButton: false,
};

export interface ThemePresetDefinition {
  id: ExtensionConfig['themePreset'];
  name: string;
  badge: string;
  colors: Pick<ExtensionConfig, 'bgPrimary' | 'bgSecondary' | 'bgCard' | 'textPrimary' | 'textMuted' | 'accentColor'>;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'oled',
    name: 'Pitch OLED Black',
    badge: 'Глубокий чёрный',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#08080A',
      bgCard: '#101014',
      textPrimary: '#FAFAFA',
      textMuted: '#8E8E93',
      accentColor: '#FF7A00',
    },
  },
  {
    id: 'dark_slate',
    name: 'Nordic Slate',
    badge: 'По умолчанию',
    colors: {
      bgPrimary: '#0B0F17',
      bgSecondary: '#111827',
      bgCard: '#172033',
      textPrimary: '#F1F5F9',
      textMuted: '#94A3B8',
      accentColor: '#FF7A00',
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    badge: 'Пастельный тёмный',
    colors: {
      bgPrimary: '#1E1E2E',
      bgSecondary: '#181825',
      bgCard: '#313244',
      textPrimary: '#CDD6F4',
      textMuted: '#A6ADC8',
      accentColor: '#CBA6F7',
    },
  },
  {
    id: 'tokyo_night',
    name: 'Tokyo Night Storm',
    badge: 'Мягкий индиго',
    colors: {
      bgPrimary: '#1A1B26',
      bgSecondary: '#16161E',
      bgCard: '#24283B',
      textPrimary: '#C0CAF5',
      textMuted: '#9AA5CE',
      accentColor: '#7AA2F7',
    },
  },
  {
    id: 'sepia',
    name: 'Warm Paper Sepia',
    badge: 'Для чтения ранобэ',
    colors: {
      bgPrimary: '#1C1814',
      bgSecondary: '#25201A',
      bgCard: '#2E2720',
      textPrimary: '#EAE0D5',
      textMuted: '#B5A695',
      accentColor: '#E09F3E',
    },
  },
];
