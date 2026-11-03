// Озвучка ролика через ElevenLabs: voice.mp3 и voice.json (тайминги слов для субтитров) в папке ролика.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { resolveOrder } from './lib/order.ts';

const args = process.argv.slice(2).filter((a) => a !== '--');
if (!args.length || args.includes('--help')) {
  console.log(`Озвучивает закадр ролика через ElevenLabs (text-to-speech with timestamps).

Использование:
  pnpm run voice -- <папка ролика | promo.yaml | имя ролика> [--force]

Берёт из promo.yaml поле voice: { text, voice_id }. Пишет в папку ролика voice.mp3 и voice.json
(слова с началом и концом в секундах). Уже готовую озвучку с тем же текстом и голосом не перегенерирует
без --force: каждый запуск тратит кредиты. Нужен ELEVENLABS_API_KEY в .env.`);
  process.exit(args.length ? 0 : 1);
}
const found = resolveOrder(args.find((a) => !a.startsWith('--'))!);
if (!found) {
  console.error('Заказ не найден');
  process.exit(1);
}
const order = YAML.parse(readFileSync(found.file, 'utf8'));
const v = order.voice as { text: string; voice_id: string; model?: string } | undefined;
if (!v?.text || !v.voice_id) {
  console.error('В заказе нет voice.text и voice.voice_id');
  process.exit(1);
}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Нет ELEVENLABS_API_KEY в .env');
  process.exit(1);
}
const mp3 = join(found.reelDir, 'voice.mp3');
const meta = join(found.reelDir, 'voice.json');
const model = v.model ?? 'eleven_v4';
if (!args.includes('--force') && existsSync(meta)) {
  const old = JSON.parse(readFileSync(meta, 'utf8'));
  if (old.text === v.text && old.voice_id === v.voice_id && old.model === model) {
    console.log(`Озвучка уже есть: ${mp3}`);
    process.exit(0);
  }
}

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}/with-timestamps?output_format=mp3_44100_192`, {
  method: 'POST',
  headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: v.text, model_id: model, language_code: 'ru' }),
});
if (!res.ok) {
  console.error(`ElevenLabs HTTP ${res.status}: ${(await res.text()).slice(0, 1000)}`);
  process.exit(1);
}
const data = (await res.json()) as {
  audio_base64: string;
  alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
};
writeFileSync(mp3, Buffer.from(data.audio_base64, 'base64'));
// Громкость под Reels: −14 LUFS, пик −1,5 dBTP. Тайминги слов не меняются.
const tmp = mp3.replace(/\.mp3$/, '.norm.mp3');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', mp3, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', tmp]);
renameSync(tmp, mp3);

// Слова из посимвольной разметки: слово — подряд идущие непробельные символы.
const a = data.alignment;
const words: { text: string; start: number; end: number }[] = [];
let cur: { text: string; start: number; end: number } | null = null;
a.characters.forEach((ch, i) => {
  if (/\s/.test(ch)) {
    if (cur) words.push(cur), (cur = null);
    return;
  }
  if (!cur) cur = { text: '', start: a.character_start_times_seconds[i], end: 0 };
  cur.text += ch;
  cur.end = a.character_end_times_seconds[i];
});
if (cur) words.push(cur);
const duration = words.length ? words[words.length - 1].end : 0;
writeFileSync(meta, JSON.stringify({ text: v.text, voice_id: v.voice_id, model, duration, words }, null, 2));
console.log(`Готово: ${mp3}, ${duration.toFixed(1)} с, слов ${words.length}`);
