import type { AxiosInstance } from 'axios'
import type {
  ChatApi,
  ChatRequestOptions,
  GenerateCodeRequest,
  GenerateCodeResponse,
} from './types'

const GENERATE_ERROR_MESSAGE =
  'Не удалось получить код от сервера. Проверьте, что backend доступен, и попробуйте ещё раз.'

export function createChatApi(client: AxiosInstance): ChatApi {
  return {
    async sendMessage(
      payload: GenerateCodeRequest,
      options?: ChatRequestOptions,
    ): Promise<GenerateCodeResponse> {
      try {
        const { data } = await client.post<GenerateCodeResponse>(
          '/generate',
          payload,
          {
            signal: options?.signal,
          },
        )

        return data
      } catch {
        throw new Error(GENERATE_ERROR_MESSAGE)
      }
    },
  }
}
