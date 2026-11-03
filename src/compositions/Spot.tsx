// Формат «одно место»: хук-наклейка на первом кадре, кадры места с движением и цветокором под закадр,
// кинетические субтитры, шторка-наклейка в макет приложения, свайп «Хочу», концовка бренда.
// Звуки расставляются сами (spotSfx), музыка тихо под всем роликом.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../brand/tokens.ts';
import { waitForFonts } from '../brand/fonts.ts';
import { AppMock } from '../components/AppMock.tsx';
import { EndCard } from '../components/EndCard.tsx';
import { HochuStamp } from '../components/HochuSwipe.tsx';
import { Kinetic } from '../components/Kinetic.tsx';
import { Shot } from '../components/Shot.tsx';
import { StickerWipe } from '../components/StickerWipe.tsx';
import { Subtitles } from '../components/Subtitles.tsx';
import { toPhrases, type Phrase } from '../order/phrases.ts';
import { spotSfx, spotTimeline } from '../order/timeline.ts';
import type { SpotOrder } from '../order/types.ts';
import { Hook } from './Listicle.tsx';

export const VOICE_OFFSET = 0.2; // голос стартует чуть позже первого кадра

export const Spot: React.FC<{ order: SpotOrder }> = ({ order }) => {
  waitForFonts();
  const { durationInFrames, fps } = useVideoConfig();
  const t = spotTimeline(order);
  const phrases = order.voice?.words ? toPhrases(order.voice.words) : [];
  const grade = order.style?.grade ?? 'none';
  const subs = order.style?.subs ?? 'quiet';
  const wipeFrom = t.app.from - Math.round(t.wipe / 2);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={t.hook.duration} name="Хук">
        <Shot clip={order.hook.clip} duration={t.hook.duration} zoom="punch" grade={grade} whipOut={order.shots[0]?.transition === 'whip'} />
        <Sequence from={6} name="Наклейка хука">
          <Hook text={order.hook.text} plate={order.hook.plate ?? 'lime'} />
        </Sequence>
      </Sequence>

      {order.shots.map((s, i) => (
        <Sequence key={i} from={t.shots[i].from} durationInFrames={t.shots[i].duration} name={`Кадр ${i + 1}`}>
          <Shot
            clip={s}
            duration={t.shots[i].duration}
            zoom={s.zoom ?? (i % 2 ? 'out' : 'in')}
            grade={grade}
            whipIn={s.transition === 'whip'}
            whipOut={order.shots[i + 1]?.transition === 'whip'}
          />
        </Sequence>
      ))}

      <Sequence from={t.app.from} durationInFrames={t.app.duration} name="Приложение">
        <AppMock card={order.app.card} next={order.app.next} swipeAt={t.app.swipeAt} />
        <Sequence from={t.app.swipeAt} durationInFrames={20} name="Штамп ХОЧУ">
          <HochuStamp />
        </Sequence>
      </Sequence>

      <Sequence from={t.end.from} name="Концовка">
        <EndCard line={order.end.line} />
      </Sequence>

      <Sequence from={wipeFrom} durationInFrames={t.wipe} name="Шторка">
        <StickerWipe duration={t.wipe} />
      </Sequence>

      {phrases.length > 0 && subs !== 'quiet' && <KineticLayer phrases={phrases} mode={subs} accent={order.style?.accent ?? []} until={wipeFrom} />}
      {phrases.length > 0 && (
        <Subtitles
          phrases={phrases}
          offset={VOICE_OFFSET}
          inkFrom={t.app.from}
          baselineAfterInk={1520}
          hidden={[[subs === 'quiet' ? wipeFrom : 0, t.app.from + Math.round(t.wipe / 2)], [t.end.from, t.total]]}
        />
      )}

      {order.voice?.src && (
        <Sequence from={Math.round(VOICE_OFFSET * fps)} name="Голос">
          <Audio src={staticFile(order.voice.src)} />
        </Sequence>
      )}
      {spotSfx(order, VOICE_OFFSET).map((s, i) => (
        <Sequence key={i} from={s.frame} durationInFrames={45} name="Звук">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
      {order.music && (
        <Audio
          src={staticFile(order.music)}
          loop
          volume={(fr) =>
            (order.music_volume ?? 0.03) *
            interpolate(fr, [0, 10, durationInFrames - 25, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          }
        />
      )}
    </AbsoluteFill>
  );
};

const KineticLayer: React.FC<{ phrases: Phrase[]; mode: 'poster' | 'mix' | 'scatter'; accent: string[]; until: number }> = ({ phrases, mode, accent, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= until) return null;
  const tt = frame / fps - VOICE_OFFSET;
  const p = phrases.find((x) => tt >= x.start - 0.05 && tt < x.end);
  if (!p) return null;
  return <Kinetic key={p.start} phrase={p} mode={mode} accent={accent} offset={VOICE_OFFSET} />;
};
