import { logError } from '@sx/utils/log-error'

/**
 * Handles messages from the React page script to content script
 * Sets up message listeners and provides handlers for React communication
 */
function setupReactMessageListener(): void {
  // Listen for messages from the page script (React)
  window.addEventListener('message', (event) => {
    // Only accept messages from the same frame
    if (event.source !== window) return

    // Check if the message is from the page script
    const message = event.data
    if (message?.type !== 'FROM_PAGE') return

    const payload = message.message

    // Handle different actions
    if (payload?.action === 'submitShortcutApiToken') {
      handleSubmitShortcutApiToken(payload.data.token)
        .then((response) => {
          window.postMessage({
            type: 'FROM_CONTENT',
            response
          }, '*')
        })
        .catch((error) => {
          window.postMessage({
            type: 'FROM_CONTENT',
            response: {
              success: false,
              error: error.message || 'Failed to submit API token'
            }
          }, '*')
        })
    }
    if (payload?.action === 'initiateGoogleOAuth') {
      handleInitiateGoogleOAuth()
        .then((response) => {
          window.postMessage({
            type: 'FROM_CONTENT',
            response
          }, '*')
        })
        .catch((error) => {
          window.postMessage({
            type: 'FROM_CONTENT',
            response: {
              success: false,
              error: error.message || 'Failed to authenticate with Google'
            }
          }, '*')
        })
    }

    // Other action handlers can be added here
  })
}

/**
 * Handle Shortcut API token submission
 */
async function handleSubmitShortcutApiToken(token: string): Promise<{ success: boolean, message: string, error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      // Send the token to the service worker instead of handling auth here
      chrome.runtime.sendMessage({
        action: 'processShortcutApiToken',
        data: { shortcutToken: token }
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        resolve({
          success: response?.success ?? true,
          message: response?.message || 'Token submitted successfully',
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleSubmitShortcutApiToken:', error)
    throw error
  }
}

/**
 * Handle Google OAuth authentication
 */
async function handleInitiateGoogleOAuth(): Promise<{ success: boolean, message: string, error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'initiateGoogleOAuth'
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        resolve({
          success: response?.success ?? true,
          message: response?.message || 'Google authentication successful',
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleInitiateGoogleOAuth:', error)
    throw error
  }
}

/**
 * Initialize React components and set up message listeners
 */
function initializeReactBridge(): void {
  try {
    // Set up the message listener
    setupReactMessageListener()

    // Initialize React components
    import('./index').then(({ initReact }) => {
      initReact()
    }).catch((err) => {
      logError(err as Error)
    })
  }
  catch (e) {
    logError(e as Error)
  }
}

/**
 * Clean up React components
 */
function cleanupReactBridge(): void {
  import('./index').then(({ unmountReact }) => {
    unmountReact()
  }).catch((err) => {
    logError(err as Error)
  })
}

export {
  initializeReactBridge,
  cleanupReactBridge,
  setupReactMessageListener,
  handleSubmitShortcutApiToken,
  handleInitiateGoogleOAuth
}
