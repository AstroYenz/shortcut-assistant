/**
 * Handles messages from the React page script to content script
 * Sets up message listeners and provides handlers for React communication
 *
 * UNIFIED MESSAGE ROUTING:
 * This file consolidates ALL content script message handling to prevent conflicts:
 * - React AI streaming messages (react-ai-stream)
 * - Legacy AI processing messages (AiProcessMessage with status)
 * - General content script messages (update, state changes, etc.)
 *
 * Replaced listeners from:
 * - src/js/analyze/listeners.ts
 * - src/js/additional-content/content-script.ts
 * - src/js/content-scripts.ts
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
    else if (payload?.action === 'reactCallOpenAI') {
      handleMessageAction(
        () => handleReactCallOpenAI(payload.data.description, payload.data.type, payload.data.timestamp),
        'Failed to call OpenAI for React'
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
 * Handle React-specific OpenAI call - completely separate from legacy JS system
 */
async function handleReactCallOpenAI(description: string, type: 'analyze' | 'breakup', timestamp: number): Promise<{ success: boolean, message: string, error?: string, requestId?: string }> {
  try {
    return new Promise((resolve, reject) => {
      const requestId = `react-${type}-${timestamp}`

      // Send to React-specific service worker handler
      chrome.runtime.sendMessage({
        action: 'reactCallOpenAI',
        data: { prompt: description, type, requestId }
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Unknown error during React OpenAI call'))
          return
        }

        resolve({
          success: true,
          message: 'React OpenAI request initiated successfully',
          requestId,
          error: response?.error
        })
      })
    })
  }
  catch (error) {
    console.error('Error in handleReactCallOpenAI:', error)
    throw error
  }
}

// Flag to track if bridge is initialized
let isBridgeInitialized = false

// React-specific streaming results system - completely separate from legacy
const reactAIResultsListeners: ((message: ReactAIStreamMessage) => void)[] = []

interface ReactAIStreamMessage {
  type: 'react-ai-stream'
  requestId: string
  status: 'streaming' | 'completed' | 'error'
  content?: string
  error?: string
  analysisType: 'analyze' | 'breakup'
}

/**
 * Subscribe to React-specific AI streaming results
 */
function subscribeToReactAIResults(callback: (message: ReactAIStreamMessage) => void): () => void {
  reactAIResultsListeners.push(callback)
  return () => {
    const index = reactAIResultsListeners.indexOf(callback)
    if (index > -1) {
      reactAIResultsListeners.splice(index, 1)
    }
  }
}

// Expose globally for React components
(window as Window & { __subscribeToReactAIResults?: typeof subscribeToReactAIResults }).__subscribeToReactAIResults = subscribeToReactAIResults

/**
 * Handle React AI streaming results from service worker
 */
function handleReactAIStreamingResults(message: ReactAIStreamMessage): void {
  // Forward streaming results to React components only
  reactAIResultsListeners.forEach((callback) => {
    callback(message)
  })
}

/**
 * UNIFIED MESSAGE ROUTER
 * Consolidates all content script message handling in one place
 * Routes messages to appropriate handlers based on message type
 */
chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
  // ==================== REACT-SPECIFIC MESSAGES ====================

  // Handle React AI streaming results from service worker
  if (message.type === 'react-ai-stream') {
    handleReactAIStreamingResults(message as ReactAIStreamMessage)
    return true // Keep message channel open
  }

  // ==================== LEGACY AI MESSAGES ====================

  // Handle legacy AI processing messages (during transition period)
  if (message.status !== undefined) {
    const { AiProcessMessageType } = await import('@sx/analyze/types/AiProcessMessage')

    // Legacy AI analysis listener functionality
    if (message.status === AiProcessMessageType.updated
      || message.status === AiProcessMessageType.completed
      || message.status === AiProcessMessageType.failed) {
      // Handle legacy AI functions (buttons, UI updates)
      const { AiFunctions } = await import('@sx/analyze/ai-functions')
      const functions = new AiFunctions()
      await functions.processOpenAIResponse(message)

      // Handle legacy additional content population
      if (message.status === AiProcessMessageType.updated && message.data) {
        const { AdditionalContent } = await import('@sx/additional-content/content-script')
        AdditionalContent.populate(message.data.content)
      }

      return true
    }
  }

  // ==================== GENERAL CONTENT SCRIPT MESSAGES ====================

  // Handle general content script messages (update, state changes, etc.)
  if (message.message) {
    const { handleMessage } = await import('@sx/content-scripts')
    await handleMessage(message)
    return true
  }

  // ==================== UNHANDLED MESSAGES ====================

  // Return false for unhandled messages (allows other listeners to handle them)
  return false
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
  handleReactCallOpenAI,
  subscribeToReactAIResults
}
