#!/bin/sh

ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done

echo "Pulling model..."
i=1
while [ "$i" -le 5 ]; do
  ollama pull "${MODEL_NAME:-qwen2.5-coder:7b}" && break
  echo "Pull failed (attempt $i/5), retrying in 5s..."
  i=$((i + 1))
  sleep 5
done

if [ -n "$FAST_MODEL_NAME" ] && [ "$FAST_MODEL_NAME" != "${MODEL_NAME:-qwen2.5-coder:7b}" ]; then
  echo "Pulling fast model..."
  i=1
  while [ "$i" -le 5 ]; do
    ollama pull "$FAST_MODEL_NAME" && break
    echo "Fast model pull failed (attempt $i/5), retrying in 5s..."
    i=$((i + 1))
    sleep 5
  done
fi

echo "Ollama ready."
wait $OLLAMA_PID
