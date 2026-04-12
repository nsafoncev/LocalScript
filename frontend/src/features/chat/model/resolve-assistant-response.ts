import {
  detectMessageFormat,
  extractCodeText,
  type MessageFormat,
} from '../../../shared/lib/message-format'
import type { GenerateCodeResponse } from '../api'

export interface ResolvedAssistantResponse {
  readonly text: string
  readonly format: MessageFormat
}

function resolveExplicitFormat(
  response: GenerateCodeResponse,
): MessageFormat | null {
  return response.format ?? response.type ?? null
}

function resolveRawText(response: GenerateCodeResponse): string {
  if (typeof response.code === 'string') {
    return extractCodeText(response.code)
  }

  return response.message ?? response.text ?? response.content ?? ''
}

export function resolveAssistantResponse(
  response: GenerateCodeResponse,
): ResolvedAssistantResponse {
  const text = resolveRawText(response)
  const explicitFormat = resolveExplicitFormat(response)
  const format =
    explicitFormat ?? (typeof response.code === 'string'
      ? 'code'
      : detectMessageFormat(text))

  return {
    text: format === 'code' ? extractCodeText(text) : text.trim(),
    format,
  }
}
