interface AuthStatus {
  isAuthenticated: boolean
  hasGoogleAuth: boolean
  hasShortcutToken: boolean
}


/**
 * Checks if the user has completed authentication for AI features
 * Requires both Google authentication and Shortcut API token
 * @returns Promise resolving to authentication status
 */
async function checkAuthentication(): Promise<AuthStatus> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tempGoogleToken', 'backendKey'], (data) => {
      const hasGoogleAuth = Boolean(data.tempGoogleToken || data.backendKey)
      const hasShortcutToken = Boolean(data.backendKey)
      const isAuthenticated = hasGoogleAuth && hasShortcutToken

      resolve({
        isAuthenticated,
        hasGoogleAuth,
        hasShortcutToken
      })
    })
  })
}


export { checkAuthentication }
export type { AuthStatus }
