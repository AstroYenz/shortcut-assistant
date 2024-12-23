const SESSION_EXPIRATION_IN_MIN = 30

export async function getOrCreateSessionId(): Promise<string> {
  let { sessionData } = await chrome.storage.session.get('sessionData')
  // Check if session exists and is still valid
  const currentTimeInMs = Date.now()
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const millisecondsPerMinute = 60000
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / millisecondsPerMinute
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Delete old session id to start a new session
      sessionData = null
    }
    else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs
      await chrome.storage.session.set({ sessionData })
    }
  }
  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    }
    await chrome.storage.session.set({ sessionData })
  }
  return sessionData.session_id
}
