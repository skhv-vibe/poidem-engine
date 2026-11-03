// Формат «одно место»: хук-наклейка на первом кадре, кадры места встык под закадр с субтитрами,
// шторка-наклейка в макет приложения, свайп «Хочу», концовка бренда.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { C } from '../brand/tokens.ts';
import { waitForFonts } from '../brand/fonts.ts';
import { AppMock } from '../components/AppMock.tsx';
import { Clip } from '../components/Clip.tsx';
import { EndCard } from '../components/EndCard.tsx';
import { HochuStamp } from '../components/HochuSwipe.tsx';
import { StickerWipe } from '../components/StickerWipe.tsx';
import { Subtitles } from '../components/Subtitles.tsx';
import { toPhrases } from '../order/phrases.ts';
import { spotTimeline } from '../order/timeline.ts';
import type { SpotOrder } from '../order/types.ts';
import { Hook } from './Listicle.tsx';

const VOICE_OFFSET = 0.2; // голос стартует чуть позже первого кадра

export const Spot: React.FC<{ order: SpotOrder }> = ({ order }) => {
  waitForFonts();
  const { durationInFrames, fps } = useVideoConfig();
  const t = spotTimeline(order);
  const phrases = order.voice?.words ? toPhrases(order.voice.words) : [];

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={t.hook.duration} name="Хук">
        <Clip clip={order.hook.clip} />
        <Sequence from={6} name="Наклейка хука">
          <Hook text={order.hook.text} plate={order.hook.plate ?? 'lime'} />
        </Sequence>
      </Sequence>

      {order.shots.map((s, i) => (
        <Sequence key={i} from={t.shots[i].from} durationInFrames={t.shots[i].duration} name={`Кадр ${i + 1}`}>
          <Clip clip={s} />
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

      <Sequence from={t.app.from - Math.round(t.wipe / 2)} durationInFrames={t.wipe} name="Шторка">
        <StickerWipe duration={t.wipe} />
      </Sequence>

      {phrases.length > 0 && <Subtitles phrases={phrases} offset={VOICE_OFFSET} inkFrom={t.app.from} baselineAfterInk={1520} hidden={[[t.app.from - Math.round(t.wipe / 2), t.app.from + Math.round(t.wipe / 2)], [t.end.from, t.total]]} />}
      {order.voice?.src && (
        <Sequence from={Math.round(VOICE_OFFSET * fps)} name="Голос">
          <Audio src={staticFile(order.voice.src)} />
        </Sequence>
      )}
      {order.music && (
        <Audio
          src={staticFile(order.music)}
          volume={(fr) => interpolate(fr, [durationInFrames - 20, durationInFrames], [0.25, 0], { extrapolateLeft: 'clamp' })}
        />
      )}
    </AbsoluteFill>
  );
};
