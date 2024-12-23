import Tab = chrome.tabs.Tab


export async function getActiveTab(): Promise<Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (chrome.runtime.lastError) {
    throw chrome.runtime.lastError
  }
  else if (tabs.length === 0) {
    throw new Error('No active tab found')
  }
  else {
    return tabs[0]
  }
}
