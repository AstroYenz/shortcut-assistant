import 'jest-chrome'

import {
  InstallAndUpdate,
  onInstallAndUpdate
} from '@sx/service-worker/on-install-and-update'


jest.mock('@sx/constants', () => ({
  CHANGELOG_VERSION: '1.0.0'
}))


describe('InstallAndUpdate class', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Explicitly mock Chrome API methods as Jest mocks
    chrome.windows.create = jest.fn().mockResolvedValue(undefined)
    chrome.storage.sync.set = jest.fn().mockResolvedValue(undefined)
    chrome.action.setBadgeText = jest.fn().mockResolvedValue(undefined)
    chrome.action.setBadgeBackgroundColor = jest.fn().mockResolvedValue(undefined)
  })

  describe('onInstall', () => {
    test('should open the installed page and set default options', async () => {
      await InstallAndUpdate.onInstall()

      expect(chrome.windows.create).toHaveBeenCalledWith({
        url: '../html/installed.html',
        type: 'popup',
        width: 310,
        height: 500
      })
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enableTodoistOptions: false })
    })

    it('should log error if setting default options fails', async () => {
      const error = new Error('Failed to set storage')
      const setMock = chrome.storage.sync.set as jest.Mock // Cast as Jest mock to use mockRejectedValueOnce
      setMock.mockRejectedValueOnce(error)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      await InstallAndUpdate.onInstall()

      expect(consoleSpy).toHaveBeenCalledWith('Error setting enableTodoistOptions:', error)

      consoleSpy.mockRestore()
    })
  })

  it('should set badge text and color', async () => {
    await InstallAndUpdate.onUpdate()

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: ' ' })
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#a30000' })
  })
})

describe('onInstallAndUpdate function', () => {
  const OnInstalledReason = {
    INSTALL: 'install',
    UPDATE: 'update',
    CHROME_UPDATE: 'chrome_update',
    SHARED_MODULE_UPDATE: 'shared_module_update'
  } as typeof chrome.runtime.OnInstalledReason

  beforeEach(() => {
    chrome.runtime.OnInstalledReason = OnInstalledReason
    chrome.action.setBadgeText = jest.fn().mockResolvedValue(undefined)
    chrome.action.setBadgeBackgroundColor = jest.fn().mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('should call onInstall when reason is INSTALL', () => {
    const details = { reason: OnInstalledReason.INSTALL } as chrome.runtime.InstalledDetails

    onInstallAndUpdate(details)

    expect(chrome.windows.create).toHaveBeenCalled()
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enableTodoistOptions: false })
  })

  it('should not call onUpdate if versions do not match', () => {
    process.env.VERSION = '2.0.0'

    const details = { reason: OnInstalledReason.UPDATE } as chrome.runtime.InstalledDetails

    onInstallAndUpdate(details)

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled()
    expect(chrome.action.setBadgeBackgroundColor).not.toHaveBeenCalled()
  })

  afterAll(() => {
    delete process.env.VERSION
  })
})
