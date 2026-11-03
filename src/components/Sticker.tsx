// Наклейка «Стикер»: плашка с контуром и жёсткой тенью тушью, наклон, влёт за 6 кадров (scale 1.15 → 1).
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, STICKER } from '../brand/tokens.ts';

export const Sticker: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  rotate?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = C.lime, color = C.ink, rotate = -3, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, durationInFrames: 6, config: { damping: 14, stiffness: 220 } });
  const scale = interpolate(p, [0, 1], [1.15, 1]);
  const turn = interpolate(p, [0, 1], [rotate * 2, rotate]);
  return (
    <div
      style={{
        display: 'inline-block',
        background: bg,
        color,
        border: `${STICKER.border}px solid ${C.ink}`,
        boxShadow: `${STICKER.shadow}px ${STICKER.shadow}px 0 ${C.ink}`,
        borderRadius: STICKER.radius,
        transform: `rotate(${turn}deg) scale(${scale})`,
        opacity: frame < delay ? 0 : Math.min(1, p * 3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
