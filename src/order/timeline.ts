// Раскладка роликов по кадрам: «подборка» (listicle) и «одно место» (spot).
import { FPS, LISTICLE } from '../brand/tokens.ts';
import type { ListicleOrder, PromoOrder, SpotOrder } from './types.ts';

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

export function listicleTimeline(order: ListicleOrder): ListicleTimeline {
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

export type SpotTimeline = {
  hook: Segment;
  shots: Segment[];
  app: Segment & { swipeAt: number };
  end: Segment;
  wipe: number;
  total: number;
};

// «Одно место»: хук, кадры места встык, шторка-наклейка, макет приложения со свайпом, концовка.
export function spotTimeline(order: SpotOrder): SpotTimeline {
  let cursor = 0;
  const hook = { from: 0, duration: f(order.hook.dur ?? 2.4) };
  cursor += hook.duration;
  const shots = order.shots.map((s) => {
    const seg = { from: cursor, duration: f(s.dur) };
    cursor += seg.duration;
    return seg;
  });
  const appDur = f(order.app.dur ?? 3.7);
  const app = { from: cursor, duration: appDur, swipeAt: f(order.app.swipe_at ?? 1.7) };
  cursor += appDur;
  const end = { from: cursor, duration: f(2.5) };
  return { hook, shots, app, end, wipe: f(0.5), total: cursor + end.duration };
}

export function totalFrames(order: PromoOrder): number {
  return order.format === 'spot' ? spotTimeline(order).total : listicleTimeline(order).total;
}

// Контрольные кадры для отчёта рендера: [имя, кадр].
export function keyFrames(order: PromoOrder): [string, number][] {
  if (order.format === 'spot') {
    const t = spotTimeline(order);
    return [
      ['00-hook', Math.round(t.hook.duration * 0.6)],
      ...t.shots.map((s, i): [string, number] => [`${String(i + 1).padStart(2, '0')}-shot`, s.from + Math.round(s.duration / 2)]),
      ['80-app', t.app.from + t.app.swipeAt - 3],
      ['81-app-swipe', t.app.from + t.app.swipeAt + 8],
      ['99-end', t.end.from + t.end.duration - 5],
    ];
  }
  const tl = listicleTimeline(order);
  return [
    ['00-hook', Math.round(tl.hook.duration * 0.7)],
    ...tl.items.map((s, i): [string, number] => [`${String(i + 1).padStart(2, '0')}-item-${s.number}`, s.from + s.duration - 12]),
    ...(tl.demo ? [['90-demo', tl.demo.from + Math.round(tl.demo.duration / 2)] as [string, number]] : []),
    ['99-end', tl.end.from + tl.end.duration - 5],
  ];
}
