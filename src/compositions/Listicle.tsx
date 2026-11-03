// Формат «подборка»: хук-наклейка, места с отсчётом N → 1, свайп «Хочу» в демо, концовка бренда.
// Структура: $POIDEM_CONTENT/formats/listicle.md, стиль: $POIDEM_CONTENT/profile/visual-style.md.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { C, FONT, SAFE, SUBTITLE } from '../brand/tokens.ts';
import { waitForFonts } from '../brand/fonts.ts';
import { Clip } from '../components/Clip.tsx';
import { EndCard } from '../components/EndCard.tsx';
import { HochuStamp, SwipeOut } from '../components/HochuSwipe.tsx';
import { Sticker } from '../components/Sticker.tsx';
import { listicleTimeline } from '../order/timeline.ts';
import type { PromoOrder } from '../order/types.ts';

export const Listicle: React.FC<{ order: PromoOrder }> = ({ order }) => {
  waitForFonts();
  const { durationInFrames } = useVideoConfig();
  const tl = listicleTimeline(order);
  const last = tl.items.length - 1;

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {tl.demo && order.demo && (
        <Sequence from={tl.demo.from - tl.swipeFrames} durationInFrames={tl.demo.duration + tl.swipeFrames} name="Демо">
          <Clip clip={order.demo} />
        </Sequence>
      )}
      {!tl.demo && (
        <Sequence from={tl.end.from - tl.swipeFrames} name="Концовка под свайпом">
          <EndCard line={order.end.line} />
        </Sequence>
      )}

      {tl.items.map((seg, i) => {
        const item = order.items[i];
        const body = (
          <>
            {seg.clips.map((c, k) => (
              <Sequence key={k} from={c.from} durationInFrames={c.duration}>
                <Clip clip={item.clips[k]} />
              </Sequence>
            ))}
            <Sequence from={i === 0 ? tl.hook.duration : 0} name={`Номер ${seg.number}`}>
              <ItemLabel number={seg.number} name={item.name} district={item.district} />
            </Sequence>
            {i === 0 && (
              <Sequence durationInFrames={tl.hook.duration} name="Хук">
                <Hook text={order.hook.text} plate={order.hook.plate ?? 'lime'} />
              </Sequence>
            )}
          </>
        );
        return (
          <Sequence key={i} from={seg.from} durationInFrames={seg.duration} name={`Место ${seg.number}: ${item.name}`}>
            {i === last ? (
              <SwipeOut duration={seg.duration} frames={tl.swipeFrames}>
                {body}
              </SwipeOut>
            ) : (
              body
            )}
          </Sequence>
        );
      })}

      <Sequence from={tl.items[last].from + tl.items[last].duration - tl.swipeFrames} durationInFrames={tl.swipeFrames + 10} name="Штамп ХОЧУ">
        <HochuStamp />
      </Sequence>

      {tl.demo && (
        <Sequence from={tl.end.from} name="Концовка">
          <EndCard line={order.end.line} />
        </Sequence>
      )}

      {order.music && <Audio src={staticFile(order.music)} volume={(fr) => interpolate(fr, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })} />}
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ text: string; plate: 'lime' | 'sticker' }> = ({ text, plate }) => (
  <AbsoluteFill style={{ alignItems: 'center', paddingTop: SAFE.top + 160, paddingLeft: 70, paddingRight: 70 }}>
    <Sticker
      bg={plate === 'lime' ? C.lime : C.sticker}
      rotate={-3}
      style={{ fontFamily: FONT.display, fontSize: 100, lineHeight: 1.08, padding: '30px 40px 22px', textAlign: 'center', whiteSpace: 'pre-line', maxWidth: 940 }}
    >
      {typo(text)}
    </Sticker>
  </AbsoluteFill>
);

// Короткие предлоги и союзы не висят в конце строки: неразрывный пробел после них. Перенос вручную — \n.
const typo = (t: string) => t.replace(/(^|[\s\u00a0])(без|в|во|на|с|со|к|ко|по|за|из|до|для|и|а|но|не|от|о|об|у)\s+/giu, '$1$2\u00a0');

const ItemLabel: React.FC<{ number: number; name: string; district?: string }> = ({ number, name, district }) => (
  <AbsoluteFill style={{ alignItems: 'center', paddingTop: SAFE.top + 120 }}>
    <Sticker rotate={number % 2 ? -4 : 3} style={{ fontFamily: FONT.display, fontSize: 200, lineHeight: 1, padding: '20px 54px 6px' }}>
      {number}
    </Sticker>
    <div
      style={{
        marginTop: 44,
        fontFamily: FONT.ui,
        fontWeight: 600,
        fontSize: 60,
        color: '#fff',
        textShadow: SUBTITLE.shadow,
        textAlign: 'center',
        padding: '0 80px',
        lineHeight: 1.15,
      }}
    >
      {typo(name)}
    </div>
    {district && (
      <div style={{ marginTop: 14, fontFamily: FONT.ui, fontWeight: 500, fontSize: SUBTITLE.size, color: '#fff', textShadow: SUBTITLE.shadow }}>
        {district}
      </div>
    )}
  </AbsoluteFill>
);
