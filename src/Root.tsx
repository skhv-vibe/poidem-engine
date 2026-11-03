// Композиции Remotion. Кадр 1080x1920, 30 fps. Длительность считается из заказа.
import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from './brand/tokens.ts';
import { Listicle } from './compositions/Listicle.tsx';
import { Spot } from './compositions/Spot.tsx';
import { listicleTimeline, spotTimeline } from './order/timeline.ts';
import type { ListicleOrder, SpotOrder } from './order/types.ts';

// Пример для студии: клипы-заглушки из examples/smoke (pnpm run smoke кладёт их в public/).
const SAMPLE: ListicleOrder = {
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

const SPOT_SAMPLE: SpotOrder = {
  version: 1,
  format: 'spot',
  reel: '2026-11-spot-smoke',
  hook: { text: 'кофейня-шкатулка\nна Некрасова', clip: { src: 'smoke/a.mp4' } },
  shots: [{ src: 'smoke/b.mp4', dur: 2 }, { src: 'smoke/c.mp4', dur: 2 }],
  app: { card: { photo: 'smoke/card.jpg', title: 'Кофейня в «Особняке-Небылица»', meta: 'кофейня · Центральный' } },
  end: { line: 'свайпай — вечер решён' },
};

export const Root: React.FC = () => (
  <>
  <Composition
    id="Spot"
    component={Spot}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={spotTimeline(SPOT_SAMPLE).total}
    defaultProps={{ order: SPOT_SAMPLE }}
    calculateMetadata={({ props }) => ({ durationInFrames: spotTimeline(props.order).total })}
  />
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
  </>
);
