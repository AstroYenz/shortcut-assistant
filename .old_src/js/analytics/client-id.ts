import { v4 as uuidv4 } from 'uuid'


export async function getOrCreateClientId(): Promise<string> {
  const result = await chrome.storage.sync.get('clientId')
  let clientId: string = result.clientId
  if (!clientId) {
    clientId = uuidv4()
    await chrome.storage.sync.set({ clientId })
  }
  return clientId
}
