// Кадр места с движением и цветокором: медленный зум (in/out), «панч» (резкий наезд в начале и дрейф),
// скорость клипа, «хлёст» на входе и выходе (смаз и сдвиг 4 кадра), фильтр цветокора, виньетка, зерно.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GRADES } from '../brand/tokens.ts';
import type { ClipSrc } from './Clip.tsx';

export type Grade = keyof typeof GRADES;
const WHIP = 4;

export const Shot: React.FC<{
  clip: ClipSrc & { speed?: number };
  duration: number;
  zoom?: 'in' | 'out' | 'punch' | 'none';
  whipIn?: boolean;
  whipOut?: boolean;
  grade?: Grade;
}> = ({ clip, duration, zoom = 'in', whipIn, whipOut, grade = 'none' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = GRADES[grade];

  let scale = 1;
  if (zoom === 'in') scale = interpolate(frame, [0, duration], [1.02, 1.12]);
  if (zoom === 'out') scale = interpolate(frame, [0, duration], [1.14, 1.03]);
  if (zoom === 'punch') scale = frame < 6 ? interpolate(frame, [0, 6], [1.22, 1.08]) : interpolate(frame, [6, duration], [1.08, 1.13]);

  let dx = 0;
  let blur = 0;
  if (whipIn && frame < WHIP) {
    const t = 1 - frame / WHIP;
    dx = t * 700;
    blur = t * 28;
  }
  if (whipOut && frame > duration - WHIP) {
    const t = (frame - (duration - WHIP)) / WHIP;
    dx = -t * 700;
    blur = t * 28;
  }

  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${scale})`, filter: `${g.filter}${blur ? ` blur(${blur}px)` : ''}` }}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          muted
          playbackRate={clip.speed ?? 1}
          trimBefore={Math.round((clip.in ?? 0) * fps)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      {g.lift > 0 && <AbsoluteFill style={{ background: `rgba(255, 236, 214, ${g.lift})`, mixBlendMode: 'screen' }} />}
      {g.vignette > 0 && (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,${g.vignette}) 100%)` }} />
      )}
      {g.grain > 0 && <Grain amount={g.grain} />}
    </AbsoluteFill>
  );
};

// Плёночное зерно: шум SVG с новым зерном на каждый второй кадр.
const Grain: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`grain-${Math.floor(frame / 2)}`) * 1000);
  return (
    <AbsoluteFill style={{ opacity: amount, mixBlendMode: 'overlay' }}>
      <svg width="1080" height="1920">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
