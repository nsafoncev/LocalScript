import axios from 'axios'

export const httpClient = axios.create({
  baseURL: '/api',
  timeout: 1200,
  headers: {
    'Content-Type': 'application/json',
  },
})
