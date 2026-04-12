# Message Content

## Описание функционала

`shared/ui/message-content` отвечает за типизированный рендеринг сообщений ассистента в markdown-формате и умеет отдельно отображать code-only ответы без лишнего текста.

## Цель

Сделать ответы AI-чата визуально ближе к современным AI-интерфейсам без тяжёлых зависимостей и с явным различением обычного текста и code-only сообщений.

## FSD-слой

`shared/ui`

## Структура

- `MessageContent.tsx` — UI-компонент рендеринга текста и кода
- `MessageContent.module.scss` — локальные стили для абзацев и inline code
- `../CodeBlock.tsx` — отдельный shared UI для code-only ответа и кнопки копирования кода
- `../../lib/markdown/`
  - `normalize-assistant-markdown.ts` — нормализация markdown-текста
  - `parse-markdown.ts` — небольшой парсер fenced code block, inline code и переносов строк
  - `types.ts` — типы markdown-узлов
  - `../../lib/message-format/` — определение формата сообщения на этапе model/api

## Пример использования

```ts
<MessageContent
  format={message.format}
  text={message.text}
  theme={theme}
/>
```

## Ограничения

- Поддерживаются fenced code block, inline code и переносы строк
- Полный Markdown-спектр намеренно не реализован
- Внешняя библиотека не добавлялась, чтобы не утяжелять frontend ради ограниченного набора сценариев
- Если сообщение уже типизировано как `code`, оно рендерится только как code block
