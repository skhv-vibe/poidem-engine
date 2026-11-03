// Заказ promo.yaml. Пути src указывают на файлы в public-папке рендера (staticFile), как в заказе.
import type { ClipSrc } from '../components/Clip.tsx';

export type Word = { text: string; start: number; end: number };

type Base = {
  version: 1;
  reel: string;
  music?: string;
  end: { line: string };
  requests?: string[];
  // Озвучка: текст и голос из заказа; файл и слова подставляет render из voice.mp3 и voice.json папки ролика.
  voice?: { text: string; voice_id: string; model?: string; src?: string; words?: Word[] };
};

export type ListicleOrder = Base & {
  format: 'listicle';
  hook: { text: string; plate?: 'lime' | 'sticker'; clip?: ClipSrc };
  items: { name: string; district?: string; clips: ClipSrc[] }[];
  demo?: ClipSrc;
};

// Карточка места в макете приложения.
export type AppCard = { photo: string; title: string; meta: string; line?: string };

export type SpotOrder = Base & {
  format: 'spot';
  hook: { text: string; plate?: 'lime' | 'sticker'; clip: ClipSrc; dur?: number };
  shots: (ClipSrc & { dur: number })[];
  app: { card: AppCard; next?: AppCard; dur?: number; swipe_at?: number };
};

export type PromoOrder = ListicleOrder | SpotOrder;
