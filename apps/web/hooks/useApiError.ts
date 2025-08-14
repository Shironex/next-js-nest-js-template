import { ApiErrorResponse } from '@/types/api'
import { AxiosError } from 'axios'
import { toast } from 'sonner' // or your toast library

export function useApiError() {
  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse

      if (apiError?.errors) {
        // Multiple validation errors
        apiError.errors.forEach((err) => {
          const title = err.field !== 'unknown' ? err.field : 'Unknown field'
          toast.error(title, {
            description: err.message,
          })
        })
      } else if (apiError?.message) {
        // Single error message
        toast.error(apiError.message)
      } else {
        // Fallback error
        toast.error('An unexpected error occurred')
      }
    } else {
      // Non-Axios error
      toast.error('An unexpected error occurred')
    }
  }

  return { handleError }
}
