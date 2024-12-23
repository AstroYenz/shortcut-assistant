import { handleCommands } from '@sx/service-worker/handlers'
import checkHost from '@sx/utils/check-host'
import { Story } from '@sx/utils/story'
import Workspace from '@sx/workspace/workspace'

import { onInstallAndUpdate } from './on-install-and-update'
import { SlugManager } from './slug-manager'


chrome.commands.onCommand.addListener(handleCommands)

chrome.runtime.onInstalled.addListener(onInstallAndUpdate)

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  if (changeInfo.url && checkHost(changeInfo.url) && changeInfo.url.includes('story')) {
    Workspace.activate()

    SlugManager.refreshCompanySlug(tabId, changeInfo)
    chrome.tabs.sendMessage(tabId, {
      message: 'update',
      url: changeInfo.url
    })
    chrome.tabs.sendMessage(tabId, {
      message: 'initNotes',
      data: await Story.notes(),
      url: changeInfo.url
    })
  }
}
)
