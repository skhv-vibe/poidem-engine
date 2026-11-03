// Рендер рилса по заказу promo.yaml: render/reel.mp4, render/contact.png, render/frames/*.png и render-report.md.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, linkSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { FPS } from '../src/brand/tokens.ts';
import { keyFrames, totalFrames } from '../src/order/timeline.ts';
import { ROOT, checkOrder, mediaRoot, resolveOrder } from './lib/order.ts';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(`Рендерит рилс по заказу promo.yaml.

Использование:
  pnpm run render -- <папка ролика | promo.yaml | имя ролика> [--out папка]

Выход (по умолчанию в папку ролика): render/reel.mp4, render/contact.png, render/frames/*.png, render-report.md.
Код 1, если заказ не прошёл проверку или рендер упал.`);
  process.exit(args.length ? 0 : 1);
}
const outIdx = args.indexOf('--out');
const outArg = outIdx >= 0 ? args[outIdx + 1] : null;
const target = args.find((a, i) => !a.startsWith('--') && i !== outIdx + 1)!;
const found = resolveOrder(target);
if (!found) {
  console.error(`Заказ не найден: ${target}`);
  process.exit(1);
}
const outDir = outArg ? resolve(outArg) : found.reelDir;
const renderDir = join(outDir, 'render');
const reportFile = join(outDir, 'render-report.md');
mkdirSync(renderDir, { recursive: true });

const check = checkOrder(found.file);
const started = Date.now();
const report = (status: 'ok' | 'warnings' | 'failed', body: string) =>
  writeFileSync(
    reportFile,
    `---\nstatus: ${status}\nreel: ${check.order?.reel ?? '?'}\nrendered: ${new Date().toISOString()}\n---\n# Отчёт рендера\n\n${body}\n`,
  );

if (!check.order) {
  report('failed', `Заказ не прошёл проверку:\n\n${check.errors.map((e) => `- ${e}`).join('\n')}`);
  console.error(check.errors.join('\n'));
  process.exit(1);
}
const order = check.order;
if (check.errors.length) {
  report('failed', `Заказ не прошёл проверку:\n\n${check.errors.map((e) => `- ${e}`).join('\n')}`);
  console.error(check.errors.join('\n'));
  process.exit(1);
}

// Медиа заказа раскладываются в public-папку бандла с теми же относительными путями: staticFile(src) их находит.
const stage = join(ROOT, '.cache', 'stage', order.reel);
rmSync(stage, { recursive: true, force: true });
const base = mediaRoot(found.file);
for (const rel of check.media) {
  const to = join(stage, rel);
  mkdirSync(dirname(to), { recursive: true });
  try {
    linkSync(join(base, rel), to);
  } catch {
    copyFileSync(join(base, rel), to);
  }
}

try {
  process.stderr.write('Сборка бандла... ');
  const serveUrl = await bundle({ entryPoint: join(ROOT, 'src', 'index.ts'), publicDir: stage, outDir: join(ROOT, '.cache', 'bundle', order.reel) });
  process.stderr.write('готово\n');
  const inputProps = { order };
  const composition = await selectComposition({ serveUrl, id: order.format === 'spot' ? 'Spot' : 'Listicle', inputProps, logLevel: 'error' });
  const mp4 = join(renderDir, 'reel.mp4');
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    imageFormat: 'jpeg',
    jpegQuality: 92,
    inputProps,
    outputLocation: mp4,
    overwrite: true,
    concurrency: Number(process.env.POIDEM_CONCURRENCY || 4),
    logLevel: 'error',
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) process.stderr.write(`рендер ${p * 10}%\n`), (last = p);
    },
  });

  // Контрольные кадры: середина каждого места, демо и концовки; лист всего ролика по 2 кадра в секунду.
  const total = totalFrames(order);
  const framesDir = join(renderDir, 'frames');
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const points = keyFrames(order);
  for (const [name, frame] of points)
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(frame / FPS), '-i', mp4, '-frames:v', '1', join(framesDir, `${name}.png`)]);
  const rows = Math.ceil((total / FPS) * 2 / 8);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `fps=2,scale=180:320,tile=8x${rows}`, '-frames:v', '1', join(renderDir, 'contact.png')]);

  const secs = (total / FPS).toFixed(1);
  const mb = (statSync(mp4).size / 1e6).toFixed(1);
  const lines = [
    `- Файл: \`render/reel.mp4\`, ${secs} с, ${mb} МБ, 1080×1920, ${FPS} fps`,
    order.format === 'spot'
      ? `- Формат: одно место, кадров: ${order.shots.length}, голос: ${order.voice ? 'да' : 'нет'}, музыка: ${order.music ? 'да' : 'нет'}`
      : `- Мест: ${order.items.length}, демо: ${order.demo ? 'да' : 'нет'}, музыка: ${order.music ? 'да' : 'нет'}`,
    `- Время рендера: ${((Date.now() - started) / 1000).toFixed(0)} с`,
    `- Контрольные кадры: \`render/frames/\`, лист: \`render/contact.png\``,
  ];
  if (check.warnings.length) lines.push('', '## Предупреждения', '', ...check.warnings.map((w) => `- ${w}`));
  report(check.warnings.length ? 'warnings' : 'ok', lines.join('\n'));
  console.log(`Готово: ${mp4}`);
  process.exit(0);
} catch (e) {
  report('failed', `Рендер упал:\n\n\`\`\`\n${(e as Error).stack ?? e}\n\`\`\``);
  console.error(e);
  process.exit(1);
} finally {
  if (existsSync(stage)) rmSync(stage, { recursive: true, force: true });
}
