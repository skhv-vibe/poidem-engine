// Субтитры: слова озвучки → фразы по 1–3 слова (profile/visual-style.md, «Слои текста»).
// Сначала текст режется по знакам препинания, длинный кусок делится пополам по месту, где
// перед разрывом не стоит короткое служебное слово («в», «и», «не»…): оно уходит к следующей фразе.
import type { Word } from './types.ts';

export type Phrase = { text: string; start: number; end: number };

const BREAK = /[,.!?:;…]$/;
const CLITIC = /^(в|во|на|с|со|к|ко|по|за|из|до|без|для|и|а|но|не|от|о|об|у|её|его|если)$/iu;
const MAX_CHARS = 24;

const chars = (ws: Word[]) => ws.reduce((n, w) => n + w.text.length + 1, -1);

function split(ws: Word[]): Word[][] {
  if (ws.length <= 3 || (ws.length === 4 && chars(ws) <= MAX_CHARS)) return [ws];
  const mid = ws.length / 2;
  const cuts = [...Array(ws.length - 1).keys()].map((i) => i + 1).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  const k = cuts.find((c) => !CLITIC.test(ws[c - 1].text)) ?? Math.round(mid);
  return [...split(ws.slice(0, k)), ...split(ws.slice(k))];
}

export function toPhrases(words: Word[]): Phrase[] {
  // Тире пристраивается к предыдущему слову.
  const ws: Word[] = [];
  for (const w of words) {
    if (/^[—–-]$/.test(w.text) && ws.length) ws[ws.length - 1] = { ...ws[ws.length - 1], text: ws[ws.length - 1].text + ' —' };
    else ws.push(w);
  }
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of ws) {
    cur.push(w);
    if (BREAK.test(w.text)) chunks.push(cur), (cur = []);
  }
  if (cur.length) chunks.push(cur);
  const out = chunks.flatMap(split).map((c) => ({
    text: c
      .map((w) => w.text)
      .join(' ')
      .replace(/[.!?:;,…]+$/u, '')
      .replace(/[«»"]/gu, '')
      .toLowerCase(),
    start: c[0].start,
    end: c[c.length - 1].end,
  }));
  // Фраза держится до начала следующей (без мигания в коротких паузах), но не дольше 0,6 с после конца.
  return out.map((p, i) => ({ ...p, end: Math.min(out[i + 1]?.start ?? p.end + 0.6, p.end + 0.6) }));
}
