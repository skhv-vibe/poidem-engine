// Проверка заказа promo.yaml: схема, файлы, длина клипов.
import { checkOrder, resolveOrder } from './lib/order.ts';

const arg = process.argv.slice(2).find((a) => a !== '--');
if (!arg || arg === '--help') {
  console.log(`Проверяет заказ promo.yaml по схеме schema/promo.schema.json и наличие файлов.

Использование:
  pnpm run validate -- <папка ролика | promo.yaml | имя ролика в $POIDEM_CONTENT/reels>

Код 1 при ошибках. Предупреждения (короткий клип, запросы к движку) код не меняют.`);
  process.exit(arg ? 0 : 1);
}
const found = resolveOrder(arg);
if (!found) {
  console.error(`Заказ не найден: ${arg}`);
  process.exit(1);
}
const { errors, warnings } = checkOrder(found.file);
for (const e of errors) console.log(`ошибка: ${e}`);
for (const w of warnings) console.log(`внимание: ${w}`);
console.log(errors.length ? `Заказ не прошёл: ${found.file}` : `Заказ в порядке: ${found.file}`);
process.exit(errors.length ? 1 : 0);
