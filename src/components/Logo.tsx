// Логотип «пойдём»: Dela Gothic One тушью, точки над «ё» томатом (буква рисуется как «е» + две точки).
import React from 'react';
import { C, FONT } from '../brand/tokens.ts';

export const Logo: React.FC<{ size: number; dotsDrop?: number; dotsOpacity?: number }> = ({ size, dotsDrop = 0, dotsOpacity = 1 }) => {
  const dot = size * 0.17;
  return (
    <div style={{ fontFamily: FONT.display, fontSize: size, lineHeight: 1, color: C.ink, display: 'flex', alignItems: 'baseline' }}>
      <span>пойд</span>
      <span style={{ position: 'relative' }}>
        е
        <span style={{ position: 'absolute', left: '50%', top: size * 0.1, transform: `translateX(-50%) translateY(${dotsDrop}px)`, opacity: dotsOpacity, display: 'flex', gap: dot * 0.55 }}>
          <span style={{ width: dot, height: dot, borderRadius: '50%', background: C.tomato }} />
          <span style={{ width: dot, height: dot, borderRadius: '50%', background: C.tomato }} />
        </span>
      </span>
      <span>м</span>
    </div>
  );
};
