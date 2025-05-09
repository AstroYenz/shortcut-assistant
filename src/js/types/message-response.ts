/**
 * Response from content script bridge operations
 */
export interface MessageResponse {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}
