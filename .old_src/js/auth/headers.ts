interface BackendHeaders {
  [key: string]: string
  'Content-Type': string
  'Authorization': string
}

async function getHeaders(): Promise<BackendHeaders> {
  const storage = await chrome.storage.local.get('backendKey')
  return {
    'Content-Type': 'application/json',
    'Authorization': storage.backendKey
  }
}

export default getHeaders
export type { BackendHeaders }
