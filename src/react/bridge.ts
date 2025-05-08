import { MessageResponse } from '../js/types/message-response'

// Import the notifyContentScript utility from react-bridge
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifyContentScript<T>(message: unknown): Promise<T> {
  return new Promise((resolve) => {
    window.postMessage({ type: 'FROM_PAGE', message }, '*')

    const listener = (event: MessageEvent): void => {
      if (event.data?.type === 'FROM_CONTENT' && event.data.response) {
        window.removeEventListener('message', listener)
        resolve(event.data.response as T)
      }
    }

    window.addEventListener('message', listener)
  })
}

/**
 * Submits the Shortcut API token to be stored securely
 * Handles the same authentication flow as the legacy extension
 */
function submitShortcutApiToken(token: string): Promise<MessageResponse> {
  return notifyContentScript<MessageResponse>({
    action: 'submitShortcutApiToken',
    data: { token }
  })
}

/**
 * Initiates the Google OAuth flow
 * Returns a success response when authentication is complete
 */
function initiateGoogleOAuth(): Promise<MessageResponse> {
  return notifyContentScript<MessageResponse>({
    action: 'initiateGoogleOAuth',
    data: {}
  })
}

export { submitShortcutApiToken, initiateGoogleOAuth }
