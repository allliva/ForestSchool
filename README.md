# Лесная школа

Три адаптивные игры по русскому языку для детей 6–8 лет: словарные слова, слоги, построение предложений.

## Локальный запуск

```bash
npm install
npm run dev
```

Проверка production-сборки:

```bash
npm run build
npm run preview
```

Полная проверка:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

Подробное техническое задание находится в [GAME_SPEC.md](GAME_SPEC.md).

## Подготовка к GitHub Pages

Публикация на текущем этапе намеренно не настроена. Для будущего project site сборка запускается с `VITE_BASE_PATH=/имя-репозитория/`, после чего GitHub Actions публикует папку `dist`.
