import { getActiveTab } from './get-active-tab'


export async function getActiveTabUrl(): Promise<string | undefined> {
  const activeTab = await getActiveTab()
  return activeTab?.url
}
