#!/bin/sh

# Запускаем ollama сервер в фоне
ollama serve &
OLLAMA_PID=$!

# Ждём пока сервер поднимется
echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

# Скачиваем модель с retry (до 5 попыток)
echo "Pulling model..."
i=1
while [ $i -le 5 ]; do
  ollama pull qwen2.5-coder:3b-instruct-q4_K_M && break
  echo "Pull failed (attempt $i/5), retrying in 5s..."
  i=$((i + 1))
  sleep 5
done

echo "Ollama ready."

# Держим контейнер живым
wait $OLLAMA_PID
