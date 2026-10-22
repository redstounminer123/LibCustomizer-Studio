# LibCustomizer Pro v5.8 — Настраиваемая прозрачность Форума и Прозрачные рамки

Сгенерировано в **LibCustomizer Studio**.

## Что исправлено в v5.8:
1. **Настраиваемая прозрачность подложки форума**:
   - Добавлен отдельный параметр `forumOpacity` (от 0% до 100%) со слайдером в popup и веб-студии.
   - Подложка форума использует переменную `--forum-bg`, позволяя пользователю настроить идеальный уровень затемнения под свои обои.
2. **Прозрачные границы (border: 1px solid transparent)**:
   - Как было продемонстрировано в DevTools пользователя (`image_14c66245.png`), граница `border` для блоков форума, сайдбара и карточек тем сделана прозрачной (`border: 1px solid transparent !important`), убирая резкие белые или серые линии.
3. **Адаптивная шапка MangaLIB и чистые секции**:
   - Верхняя панель сайта окрашена в цвет темы с эффектом размытия и динамическим детектором в `markTopHeader()`.

## Поддерживаемые сайты
- **MangaLib**: `mangalib.me`, `mangalib.org`
- **RanobeLib**: `ranobelib.me`, `ranobelib.org`
- **AnimeLib**: `animelib.org`, `*.animelib.org`
- **SlashLib / ShLib**: `*.shlib.life`, `shlib.life`
- **HentaiLib**: `hentailib.me`
