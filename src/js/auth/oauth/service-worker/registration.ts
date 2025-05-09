async function registerUser(googleToken: string, shortcutToken: string): Promise<void> {
  const url = `${process.env.PROXY_URL}/users/register`
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
  })
  if (!response.ok) {
    throw new Error(`HTTP error. Status: ${response.status}`)
  }
  const data = await response.json()
  await chrome.storage.local.set({ backendKey: data.key })

  // Clear the temporary Google token after successful registration
  await chrome.storage.local.remove('tempGoogleToken')
}

export default registerUser
