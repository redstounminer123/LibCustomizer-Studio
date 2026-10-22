# LibCustomizer Pro v5.9 — Единый подвал (.x6_e4), Настраиваемый Форум и Адаптивная Шапка

Сгенерировано в **LibCustomizer Studio**.

## Что нового в v5.9:
1. **Единая полноширинная подложка подвала (`.x6_e4` и `footer`)**:
   - Нижняя часть сайта (`.x6_e4`) оформлена единой полосой во всю ширину в цвет темы (`var(--background-elevated-3)`) с размытием `backdrop-filter`.
   - Убраны вложенные фоны и рамки у отдельных строк внутри подвала (`info@mangalib.me`, `pr@mangalib.me`, ссылки соглашений и строка копирайта).
2. **Автоматический `--text-secondary`**:
   - `--text-secondary` динамически следует за `--text-primary`, оставаясь на пару оттенков темнее (`color-mix(in srgb, var(--text-primary) 72%, #000000)`).
3. **Настраиваемая прозрачность форума и прозрачные границы**:
   - Отдельный ползунок `forumOpacity` (0–100%) и `border: 1px solid transparent !important`.

## Поддерживаемые сайты
- **MangaLib**: `mangalib.me`, `mangalib.org`
- **RanobeLib**: `ranobelib.me`, `ranobelib.org`
- **AnimeLib**: `animelib.org`, `*.animelib.org`
- **SlashLib / ShLib**: `*.shlib.life`, `shlib.life`
- **HentaiLib**: `hentailib.me`
