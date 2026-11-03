// Кинетические субтитры: слова появляются по одному в момент, когда их произносят.
// poster — Dela Gothic капсом, акцент на лаймовой наклейке; mix — Oswald капсом на весь кадр,
// акцент рукописным Caveat лаймом поверх; scatter — слова россыпью по строкам слева/справа, Unbounded.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, STICKER } from '../brand/tokens.ts';
import type { Phrase } from '../order/phrases.ts';
import type { Word } from '../order/types.ts';

export type KineticMode = 'poster' | 'mix' | 'scatter';

const isAccent = (w: string, accent: string[]) => accent.some((a) => w.toLowerCase().startsWith(a.toLowerCase()));

function usePop(startSec: number, offset: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = Math.round((startSec + offset) * fps);
  const p = spring({ frame: frame - f0, fps, durationInFrames: 7, config: { damping: 12, stiffness: 240 } });
  return { visible: frame >= f0, p };
}

const PopWord: React.FC<{ w: Word; offset: number; children: (p: number) => React.ReactNode }> = ({ w, offset, children }) => {
  const { visible, p } = usePop(w.start, offset);
  if (!visible) return null;
  return <>{children(p)}</>;
};

const stroke = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${C.ink}`, paintOrder: 'stroke fill' });

export const Kinetic: React.FC<{ phrase: Phrase; mode: KineticMode; accent: string[]; offset: number }> = ({ phrase, mode, accent, offset }) => {
  if (mode === 'poster') {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 520 }}>
        <div style={{ maxWidth: 940, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 22px' }}>
          {phrase.words.map((w, i) => (
            <PopWord key={i} w={w} offset={offset}>
              {(p) =>
                isAccent(w.text, accent) ? (
                  <span
                    style={{
                      display: 'inline-block',
                      background: C.lime,
                      color: C.ink,
                      border: `${STICKER.border}px solid ${C.ink}`,
                      boxShadow: `${STICKER.shadow}px ${STICKER.shadow}px 0 ${C.ink}`,
                      borderRadius: 18,
                      padding: '6px 20px 0',
                      fontFamily: FONT.display,
                      fontSize: 92,
                      textTransform: 'uppercase',
                      transform: `rotate(-3deg) scale(${interpolate(p, [0, 1], [1.4, 1])})`,
                    }}
                  >
                    {w.text}
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: FONT.display,
                      fontSize: 92,
                      color: '#fff',
                      textTransform: 'uppercase',
                      ...stroke(10),
                      textShadow: `6px 6px 0 ${C.ink}`,
                      transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
                      opacity: Math.min(1, p * 2),
                    }}
                  >
                    {w.text}
                  </span>
                )
              }
            </PopWord>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  if (mode === 'mix') {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 420 }}>
        <div style={{ maxWidth: 980, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.92 }}>
          {phrase.words.map((w, i) => (
            <PopWord key={i} w={w} offset={offset}>
              {(p) =>
                isAccent(w.text, accent) ? (
                  <span
                    style={{
                      fontFamily: FONT.script,
                      fontWeight: 700,
                      fontSize: 200,
                      color: C.lime,
                      margin: '-46px 0 -40px',
                      ...stroke(6),
                      transform: `rotate(-6deg) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
                      textShadow: '0 4px 18px rgba(0,0,0,.45)',
                      zIndex: 2,
                    }}
                  >
                    {w.text.toLowerCase()}
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: FONT.condensed,
                      fontWeight: 700,
                      fontSize: w.text.length > 9 ? 120 : 168,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: -2,
                      textShadow: '0 6px 24px rgba(0,0,0,.45)',
                      clipPath: `inset(${(1 - p) * 100}% 0 0 0)`,
                      transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
                    }}
                  >
                    {w.text}
                  </span>
                )
              }
            </PopWord>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // scatter: строки по 1–2 слова (короткое служебное слово идёт со следующим), выравнивание по очереди.
  const lines: Word[][] = [];
  for (const w of phrase.words) {
    const last = lines[lines.length - 1];
    if (last && last.length === 1 && last[0].text.length <= 3 && !isAccent(w.text, accent)) last.push(w);
    else lines.push([w]);
  }
  const aligns = ['flex-start', 'flex-end', 'center'] as const;
  return (
    <AbsoluteFill style={{ padding: '820px 70px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', justifyContent: aligns[li % 3], gap: 20, alignItems: 'baseline' }}>
          {line.map((w, i) => (
            <PopWord key={i} w={w} offset={offset}>
              {(p) => {
                const acc = isAccent(w.text, accent);
                return (
                  <span
                    style={{
                      fontFamily: FONT.wide,
                      fontWeight: acc ? 800 : 400,
                      fontSize: acc ? Math.min(104, Math.floor(940 / (w.text.length * 0.86))) : w.text.length <= 3 ? 52 : Math.min(74, Math.floor(940 / (w.text.length * 0.66))),
                      color: acc ? C.lime : '#fff',
                      textTransform: acc ? 'uppercase' : 'lowercase',
                      lineHeight: 1.05,
                      textShadow: '0 4px 20px rgba(0,0,0,.5)',
                      opacity: Math.min(1, p * 1.5),
                      transform: `translateX(${interpolate(p, [0, 1], [li % 2 ? 60 : -60, 0])}px)`,
                    }}
                  >
                    {w.text}
                  </span>
                );
              }}
            </PopWord>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
