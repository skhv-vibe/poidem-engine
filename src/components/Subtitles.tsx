// Тихие субтитры по словам озвучки: Onest 500, строчные, 1–3 слова, смена по фразе (profile/visual-style.md).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, SUBTITLE } from '../brand/tokens.ts';
import type { Phrase } from '../order/phrases.ts';

export const Subtitles: React.FC<{
  phrases: Phrase[];
  offset?: number;
  inkFrom?: number;
  baselineAfterInk?: number;
  hidden?: [number, number][]; // окна кадров без субтитров: шторка, концовка
}> = ({
  phrases,
  offset = 0,
  inkFrom = Infinity,
  baselineAfterInk = SUBTITLE.baseline,
  hidden = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (hidden.some(([a, b]) => frame >= a && frame < b)) return null;
  const t = frame / fps - offset;
  const p = phrases.find((x) => t >= x.start && t < x.end);
  if (!p) return null;
  const ink = frame >= inkFrom;
  const baseline = ink ? baselineAfterInk : SUBTITLE.baseline;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 1920 - baseline,
          textAlign: 'center',
          fontFamily: FONT.ui,
          fontWeight: 500,
          fontSize: SUBTITLE.size,
          lineHeight: 1.2,
          color: ink ? C.ink : '#fff',
          textShadow: ink ? 'none' : SUBTITLE.shadow,
        }}
      >
        {p.text}
      </div>
    </AbsoluteFill>
  );
};
