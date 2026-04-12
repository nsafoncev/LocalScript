# Message Content

## Описание функционала

`shared/ui/message-content` отвечает за типизированный рендеринг текста сообщения ассистента в markdown-подобном формате и за аккуратное отображение блоков кода.

## Цель

Сделать ответы AI-чата визуально ближе к современным AI-интерфейсам без тяжёлых зависимостей и без изменения текущей message model.

## FSD-слой

`shared/ui`

## Структура

- `MessageContent.tsx` — UI-компонент рендеринга текста и кода
- `MessageContent.module.scss` — локальные стили для абзацев, inline code и code block
- `../../lib/markdown/`
  - `normalize-assistant-markdown.ts` — нормализация ответа ассистента и определение кода
  - `parse-markdown.ts` — небольшой парсер fenced code block, inline code и переносов строк
  - `types.ts` — типы markdown-узлов

## Пример использования

```ts
<MessageContent text={message.text} />
```

## Ограничения

- Поддерживаются fenced code block, inline code и переносы строк
- Полный Markdown-спектр намеренно не реализован
- Внешняя библиотека не добавлялась, чтобы не утяжелять frontend ради ограниченного набора сценариев
