// Шрифты из @fontsource (OFL, с кириллицей), без внешних CDN. Рендер ждёт их загрузки.
// Бренд: Dela Gothic One и Onest. Oswald, Caveat, Unbounded — пробные для вариантов субтитров (2026-11-03).
import '@fontsource/dela-gothic-one/cyrillic-400.css';
import '@fontsource/dela-gothic-one/latin-400.css';
import '@fontsource/onest/cyrillic-500.css';
import '@fontsource/onest/cyrillic-600.css';
import '@fontsource/onest/latin-500.css';
import '@fontsource/onest/latin-600.css';
import '@fontsource/oswald/cyrillic-700.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/caveat/cyrillic-700.css';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/unbounded/cyrillic-400.css';
import '@fontsource/unbounded/cyrillic-800.css';
import '@fontsource/unbounded/latin-800.css';
import { continueRender, delayRender } from 'remotion';

let started = false;
export function waitForFonts() {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Шрифты бренда');
  Promise.all([
    document.fonts.load("400 100px 'Dela Gothic One'", 'пойдём'),
    document.fonts.load("500 40px 'Onest'", 'пойдём'),
    document.fonts.load("600 40px 'Onest'", 'пойдём'),
    document.fonts.load("700 40px 'Oswald'", 'пойдём'),
    document.fonts.load("700 40px 'Caveat'", 'пойдём'),
    document.fonts.load("400 40px 'Unbounded'", 'пойдём'),
    document.fonts.load("800 40px 'Unbounded'", 'пойдём'),
  ]).then(() => continueRender(handle), () => continueRender(handle));
}
