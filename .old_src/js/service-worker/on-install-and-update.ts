import InstalledDetails = chrome.runtime.InstalledDetails


class InstallAndUpdate {
  // eslint-disable-next-line @typescript-eslint/require-await
  static async onInstall(): Promise<void> {
    chrome.windows.create({
      url: '../html/installed.html',
      type: 'popup',
      width: 310,
      height: 500
    })
    chrome.storage.sync.set({ enableTodoistOptions: false }).catch((e) => {
      console.error('Error setting enableTodoistOptions:', e)
    })
  }

  static async onUpdate(): Promise<void> {
    await chrome.action.setBadgeText({ text: ' ' })
    await chrome.action.setBadgeBackgroundColor({ color: '#a30000' })
  }
}


function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version)
}

function onInstallAndUpdate(details: InstalledDetails): void {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    InstallAndUpdate.onInstall()
  }
  else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const changelogVersion = process.env.CHANGELOG_VERSION
    const currentVersion = process.env.VERSION

    if (isValidVersion(changelogVersion!) && changelogVersion === currentVersion) {
      InstallAndUpdate.onUpdate().catch((e) => {
        console.error('Error updating:', e)
      })
    }
  }
}

export { InstallAndUpdate, onInstallAndUpdate }
