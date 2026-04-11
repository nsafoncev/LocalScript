# Frontend

Frontend-приложение на `React + Vite + TypeScript` для чата LocalScript.

## Что умеет

- отправляет пользовательский `prompt` в backend через `POST /generate`
- показывает `loading` во время запроса
- отображает `code` из ответа backend как сообщение ассистента
- показывает ошибку на русском языке, если backend недоступен

## Переменные окружения

Скопируйте `.env.example` в `.env`, если хотите переопределить настройки локально.

```env
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_API_BASE_URL=
```

### Назначение переменных

- `VITE_API_PROXY_TARGET` — куда Vite proxy перенаправляет запросы `/generate` в dev-режиме
- `VITE_API_BASE_URL` — базовый URL для `axios`; по умолчанию пустой, чтобы frontend использовал относительный путь

## Запуск в dev

1. Установите зависимости:

```bash
npm install
```

2. Убедитесь, что backend доступен.

Для локального запуска по OpenAPI-контракту по умолчанию ожидается:

```text
http://localhost:8080
```

3. Запустите frontend:

```bash
npm run dev
```

Vite proxy будет отправлять запросы `/generate` на адрес из `VITE_API_PROXY_TARGET`.

## Запуск с Docker

Если backend в вашем окружении доступен не на `8080`, а на другом адресе или порте, задайте это в `.env`.

Пример для текущего `docker-compose.yaml`, где backend опубликован на `8000`:

```env
VITE_API_PROXY_TARGET=http://localhost:8000
```

После этого запустите frontend обычной командой:

```bash
npm run dev
```

## Проверка

```bash
npm test
npm run build
```
