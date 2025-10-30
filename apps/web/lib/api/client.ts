import axios, { AxiosError, AxiosInstance } from 'axios'
import { ApiErrorResponse } from '@/types/api'

class ApiClient {
  private client: AxiosInstance | null = null
  private apiUrl: string

  constructor() {
    this.apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1`
    this.initializeClient()
  }

  private initializeClient() {
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    if (!this.client) return

    // Response interceptor for handling errors and unwrapping data
    this.client.interceptors.response.use(
      (response) => {
        // Unwrap nested API response structure globally
        if (
          response.data &&
          typeof response.data === 'object' &&
          'success' in response.data &&
          'data' in response.data &&
          response.data.success
        ) {
          // Transform response.data.data to response.data
          // Keep original response for debugging if needed
          return {
            ...response,
            data: response.data.data,
            _original: response.data,
          }
        }
        return response
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        // Handle 401 Unauthorized - session expired
        if (error.response?.status === 401) {
          // Don't redirect if already on auth pages
          const pathname = window.location.pathname
          const isAuthPage = pathname.startsWith('/auth')

          if (!isAuthPage) {
            // Clear any client-side auth state and redirect to login
            window.location.href = '/auth/login?expired=true'
          }
        }

        return Promise.reject(error)
      },
    )
  }

  public getInstance() {
    if (!this.client) {
      this.initializeClient()
    }
    return this.client!
  }
}

export const apiClient = new ApiClient()
export const api = apiClient.getInstance()
