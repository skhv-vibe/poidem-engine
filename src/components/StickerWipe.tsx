// Переход «наклейка-шторка»: большая лаймовая наклейка с контуром и жёсткой тенью проезжает по кадру
// снизу вверх с наклоном. В середине пути кадр закрыт целиком, под ней меняется сцена.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, STICKER } from '../brand/tokens.ts';

export const StickerWipe: React.FC<{ duration: number; color?: string }> = ({ duration, color = C.lime }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const y = interpolate(ease, [0, 1], [2400, -2400]);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: -300,
          top: -400,
          width: 1680,
          height: 2700,
          background: color,
          border: `${STICKER.border * 2}px solid ${C.ink}`,
          boxShadow: `${STICKER.shadow * 2}px ${STICKER.shadow * 2}px 0 ${C.ink}`,
          borderRadius: 120,
          transform: `translateY(${y}px) rotate(-8deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
