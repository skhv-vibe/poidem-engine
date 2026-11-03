// Переход «свайп Хочу»: кадр уезжает вправо с поворотом, как карточка, по центру шлёпается штамп «ХОЧУ».
// Оранжевый здесь законный: это лайк (profile/visual-style.md, «Переходы»).
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, STICKER } from '../brand/tokens.ts';

export const HochuStamp: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, durationInFrames: 7, config: { damping: 11, stiffness: 260 } });
  if (frame < delay) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          background: C.like,
          color: C.ink,
          fontFamily: FONT.display,
          fontSize: 120,
          padding: '24px 56px 18px',
          border: `${STICKER.border + 2}px solid ${C.ink}`,
          borderRadius: STICKER.radius,
          boxShadow: `${STICKER.shadow}px ${STICKER.shadow}px 0 ${C.ink}`,
          transform: `rotate(-8deg) scale(${interpolate(p, [0, 1], [1.6, 1])})`,
          opacity: Math.min(1, p * 2),
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <span style={{ fontSize: 96 }}>♥</span>ХОЧУ
      </div>
    </AbsoluteFill>
  );
};

// Обёртка сцены, которая в конце уезжает вправо (последние `frames` кадров своей длительности).
export const SwipeOut: React.FC<{ children: React.ReactNode; duration: number; frames: number }> = ({ children, duration, frames }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [duration - frames, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ease = t * t;
  return (
    <AbsoluteFill style={{ transform: `translateX(${ease * 1300}px) rotate(${ease * 14}deg)`, transformOrigin: '50% 120%' }}>
      {children}
    </AbsoluteFill>
  );
};
