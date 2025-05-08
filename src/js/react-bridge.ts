import { MessageResponse } from './types/message-response'

/**
 * Initialize React components
 */
export function initializeReact(): void {
  // Dynamically import React code
  import('../react').then(({ initReact }) => {
    initReact()
  }).catch(console.error)
}

/**
 * Clean up React components
 */
export function cleanupReact(): void {
  import('../react').then(({ unmountReact }) => {
    unmountReact()
  }).catch(console.error)
}

/**
 * Bridge for React components to interact with Chrome extension APIs
 */

// Notify content script
function notifyContentScript<T>(message: unknown): Promise<T> {
  return new Promise((resolve) => {
    window.postMessage({ type: 'FROM_PAGE', message }, '*')

    const listener = (event: MessageEvent): void => {
      if (event.data?.type === 'FROM_CONTENT' && event.data.response) {
        window.removeEventListener('message', listener)
        resolve(event.data.response as T)
      }
    }
wa
    window.addEventListener('message', listener)
  })
}

/**
 * Submits the Shortcut API token to be stored securely
 * Handles the same authentication flow as the legacy extension
 */
export function submitShortcutApiToken(token: string): Promise<MessageResponse> {
  return notifyContentScript<MessageResponse>({
    action: 'submitShortcutApiToken',
    data: { token }
  })
}
