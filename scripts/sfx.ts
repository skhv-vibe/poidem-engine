// Библиотека звуков: эффекты (library/_sfx/sfx.yaml) и музыка (library/_music/music.yaml) через ElevenLabs.
// Генерирует только отсутствующие файлы: каждый запуск тратит кредиты.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { CONTENT } from './lib/order.ts';

const args = process.argv.slice(2).filter((a) => a !== '--');
if (args.includes('--help')) {
  console.log(`Генерирует недостающие звуки библиотеки через ElevenLabs.

Использование:
  pnpm run sfx [-- --music] [--force <имя>]

Эффекты: $POIDEM_CONTENT/library/_sfx/sfx.yaml → library/_sfx/<имя>.mp3
Музыка (--music): $POIDEM_CONTENT/library/_music/music.yaml → library/_music/<имя>.mp3
Громкость приводится к −14 LUFS (эффекты к −16, тишина в начале срезается). Нужен ELEVENLABS_API_KEY в .env.`);
  process.exit(0);
}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('Нет ELEVENLABS_API_KEY в .env');
const music = args.includes('--music');
const force = args[args.indexOf('--force') + 1];
const dir = join(CONTENT, 'library', music ? '_music' : '_sfx');
const list = YAML.parse(readFileSync(join(dir, music ? 'music.yaml' : 'sfx.yaml'), 'utf8')) as {
  name: string; prompt: string; duration?: number; seconds?: number;
}[];

for (const item of list) {
  const out = join(dir, `${item.name}.mp3`);
  if (existsSync(out) && force !== item.name) continue;
  const [path, body] = music
    ? ['/v1/music?output_format=mp3_44100_192', { prompt: item.prompt, music_length_ms: (item.seconds ?? 30) * 1000, force_instrumental: true }]
    : ['/v1/sound-generation?output_format=mp3_44100_192', { text: item.prompt, duration_seconds: item.duration, prompt_influence: 0.6, model_id: 'eleven_text_to_sound_v2' }];
  const res = await fetch(`https://api.elevenlabs.io${path}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`${item.name}: ElevenLabs HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
    continue;
  }
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  const tmp = out.replace(/\.mp3$/, '.norm.mp3');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', out, '-af', music ? 'loudnorm=I=-14:TP=-1.5' : 'silenceremove=start_periods=1:start_threshold=-60dB,loudnorm=I=-16:TP=-1.5', '-ar', '44100', '-b:a', '192k', tmp]);
  renameSync(tmp, out);
  console.log(`готово: ${out}`);
}
