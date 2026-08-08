# Локальный запуск «Лесной школы»

## Windows PowerShell

Откройте PowerShell и перейдите в проект через канонический путь `N:`. Это важно: при запуске через `C:\Projects\ForestLife` Vite/Vitest может разрешать модули через `N:\ForestLife` и получать конфликт путей.

```powershell
Set-Location N:\ForestLife
```

Если зависимости ещё не установлены:

```powershell
npm ci
```

Запустите локальный сервер:

```powershell
npm run dev -- --host 127.0.0.1
```

Откройте в браузере:

```text
http://127.0.0.1:5173
```

Для остановки сервера нажмите `Ctrl+C` в том же окне PowerShell.

## Проверки перед сборкой

Команды выполняются из `N:\ForestLife`:

```powershell
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright автоматически проверяет desktop и мобильный профиль Pixel 7. Если порт `5173` уже занят локальным Vite-сервером, Playwright использует работающий сервер.
