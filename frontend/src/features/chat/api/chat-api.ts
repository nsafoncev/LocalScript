import type { AxiosInstance } from 'axios'
import type {
  ChatApi,
  ChatRequestOptions,
  GenerateCodeRequest,
  GenerateCodeResponse,
} from './types'

export function createChatApi(client: AxiosInstance): ChatApi {
  return {
    async sendMessage(
      payload: GenerateCodeRequest,
      options?: ChatRequestOptions,
    ): Promise<GenerateCodeResponse> {
      try {
        const { data } = await client.post<GenerateCodeResponse>(
          '/chat',
          {
            session_id: payload.sessionId,
            message: payload.message,
            context: payload.context ?? '',
          },
          {
            signal: options?.signal,
          },
        )

        return data
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'ECONNABORTED'
        ) {
          throw new Error(
            'Генерация заняла слишком много времени. Попробуйте ещё раз или упростите запрос.',
          )
        }

        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'data' in error.response &&
          typeof error.response.data === 'object' &&
          error.response.data !== null &&
          'detail' in error.response.data &&
          typeof error.response.data.detail === 'string' &&
          error.response.data.detail.trim()
        ) {
          throw new Error(error.response.data.detail)
        }

        throw new Error(
          'Не удалось получить код от сервера. Проверьте, что backend доступен, и попробуйте ещё раз.',
        )
      }
    },
  }
}
