// Макет ленты «Пойдём» в рамке телефона: повод «Свидание», карточка места, кнопки «Не то / На потом / Хочу».
// По кадру swipeAt нажимается «Хочу», карточка уезжает вправо, под ней следующая. Вёрстка по
// $LEISURE_MATCH_VAULT/design-handoff/png/02-feed.png, экран 390 pt, в кадре масштаб SCALE.
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../brand/tokens.ts';
import type { AppCard } from '../order/types.ts';
import { Logo } from './Logo.tsx';

const SCREEN_W = 390;
const SCREEN_H = 760;
const SCALE = 1.5;
const TOP = 250;

const Card: React.FC<{ card: AppCard; style?: React.CSSProperties }> = ({ card, style }) => (
  <div
    style={{
      position: 'absolute',
      left: 16,
      right: 16,
      top: 118,
      height: 470,
      borderRadius: 20,
      border: `2px solid ${C.ink}`,
      boxShadow: `4px 4px 0 ${C.ink}`,
      background: C.ink,
      overflow: 'hidden',
      ...style,
    }}
  >
    <Img src={staticFile(card.photo)} style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
    <div style={{ padding: '14px 20px', color: C.sticker }}>
      <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 12, letterSpacing: 1.2, opacity: 0.8 }}>{card.meta.toUpperCase()}</div>
      <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 25, lineHeight: 1.15, marginTop: 8 }}>{card.title}</div>
      {card.line && <div style={{ fontFamily: FONT.ui, fontWeight: 400, fontSize: 14, marginTop: 8, opacity: 0.85 }}>{card.line}</div>}
    </div>
  </div>
);

const Button: React.FC<{ label: string; bg: string; grow?: number; scale?: number }> = ({ label, bg, grow = 1, scale = 1 }) => (
  <div
    style={{
      flex: grow,
      height: 52,
      borderRadius: 14,
      border: `2px solid ${C.ink}`,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.ui,
      fontWeight: 600,
      fontSize: 17,
      color: C.ink,
      transform: `scale(${scale})`,
    }}
  >
    {label}
  </div>
);

export const AppMock: React.FC<{ card: AppCard; next?: AppCard; swipeAt: number }> = ({ card, next, swipeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, durationInFrames: 12, config: { damping: 16 } });
  const press = interpolate(frame, [swipeAt - 4, swipeAt, swipeAt + 4], [1, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const out = interpolate(frame, [swipeAt, swipeAt + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const nextIn = interpolate(frame, [swipeAt + 3, swipeAt + 12], [0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - SCREEN_W * SCALE) / 2,
          top: TOP,
          width: SCREEN_W,
          height: SCREEN_H,
          transformOrigin: 'top left',
          transform: `scale(${SCALE}) translateY(${interpolate(enter, [0, 1], [900, 0])}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 44,
            border: `3px solid ${C.ink}`,
            boxShadow: `6px 6px 0 ${C.ink}`,
            background: C.cream,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 20, right: 20, top: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo size={26} />
            <div style={{ background: C.lime, border: `2px solid ${C.ink}`, borderRadius: 12, padding: '7px 16px', fontFamily: FONT.ui, fontWeight: 600, fontSize: 15 }}>
              План
            </div>
          </div>
          <div style={{ position: 'absolute', left: 16, top: 72, display: 'flex', gap: 14, fontFamily: FONT.ui, fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap' }}>
            <span style={{ color: '#57524A', padding: '6px 0' }}>Что угодно</span>
            <span style={{ background: C.ink, color: C.sticker, borderRadius: 10, padding: '6px 12px', transform: 'rotate(-2deg)' }}>Свидание</span>
            <span style={{ color: '#57524A', padding: '6px 0' }}>С друзьями</span>
          </div>
          {next && <Card card={next} style={{ transform: `scale(${nextIn})` }} />}
          <Card
            card={card}
            style={{ transform: `translateX(${out * 520}px) rotate(${out * 16}deg)`, transformOrigin: '50% 120%' }}
          />
          <div style={{ position: 'absolute', left: 16, right: 16, top: 606, display: 'flex', gap: 10 }}>
            <Button label="✕ Не то" bg={C.sticker} />
            <Button label="На потом" bg={C.sticker} grow={1.25} />
            <Button label="♥ Хочу" bg={C.like} scale={press} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
