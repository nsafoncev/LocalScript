# Chat Feature

## Описание функционала

Фича `chat` отвечает за сценарий ввода сообщения, показа пустого состояния, отображения сообщений и получения ответа ассистента с backend API.

## Цель

- сохранить пустую историю при первом открытии приложения
- не создавать стартовый чат автоматически
- перевести layout из центрированного режима в обычный только после первого сообщения
- аккуратно показать ответы ассистента с кодом и поддержать копирование

## FSD-слой

`features/chat`

## Структура

- `api/`
  - `chat-api.ts` — запрос к backend через `axios`
  - `types.ts` — типы `GenerateCodeRequest`, `GenerateCodeResponse`, `ChatApi`
- `model/`
  - `chat-reducer.ts` — состояние одной сессии чата
  - `chat-sessions-reducer.ts` — состояние всех сессий
- `ui/`
  - `chat-panel/` — основной контейнер чата
  - `chat-input/` — поле ввода и отправка сообщения
  - `chat-loading/` — индикатор ожидания
  - `chat-empty-state/` — минималистичное пустое состояние

## Пример использования

```ts
const response = await chatApi.sendMessage({
  prompt: 'Функция factorial(n) для n >= 0',
})

const assistantMessage = createChatMessage('assistant', response.code)
```

## Ограничения

- backend-контракт для этой фичи ограничен endpoint `POST /generate`
- состояние списка чатов по-прежнему локальное внутри frontend
- markdown-рендеринг и копирование вынесены в `shared`, чтобы не смешивать UI чата и вспомогательную логику
