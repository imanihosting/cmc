import { toast } from 'sonner'

interface ToastOptions {
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export const showSuccessToast = (title: string, description?: string, options?: ToastOptions) => {
  toast.success(title, {
    description,
    action: options?.action,
    duration: options?.duration || 3000,
  })
}

export const showErrorToast = (title: string, description?: string, options?: ToastOptions) => {
  toast.error(title, {
    description: description || 'Please try again later.',
    action: options?.action,
    duration: options?.duration || 5000,
  })
}

export const showLoadingToast = (title: string, description?: string) => {
  return toast.loading(title, {
    description,
    duration: Infinity, // Will stay until manually dismissed
  })
}

// Common success messages
export const SAVE_SUCCESS = 'Changes saved successfully'
export const BOOKING_SUCCESS = 'Booking confirmed successfully'
export const MESSAGE_SENT = 'Message sent successfully'
export const REVIEW_POSTED = 'Review posted successfully'

// Common error messages
export const SAVE_ERROR = 'Failed to save changes'
export const BOOKING_ERROR = 'Failed to process booking'
export const MESSAGE_ERROR = 'Failed to send message'
export const REVIEW_ERROR = 'Failed to post review'
export const NETWORK_ERROR = 'Network error occurred' 