// Пробный рендер без настоящих ассетов: клипы-заглушки ffmpeg в examples/smoke, рендер в out/smoke.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/order.ts';

if (process.argv.includes('--help')) {
  console.log(`Пробный рендер формата «подборка» на клипах-заглушках.

Использование:
  pnpm run smoke

Клипы генерируются ffmpeg в examples/smoke/smoke/ (не в git), результат в out/smoke/.`);
  process.exit(0);
}
const dir = join(ROOT, 'examples', 'smoke', 'smoke');
mkdirSync(dir, { recursive: true });
const clips: [string, string][] = [
  ['a', 'testsrc2=size=1080x1920:rate=30'],
  ['b', 'mandelbrot=size=1080x1920:rate=30'],
  ['c', 'cellauto=s=1080x1920:rate=30:rule=110'],
  ['demo', 'smptebars=size=1080x1920:rate=30'],
];
for (const [name, src] of clips) {
  const f = join(dir, `${name}.mp4`);
  if (!existsSync(f)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-t', '6', '-pix_fmt', 'yuv420p', f]);
}
execFileSync('node', [join(ROOT, 'scripts', 'render.ts'), join(ROOT, 'examples', 'smoke', 'promo.yaml'), '--out', join(ROOT, 'out', 'smoke')], { stdio: 'inherit' });
