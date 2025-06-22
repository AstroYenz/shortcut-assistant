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

    // Handle different actions based on the payload action
    if (payload?.action === 'submitShortcutApiToken') {
      handleMessageAction(
        () => handleSubmitShortcutApiToken(payload.data.token),
        'Failed to submit API token'
      )
    }
    else if (payload?.action === 'initiateGoogleOAuth') {
      handleMessageAction(
        () => handleInitiateGoogleOAuth(),
        'Failed to authenticate with Google'
      )
    }
    else if (payload?.action === 'callOpenAI') {
      handleMessageAction(
        () => handleCallOpenAI(payload.data.description, payload.data.type),
        'Failed to call OpenAI'
      )
    }

    // Other action handlers can be added here
  })

  /**
   * Handles a message action with standardized promise resolution and error handling
   */
  function handleMessageAction(
    actionHandler: () => Promise<{ success: boolean, message: string, error?: string }>,
    defaultErrorMessage: string
  ): void {
    actionHandler()
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
            error: error.message || defaultErrorMessage
          }
        }, '*')
      })
  }
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
          // Provide more specific error messages based on common OAuth errors
          const errorMessage = chrome.runtime.lastError.message || ''
          if (errorMessage.includes('user_cancelled')) {
            reject(new Error('Authentication was cancelled by the user'))
          }
          else if (errorMessage.includes('access_denied')) {
            reject(new Error('Access was denied. Please grant the required permissions'))
          }
          else {
            reject(new Error(chrome.runtime.lastError.message || 'Unknown error during Google authentication'))
          }
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
 * Handle OpenAI call using existing AI functionality - matches legacy exactly
 */
async function handleCallOpenAI(description: string, type: 'analyze' | 'breakup'): Promise<{ success: boolean, message: string, error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      // Send the exact same message format as the legacy JS functions
      chrome.runtime.sendMessage({
        action: 'callOpenAI',
        data: { prompt: description, type }
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Unknown error during OpenAI call'))
          return
        }

        // The callOpenAI returns immediately, results come via onMessage listener
        resolve({
          success: true,
          message: 'OpenAI request initiated successfully',
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleCallOpenAI:', error)
    throw error
  }
}

// Flag to track if bridge is initialized
let isBridgeInitialized = false

// Store for AI streaming results - components can subscribe to this
const aiResultsListeners: ((message: any) => void)[] = []

/**
 * Subscribe to AI streaming results
 */
function subscribeToAIResults(callback: (message: any) => void): () => void {
  aiResultsListeners.push(callback)
  return () => {
    const index = aiResultsListeners.indexOf(callback)
    if (index > -1) {
      aiResultsListeners.splice(index, 1)
    }
  }
}

// Expose globally for React components
(window as any).__subscribeToAIResults = subscribeToAIResults

/**
 * Handle AI streaming results from service worker
 */
function handleAIStreamingResults(message: any): void {
  // Forward streaming results to all subscribed React components
  aiResultsListeners.forEach(callback => callback(message))
}

// Listen for AI streaming results from service worker
chrome.runtime.onMessage.addListener((message) => {
  // Check if this is an AI process message
  if (message.status !== undefined && (message.status === 0 || message.status === 1 || message.status === 2)) {
    handleAIStreamingResults(message)
  }
})

/**
 * Initialize React components and set up message listeners
 */
function initializeReactBridge(): void {
  try {
    // Prevent duplicate initialization
    if (isBridgeInitialized) {
      return
    }

    // Set up the message listener
    setupReactMessageListener()

    // Initialize React components
    import('./index')
      .then(({ initReact }) => {
        try {
          initReact()
          isBridgeInitialized = true
        }
        catch (error) {
          console.error(error as Error)
        }
      })
      .catch((err) => {
        console.error(err as Error)
      })
  }
  catch (e) {
    console.error(e as Error)
  }
}

/**
 * Clean up React components
 */
function cleanupReactBridge(): void {
  if (!isBridgeInitialized) return

  import('./index').then(({ unmountReact }) => {
    unmountReact()
    isBridgeInitialized = false
  }).catch((err) => {
    console.error(err as Error)
  })
}

export {
  initializeReactBridge,
  cleanupReactBridge,
  setupReactMessageListener,
  handleSubmitShortcutApiToken,
  handleInitiateGoogleOAuth,
  handleCallOpenAI,
  subscribeToAIResults
}
