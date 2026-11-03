// Видеоклип на весь кадр (cover), отрезок in–out в секундах. Звук клипа выключен: в ролике своя музыка.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';

export type ClipSrc = { src: string; in?: number; out?: number };

export const Clip: React.FC<{ clip: ClipSrc }> = ({ clip }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        muted
        trimBefore={Math.round((clip.in ?? 0) * fps)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </AbsoluteFill>
  );
};
