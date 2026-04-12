import axios from 'axios'

const API_TIMEOUT = 600000

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})
