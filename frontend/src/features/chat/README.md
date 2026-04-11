# Chat Feature

## Описание функционала

Фича `chat` отвечает за пользовательский сценарий отправки сообщения и получения ответа ассистента с backend API.

## Цель

Убрать временную mock-генерацию ответа и подключить реальный endpoint `POST /generate`, не смешивая UI, model и API-слой.

## FSD-слой

`features/chat`

## Структура

- `api/`
  - `chat-api.ts` — запрос к backend через `axios`
  - `types.ts` — типы `GenerateCodeRequest`, `GenerateCodeResponse`, `ChatApi`
- `model/`
  - `chat-reducer.ts` — состояние отдельной сессии чата
  - `chat-sessions-reducer.ts` — состояние всех сессий
- `ui/`
  - `chat-panel/` — контейнер чата
  - `chat-input/` — ввод и отправка сообщения
  - `chat-loading/` — индикатор загрузки
  - `chat-empty-state/` — пустое состояние

## Пример использования

```ts
const response = await chatApi.sendMessage({
  prompt: 'Функция factorial(n) для n >= 0',
})

const assistantMessage = createChatMessage('assistant', response.code)
```

## Dev и Docker

- Frontend отправляет запрос по относительному пути `/generate`
- В dev-режиме Vite proxy перенаправляет `/generate` на `http://localhost:8080`
- При необходимости target proxy можно переопределить через `VITE_API_PROXY_TARGET`
- В production или Docker frontend может работать через тот же относительный путь без хардкода backend URL в компонентах

## Ограничения

- Backend-контракт для этой фичи ограничен endpoint `POST /generate`
- Список чатов пока остаётся локальным mock, потому что отдельный backend-контракт для него не предоставлен
- Fallback на mock-генерацию ответа удалён и больше не используется
