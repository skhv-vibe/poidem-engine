// Концовка бренда: сливки, логотип влетает, точки над «ё» падают с отскоком, строка поднимается.
// Без ссылки на сайт (решение автора 2026-11-03: не попадать под требования к рекламе).
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../brand/tokens.ts';
import { Logo } from './Logo.tsx';

export const EndCard: React.FC<{ line: string }> = ({ line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, durationInFrames: 10, config: { damping: 11, stiffness: 200 } });
  const dots = spring({ frame: frame - 7, fps, durationInFrames: 12, config: { damping: 7, stiffness: 260 } });
  const text = spring({ frame: frame - 12, fps, durationInFrames: 10, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ background: C.cream, alignItems: 'center', justifyContent: 'center', gap: 60 }}>
      <div style={{ transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])}) rotate(${interpolate(logo, [0, 1], [-6, 0])}deg)`, opacity: Math.min(1, logo * 2) }}>
        <Logo size={200} dotsDrop={interpolate(dots, [0, 1], [-160, 0])} dotsOpacity={frame < 7 ? 0 : 1} />
      </div>
      <div
        style={{
          fontFamily: FONT.ui,
          fontWeight: 500,
          fontSize: 50,
          color: C.ink,
          opacity: text,
          transform: `translateY(${interpolate(text, [0, 1], [30, 0])}px)`,
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  );
};
