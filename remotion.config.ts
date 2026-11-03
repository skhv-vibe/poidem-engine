// Конфиг Remotion CLI (studio). Скрипты в scripts/ задают настройки рендера сами: renderer API этот файл не читает.
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setEntryPoint('src/index.ts');
