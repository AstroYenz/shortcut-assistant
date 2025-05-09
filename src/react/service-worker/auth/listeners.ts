import IpcRequest from '@sx/types/ipc-request'

import { registerUser } from '@/service-worker/auth/registration'


chrome.runtime.onMessage.addListener((request: IpcRequest, sender, sendResponse) => {
  // Handle the processShortcutApiToken action from content script
  if (request.action === 'processShortcutApiToken') {
    handleProcessShortcutApiToken(request.data.shortcutToken, sendResponse)
    return true // Keep message channel open for async response
  }

  // Handle the initiateGoogleOAuth action from content script
  if (request.action === 'initiateGoogleOAuth') {
    handleInitiateGoogleOAuth(sendResponse)
    return true // Keep message channel open for async response
  }
})

/**
 * Process the Shortcut API token by getting the Google auth token
 * and then registering the user with both tokens
 */
function handleProcessShortcutApiToken(shortcutToken: string, sendResponse: (response?: { success: boolean, message?: string, error?: string }) => void): void {
  try {
    // First try to get the temporary Google token from storage
    chrome.storage.local.get('tempGoogleToken', (data) => {
      const tempGoogleToken = data.tempGoogleToken

      if (tempGoogleToken) {
        // If we have a temporary Google token, use it
        registerUser(tempGoogleToken, shortcutToken)
          .then(() => {
            sendResponse({
              success: true,
              message: 'Token submitted successfully'
            })
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: error.message || 'Failed to register user'
            })
          })
      }
      else {
        // Fall back to requesting a new Google token if no temporary token exists
        chrome.identity.getAuthToken({ interactive: true }, (googleToken) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message
            })
            return
          }

          if (!googleToken) {
            sendResponse({
              success: false,
              error: 'No token received'
            })
            return
          }

          // Register the user with both tokens
          registerUser(googleToken, shortcutToken)
            .then(() => {
              sendResponse({
                success: true,
                message: 'Token submitted successfully'
              })
            })
            .catch((error) => {
              sendResponse({
                success: false,
                error: error.message || 'Failed to register user'
              })
            })
        })
      }
    })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    sendResponse({
      success: false,
      error: errorMessage
    })
  }
}

/**
 * Handles initiating the Google OAuth flow
 * Gets the Google auth token and stores it temporarily for later use
 */
function handleInitiateGoogleOAuth(sendResponse: (response?: { success: boolean, message?: string, error?: string }) => void): void {
  try {
    chrome.identity.getAuthToken({ interactive: true }, (googleToken) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message
        })
        return
      }

      if (!googleToken) {
        sendResponse({
          success: false,
          error: 'No token received'
        })
        return
      }

      // Store the Google token temporarily
      chrome.storage.local.set({ tempGoogleToken: googleToken })
        .then(() => {
          sendResponse({
            success: true,
            message: 'Google authentication successful'
          })
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : String(error)
          sendResponse({
            success: false,
            error: errorMessage || 'Failed to store Google token'
          })
        })
    })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    sendResponse({
      success: false,
      error: errorMessage
    })
  }
}

export { handleProcessShortcutApiToken, handleInitiateGoogleOAuth }
