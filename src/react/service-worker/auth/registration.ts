async function registerUser(googleToken: string, shortcutToken: string, options?: { signal?: AbortSignal }): Promise<void> {
  const url = `${process.env.PROXY_URL}/users/register`

  // Create AbortController for timeout
  const TIMEOUT_MS = 30000 // 30 second timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, TIMEOUT_MS)

  // Use the provided signal or the timeout controller's signal
  const signal = options?.signal || controller.signal

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': shortcutToken
      },
      body: JSON.stringify({
        shortcutApiToken: shortcutToken,
        googleAuthToken: googleToken,
      }),
      signal
    })

    // Clear the timeout since request completed
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`)
    }
    const data = await response.json()
    await chrome.storage.local.set({ backendKey: data.key })

    // Clear the temporary Google token after successful registration
    await chrome.storage.local.remove('tempGoogleToken')
  }
  catch (error: unknown) {
    // Clear the timeout in case of error
    clearTimeout(timeoutId)

    // Check if this was a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds')
    }

    // Re-throw other errors
    throw error
  }
}

export { registerUser }
