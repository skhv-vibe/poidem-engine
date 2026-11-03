// Раскладка формата «подборка» по кадрам. Хук лежит поверх первого места, демо и концовка идут следом.
import { FPS, LISTICLE } from '../brand/tokens.ts';
import type { PromoOrder } from './types.ts';

export type Segment = { from: number; duration: number };
export type ListicleTimeline = {
  hook: Segment;
  ownHook: boolean;
  items: (Segment & { number: number; clips: Segment[] })[];
  swipeFrames: number;
  demo: Segment | null;
  end: Segment;
  total: number;
};

const f = (s: number) => Math.round(s * FPS);

export function listicleTimeline(order: PromoOrder): ListicleTimeline {
  const n = order.items.length;
  // Свой клип у хука: хук идёт отдельной сценой до мест. Без клипа хук лежит поверх первого места.
  const ownHook = !!order.hook.clip;
  let cursor = ownHook ? f(LISTICLE.hook) : 0;
  const items = order.items.map((item, i) => {
    const duration = f(LISTICLE.perItem) + (i === 0 && !ownHook ? f(LISTICLE.hook) : 0);
    const per = Math.floor(duration / item.clips.length);
    const clips = item.clips.map((_, k) => ({
      from: k * per,
      duration: k === item.clips.length - 1 ? duration - k * per : per,
    }));
    const seg = { from: cursor, duration, number: n - i, clips };
    cursor += duration;
    return seg;
  });
  const swipeFrames = f(LISTICLE.transition);
  const demo = order.demo ? { from: cursor, duration: f(clipLength(order.demo) ?? LISTICLE.demo) } : null;
  if (demo) cursor += demo.duration;
  const end = { from: cursor, duration: f(LISTICLE.end) };
  return { hook: { from: 0, duration: f(LISTICLE.hook) }, ownHook, items, swipeFrames, demo, end, total: cursor + end.duration };
}

function clipLength(c: { in?: number; out?: number }): number | null {
  return c.out !== undefined ? c.out - (c.in ?? 0) : null;
}
