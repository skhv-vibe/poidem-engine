// Пути, чтение и проверка заказа promo.yaml. Общая часть render и validate.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { Ajv } from 'ajv';
import YAML from 'yaml';
import { listicleTimeline, spotTimeline } from '../../src/order/timeline.ts';
import type { PromoOrder } from '../../src/order/types.ts';
import { FPS } from '../../src/brand/tokens.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');
const envFile = join(ROOT, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const expand = (p: string) => resolve(p.replace(/^~(?=$|\/)/, homedir()));
export const CONTENT = expand(process.env.POIDEM_CONTENT || '~/Desktop/poidem-content');

// Вход: папка ролика, путь к promo.yaml или имя ролика (ищется в $POIDEM_CONTENT/reels/).
export function resolveOrder(arg: string): { file: string; reelDir: string } | null {
  for (const c of [resolve(arg), join(CONTENT, 'reels', arg)]) {
    if (!existsSync(c)) continue;
    if (statSync(c).isDirectory()) {
      const f = join(c, 'promo.yaml');
      if (existsSync(f)) return { file: f, reelDir: c };
      continue;
    }
    return { file: c, reelDir: dirname(c) };
  }
  return null;
}

export type Check = { order: PromoOrder | null; errors: string[]; warnings: string[]; media: string[] };

// Корень, от которого считаются пути в заказе: $POIDEM_CONTENT, а для примеров движка — папка заказа.
export function mediaRoot(file: string): string {
  return file.startsWith(CONTENT + '/') ? CONTENT : dirname(file);
}

export function checkOrder(file: string): Check {
  const errors: string[] = [];
  const warnings: string[] = [];
  const media: string[] = [];
  let raw: unknown;
  try {
    raw = YAML.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return { order: null, errors: [`YAML не читается: ${(e as Error).message}`], warnings, media };
  }
  const schema = JSON.parse(readFileSync(join(ROOT, 'schema', 'promo.schema.json'), 'utf8'));
  const ajv = new Ajv({ allErrors: true, useDefaults: true });
  const validate = ajv.compile(schema);
  if (!validate(raw)) {
    for (const e of validate.errors ?? []) errors.push(`${e.instancePath || '/'}: ${e.message}`);
    return { order: null, errors, warnings, media };
  }
  const order = raw as PromoOrder;
  const base = mediaRoot(file);

  const checkClip = (c: { src: string; in?: number; out?: number }, need: number, where: string) => {
    const p = join(base, c.src);
    if (!existsSync(p)) return void errors.push(`${where}: нет файла ${c.src}`);
    media.push(c.src);
    const len = probeDuration(p);
    if (len === null) return void errors.push(`${where}: ffprobe не читает ${c.src}`);
    const from = c.in ?? 0;
    const to = Math.min(c.out ?? len, len);
    if (to - from < need - 0.05)
      warnings.push(`${where}: в клипе ${(to - from).toFixed(1)} с, а сцене нужно ${need.toFixed(1)} с — последний кадр застынет`);
    if (c.out !== undefined && c.out > len + 0.05) warnings.push(`${where}: out ${c.out} с больше длины клипа ${len.toFixed(1)} с`);
  };

  if (order.format === 'spot') {
    const t = spotTimeline(order);
    checkClip(order.hook.clip, t.hook.duration / FPS, 'хук');
    order.shots.forEach((sh, i) => checkClip(sh, t.shots[i].duration / FPS, `кадр ${i + 1}`));
    for (const [where, card] of [['карточка', order.app.card], ['следующая карточка', order.app.next]] as const) {
      if (!card) continue;
      if (existsSync(join(base, card.photo))) media.push(card.photo);
      else errors.push(`${where}: нет фото ${card.photo}`);
    }
  } else {
    const tl = listicleTimeline(order);
    order.items.forEach((item, i) => {
      tl.items[i].clips.forEach((seg, k) => checkClip(item.clips[k], seg.duration / FPS, `места[${i}] «${item.name}», клип ${k + 1}`));
    });
    if (order.hook.clip) checkClip(order.hook.clip, tl.hook.duration / FPS, 'хук');
    if (order.demo && tl.demo) checkClip(order.demo, tl.demo.duration / FPS, 'демо');
  }
  if (order.music) {
    if (existsSync(join(base, order.music))) media.push(order.music);
    else errors.push(`музыка: нет файла ${order.music}`);
  }
  if (order.voice) {
    const dir = dirname(file);
    const vj = join(dir, 'voice.json');
    if (!existsSync(vj) || !existsSync(join(dir, 'voice.mp3'))) errors.push('озвучка: нет voice.mp3 и voice.json, сначала pnpm run voice');
    else {
      const meta = JSON.parse(readFileSync(vj, 'utf8'));
      if (meta.text !== order.voice.text || meta.voice_id !== order.voice.voice_id) errors.push('озвучка: текст или голос в заказе поменялись, перегенерируй pnpm run voice');
      const total = (order.format === 'spot' ? spotTimeline(order).total : listicleTimeline(order).total) / FPS;
      if (meta.duration + 0.2 > total) warnings.push(`озвучка ${meta.duration.toFixed(1)} с длиннее ролика ${total.toFixed(1)} с`);
      order.voice.words = meta.words;
      order.voice.src = relative(base, join(dir, 'voice.mp3'));
      media.push(order.voice.src);
    }
  }
  if (order.requests?.length) warnings.push(`в заказе есть запросы к движку: ${order.requests.join('; ')}`);
  return { order, errors, warnings, media };
}

export function probeDuration(p: string): number | null {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], { encoding: 'utf8' });
    const d = Number(out.trim());
    return Number.isFinite(d) ? d : null;
  } catch {
    return null;
  }
}
