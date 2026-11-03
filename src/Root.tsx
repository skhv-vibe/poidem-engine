// Композиции Remotion. Кадр 1080x1920, 30 fps. Длительность считается из заказа.
import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from './brand/tokens.ts';
import { Listicle } from './compositions/Listicle.tsx';
import { listicleTimeline } from './order/timeline.ts';
import type { PromoOrder } from './order/types.ts';

// Пример для студии: клипы-заглушки из examples/smoke (pnpm run smoke кладёт их в public/).
const SAMPLE: PromoOrder = {
  version: 1,
  format: 'listicle',
  reel: '2026-11-smoke',
  hook: { text: 'куда сходить вдвоём без брони', plate: 'lime' },
  items: [
    { name: 'Кино на крыше', district: 'Петроградская', clips: [{ src: 'smoke/a.mp4' }] },
    { name: 'Джаз во дворе-колодце', clips: [{ src: 'smoke/b.mp4' }] },
    { name: 'Кофейня с пластинками', clips: [{ src: 'smoke/c.mp4' }] },
  ],
  demo: { src: 'smoke/demo.mp4', out: 3 },
  end: { line: 'свайпай — вечер решён' },
};

export const Root: React.FC = () => (
  <Composition
    id="Listicle"
    component={Listicle}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={listicleTimeline(SAMPLE).total}
    defaultProps={{ order: SAMPLE }}
    calculateMetadata={({ props }) => ({ durationInFrames: listicleTimeline(props.order).total })}
  />
);
