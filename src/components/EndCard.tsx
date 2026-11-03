// Концовка бренда: сливки, логотип, наклейка «poidem.app», строка повода. Одинаковая во всех роликах.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT } from '../brand/tokens.ts';
import { Logo } from './Logo.tsx';
import { Sticker } from './Sticker.tsx';

export const EndCard: React.FC<{ line: string }> = ({ line }) => (
  <AbsoluteFill style={{ background: C.cream, alignItems: 'center', justifyContent: 'center', gap: 56 }}>
    <Logo size={190} />
    <Sticker delay={5} rotate={-3} style={{ fontFamily: FONT.display, fontSize: 64, padding: '18px 36px 14px' }}>
      poidem.app
    </Sticker>
    <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 48, color: C.ink, marginTop: 8 }}>{line}</div>
  </AbsoluteFill>
);
