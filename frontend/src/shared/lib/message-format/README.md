# Message Format

## Описание функционала

`shared/lib/message-format` определяет, нужно ли показывать ответ как обычный текст или как code-only сообщение, и умеет извлекать чистый код из fenced markdown.

## Цель

- убрать эвристику из UI-компонентов
- дать типизированную модель для различения `text` и `code`
- переиспользовать одну утилиту в API/model/UI-слоях

## FSD-слой

`shared/lib`

## Структура

- `types.ts` — тип `MessageFormat`
- `detect-message-format.ts` — определение формата и извлечение кода
- `index.ts` — публичный API

## Пример использования

```ts
const format = detectMessageFormat(responseText)
const code = extractCodeText('```ts\nconst answer = 42\n```')
```

## Ограничения

- эвристика не пытается распознавать весь Markdown-спектр
- окончательный приоритет остаётся за явным `format/type` от backend, если он появится
