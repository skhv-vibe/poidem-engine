// Шрифты бренда из @fontsource (OFL, с кириллицей), без внешних CDN. Рендер ждёт их загрузки.
import '@fontsource/dela-gothic-one/cyrillic-400.css';
import '@fontsource/dela-gothic-one/latin-400.css';
import '@fontsource/onest/cyrillic-500.css';
import '@fontsource/onest/cyrillic-600.css';
import '@fontsource/onest/latin-500.css';
import '@fontsource/onest/latin-600.css';
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
  ]).then(() => continueRender(handle), () => continueRender(handle));
}
