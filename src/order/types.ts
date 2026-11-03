// Заказ promo.yaml после разрешения путей: src указывают на файлы в public-папке рендера (staticFile).
import type { ClipSrc } from '../components/Clip.tsx';

export type PromoOrder = {
  version: 1;
  format: 'listicle';
  reel: string;
  music?: string;
  hook: { text: string; plate?: 'lime' | 'sticker' };
  items: { name: string; district?: string; clips: ClipSrc[] }[];
  demo?: ClipSrc;
  end: { line: string };
  requests?: string[];
};
