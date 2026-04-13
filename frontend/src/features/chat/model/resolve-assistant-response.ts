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

function unwrapBackendCodePayload(code: string): string {
  const trimmedCode = code.trim()

  if (!trimmedCode.startsWith('{') || !trimmedCode.endsWith('}')) {
    return code
  }

  try {
    const parsed = JSON.parse(trimmedCode) as Record<string, unknown>
    const values = Object.values(parsed)

    if (values.length === 1 && typeof values[0] === 'string') {
      return values[0]
    }

    return JSON.stringify(parsed, null, 2)
  } catch {
    return code
  }
}

function resolveRawText(response: GenerateCodeResponse): string {
  if (response.status === 'needs_clarification') {
    return response.message ?? response.text ?? response.content ?? ''
  }

  if (typeof response.code === 'string') {
    return extractCodeText(unwrapBackendCodePayload(response.code))
  }

  return response.message ?? response.text ?? response.content ?? ''
}

export function resolveAssistantResponse(
  response: GenerateCodeResponse,
): ResolvedAssistantResponse {
  const text = resolveRawText(response)
  const explicitFormat = resolveExplicitFormat(response)
  const format =
    explicitFormat ?? (response.status === 'needs_clarification'
      ? 'text'
      : typeof response.code === 'string'
        ? 'code'
        : detectMessageFormat(text))

  return {
    text: format === 'code' ? extractCodeText(text) : text.trim(),
    format,
  }
}
