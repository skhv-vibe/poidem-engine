// Токены бренда «Плакат × Стикер» для видео. Источник: $LEISURE_MATCH_VAULT/design-handoff/tokens.json,
// размеры и правила для кадра 1080x1920: $POIDEM_CONTENT/profile/visual-style.md. Меняются вместе с ним.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  cream: '#F6EDD3',
  sticker: '#FFFDF7',
  ink: '#17150F',
  lime: '#D4EE5A',
  like: '#FF7A45', // только «Хочу»
  tomato: '#EE4B2B', // только точки над «ё»
} as const;

export const FONT = {
  display: "'Dela Gothic One', 'Arial Black', sans-serif",
  ui: "'Onest', system-ui, sans-serif",
  condensed: "'Oswald', 'Arial Narrow', sans-serif",
  script: "'Caveat', cursive",
  wide: "'Unbounded', 'Arial Black', sans-serif",
} as const;

// Безопасная зона Reels: интерфейс Instagram сверху и снизу.
export const SAFE = { top: 220, bottom: 380 } as const;

// Наклейка: контур и жёсткая тень тушью (в макетах 2px / 4px на ширине 390, в кадре x2).
export const STICKER = { border: 4, shadow: 8, radius: 24 } as const;

export const SUBTITLE = { size: 44, baseline: 1340, shadow: '0 2px 8px rgba(0,0,0,.45)' } as const;

// Тайминги формата «подборка», секунды.
export const LISTICLE = { hook: 2, perItem: 2, demo: 3, end: 2.5, transition: 0.4 } as const;

// Цветокор клипов: CSS-фильтр и оверлеи (виньетка, зерно, приподнятые тени).
export const GRADES = {
  none: { filter: 'none', vignette: 0, grain: 0, lift: 0 },
  warm: { filter: 'contrast(1.08) saturate(1.2) sepia(0.1) brightness(1.03)', vignette: 0.35, grain: 0, lift: 0 },
  vivid: { filter: 'contrast(1.16) saturate(1.42) brightness(1.03)', vignette: 0.25, grain: 0, lift: 0 },
  film: { filter: 'contrast(1.05) saturate(1.12) sepia(0.14) brightness(1.04)', vignette: 0.4, grain: 0.10, lift: 0.06 },
} as const;
