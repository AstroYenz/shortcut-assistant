import { Message, MessageResponse } from '@/client/types/message'


/**
 * Creates a message event listener that resolves the promise when a response is received
 * @param resolve - The resolve function from the promise
 * @returns A function that handles message events
 */
function createMessageListener<T>(resolve: (value: T) => void): MessageListenerWithCleanup {
  const listener = (function (event: MessageEvent): void {
    if (event.data?.type === 'FROM_CONTENT' && event.data.response) {
      if (listener.cleanup) {
        listener.cleanup()
      }
      resolve(event.data.response as T)
    }
  }) as MessageListenerWithCleanup

  return listener
}

/**
 * Sends a message to the content script and returns a promise that resolves to the response
 * @param message - The message to send to the content script
 * @returns A promise that resolves to the response from the content script
 */
function notifyContentScript<T>(message: Message<Record<string, unknown>>): Promise<T> {
  const RESPONSE_TIMEOUT_MS = 5000
  const MILLISECONDS_PER_SECOND = 1000

  function handlePromise(resolve: (value: T) => void, reject: (reason?: unknown) => void): void {
    const listener = createMessageListener<T>(resolve)
    window.addEventListener('message', listener)

    window.postMessage({ type: 'FROM_PAGE', message }, '*')

    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', listener)
      reject(new Error(`Content script response timeout: No response received for "${message.action}" after ${RESPONSE_TIMEOUT_MS / MILLISECONDS_PER_SECOND} seconds`))
    }, RESPONSE_TIMEOUT_MS)

    function cleanup(): void {
      clearTimeout(timeoutId)
      window.removeEventListener('message', listener)
    }

    listener.cleanup = cleanup
  }

  return new Promise<T>(handlePromise)
}

/**
 * Message listener with an optional cleanup function
 */
type MessageListenerWithCleanup = ((event: MessageEvent) => void) & {
  cleanup?: () => void
}


/**
 * Submits the Shortcut API token to be stored securely
 * Handles the same authentication flow as the legacy extension
 */
function submitShortcutApiToken(token: string): Promise<MessageResponse<{ message: string, error?: string }>> {
  return notifyContentScript<MessageResponse<{ message: string, error?: string }>>({
    action: 'submitShortcutApiToken',
    data: { token }
  })
}

/**
 * Initiates the Google OAuth flow
 * Returns a success response when authentication is complete
 */
function initiateGoogleOAuth(): Promise<MessageResponse<{ message: string, error?: string }>> {
  return notifyContentScript<MessageResponse<{ message: string, error?: string }>>({
    action: 'initiateGoogleOAuth',
    data: {}
  })
}

export { submitShortcutApiToken, initiateGoogleOAuth }
