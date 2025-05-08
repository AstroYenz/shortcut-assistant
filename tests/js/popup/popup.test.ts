import { sendEvent } from '@sx/analytics/event'
import { NotesPopup } from '@sx/popup/notes-popup'
import { Popup } from '@sx/popup/popup'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import sleep from '@sx/utils/sleep'


jest.mock('@sx/analytics/event', () => ({
  sendEvent: jest.fn().mockResolvedValue(null)
}))
const mockedSendEvent = sendEvent as jest.MockedFunction<typeof sendEvent>
jest.mock('@sx/utils/get-synced-setting')
const mockedGetSyncedSetting = getSyncedSetting as jest.MockedFunction<typeof getSyncedSetting>
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))
const mockedSleep = sleep as jest.MockedFunction<typeof sleep>

jest.mock('@sx/popup/notes-popup')


global.chrome = {
  ...global.chrome,
  action: {
    ...global.chrome.action,
    getBadgeText: jest.fn().mockResolvedValue(() => Promise.resolve('New!')),
  },
  identity: {
    ...global.chrome.identity,
    getAuthToken: jest.fn().mockImplementation((options, callback) => {
      callback('test-google-token')
    })
  },
}


const mockElement = (options = {}): object => {
  return {
    addEventListener: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    click: jest.fn(),
    querySelector: jest.fn(() => ({
      style: {
        display: ''
      }
    })),
    ...options
  }
}

describe('Popup', () => {
  let popup: Popup
  let getElementById: jest.SpyInstance

  beforeEach(() => {
    // @ts-expect-error Migrating from JS
    getElementById = jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      return mockElement({
        value: id === 'openAIToken' ? 'test-token' : '',
        checked: true,
        textContent: ''
      })
    }
    )
    mockedSleep.mockResolvedValue(undefined)
    popup = new Popup()
  })

  afterEach(() => {
    getElementById.mockRestore()
    jest.clearAllMocks()
  })

  test('constructor initializes event listeners', () => {
    document.addEventListener = jest.fn()
    window.addEventListener = jest.fn()
    popup = new Popup()
    expect(getElementById).toHaveBeenCalledWith('saveKeyButton')
    expect(getElementById).toHaveBeenCalledWith('todoistOptions')
    expect(getElementById).toHaveBeenCalledWith('changelog')
    // @ts-expect-error Migrating from JS
    expect(popup.saveButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    // @ts-expect-error Migrating from JS
    expect(popup.changelogButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(sendEvent).toHaveBeenCalledWith('popup_view')
  })

  it('constructor throws an error if saveButton, todoistCheckbox, changelogButton, or authenticateButton not found', () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'saveKeyButton' || id === 'todoistOptions' || id === 'changelog') {
        return null
      }
      return mockElement()
    })

    const expected = 'saveButton, todoistCheckbox, changelogButton, or authenticateButton not found'
    expect(() => new Popup()).toThrow(expected)
  })

  it('hides newAiFeatures if NEW_AI_FEATURES_ENABLED is not true', () => {
    process.env.NEW_AI_FEATURES_ENABLED = 'false'
    const mockNewAiFeatures = { classList: { add: jest.fn() } }
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'newAiFeatures') {
        return mockNewAiFeatures
      }
      return mockElement()
    })

    popup = new Popup()
    expect(mockNewAiFeatures.classList.add).toHaveBeenCalledWith('hidden')
  })

  it('sendEvent is called on window load', (): void => {
    mockedSendEvent.mockResolvedValue(undefined)
    popup = new Popup()
    window.dispatchEvent(new Event('load'))
    expect(mockedSendEvent).toHaveBeenCalledWith('popup_view')
  })

  it('is called on window load, logs errors', async () => {
    console.error = jest.fn()
    const error = new Error('test error')
    mockedSendEvent.mockRejectedValue(error)
    popup = new Popup()
    window.dispatchEvent(new Event('load'))
    expect(mockedSendEvent).toHaveBeenCalledWith('popup_view')
    // Wait for the promise passed to addEventListener to resolve
    await sleep(100)
    expect(console.error).toHaveBeenCalledWith(new Error('test error'))
  })

  it('setOpenAIToken sets token in chrome storage', async () => {
    await popup.setOpenAIToken('test-token')
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ openAIToken: 'test-token' })
  })

  it('setShortcutApiToken registers with Google and sends message', () => {
    const googleToken = 'test-google-token'
    const shortcutToken = 'test-shortcut-token'
    const message = { action: 'saveUserToken', data: { googleToken, shortcutToken } }

    popup.setShortcutApiToken(shortcutToken)

    expect(chrome.identity.getAuthToken).toHaveBeenCalledWith({ interactive: true }, expect.any(Function))
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message)
  })

  it('setShortcutApiToken logs error if Google token not received', () => {
    console.error = jest.fn()
    chrome.identity.getAuthToken = jest.fn().mockImplementation((options, callback) => {
      callback()
    })

    popup.setShortcutApiToken('test-token')

    expect(console.error).toHaveBeenCalledWith('No token received')
  })

  it('saveOptions sets options in chrome storage', async () => {
    // @ts-expect-error Migrating from JS
    popup.todoistCheckbox = { checked: true }
    await popup.saveOptions()
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enableTodoistOptions: true })
  })

  it('saveButtonClicked', async () => {
    // @ts-expect-error Migrating from JS
    popup.saveButton = {
      disabled: false,
      get textContent(): string {
        // @ts-expect-error Migrating from JS
        return <string> this._textContent
      },
      set textContent(value) {
        // @ts-expect-error Migrating from JS
        this._textContent = value
        // @ts-expect-error Migrating from JS
        this.textChanges.push(value)
      },
      // @ts-expect-error Migrating from JS
      textChanges: []
    }
    popup.setOpenAIToken = jest.fn().mockResolvedValue(null)
    popup.saveOptions = jest.fn().mockResolvedValue(null)

    await popup.saveButtonClicked()
    expect(popup.setOpenAIToken).toHaveBeenCalledWith('test-token')
    expect(popup.saveOptions).toHaveBeenCalled()
    // @ts-expect-error Migrating from JS
    expect(popup.saveButton.disabled).toBeFalsy()
    // @ts-expect-error Migrating from JS
    expect(popup.saveButton.textChanges).toContain('Saved!')
    // @ts-expect-error Migrating from JS
    expect(popup.saveButton.textChanges).toContain('Save')
  })

  it('setSectionDisplay', () => {
    const tabToShow = document.createElement('div')
    const sectionToShow = document.createElement('div')
    const tabsToHide = [document.createElement('div'), document.createElement('div')]
    const sectionsToHide = [document.createElement('div'), document.createElement('div')]

    popup.setSectionDisplay(tabToShow, sectionToShow, tabsToHide, sectionsToHide)

    tabToShow.dispatchEvent(new Event('click'))

    expect(sectionToShow.classList.contains('hidden')).toBeFalsy()
    sectionsToHide.forEach((section) => {
      expect(section.classList.contains('hidden')).toBeTruthy()
    })
    expect(tabToShow.classList.contains('tab-active')).toBeTruthy()
    tabsToHide.forEach((tab) => {
      expect(tab.classList.contains('tab-active')).toBeFalsy()
    })
  })
})

describe('handleNewVersionBadge', () => {
  beforeEach(() => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'infoTab') {
        return {
          querySelector: jest.fn().mockReturnValue({ style: { display: '' } })
        }
      }
      else if (id === 'whatsNewBadge') {
        return { style: { display: '' } }
      }
      else {
        return mockElement()
      }
    })
  })

  it('hides badges when badge text is empty', async () => {
    // @ts-expect-error Migrating from JS
    chrome.action.getBadgeText.mockResolvedValue('')

    const popup = new Popup()
    await popup.handleNewVersionBadge()

    const infoTab = document.getElementById('infoTab')
    // @ts-expect-error Migrating from JS
    const tabBadge = infoTab.querySelector('.badge')
    const whatsNewBadge = document.getElementById('whatsNewBadge')

    // @ts-expect-error Migrating from JS
    expect(tabBadge.style.display).toBe('')
    // @ts-expect-error Migrating from JS
    expect(whatsNewBadge.style.display).toBe('')
  })

  it('throws an error if tabBadge is not found', async () => {
    // @ts-expect-error Migrating from JS
    chrome.action.getBadgeText.mockResolvedValue('')

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'infoTab') {
        return {
          querySelector: jest.fn().mockReturnValue(null)
        }
      }
      else {
        return mockElement()
      }
    })

    const popup = new Popup()
    await expect(popup.handleNewVersionBadge()).rejects.toThrow('tabBadge not found')
  })

  it('does nothing when badge text is not empty', async () => {
    // @ts-expect-error Migrating from JS
    chrome.action.getBadgeText.mockResolvedValue('New!')

    const popup = new Popup()
    await popup.handleNewVersionBadge()

    const infoTab = document.getElementById('infoTab') as HTMLAnchorElement
    const tabBadge = infoTab.querySelector('.badge')
    const whatsNewBadge = document.getElementById('whatsNewBadge')

    // @ts-expect-error Style does exist
    expect(tabBadge!.style.display).toBe('')
    expect(whatsNewBadge!.style.display).toBe('')
  })

  it('throws an error if whatsNewBadge is not found', async () => {
    // @ts-expect-error Migrating from JS
    chrome.action.getBadgeText.mockResolvedValue('')

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'whatsNewBadge') {
        return null
      }
      else {
        return mockElement()
      }
    })

    const popup = new Popup()
    await expect(popup.handleNewVersionBadge()).rejects.toThrow('whatsNewBadge not found')
  })
})

describe('popupLoaded', () => {
  let mockVersionSpan: { textContent: string }

  beforeEach(() => {
    // @ts-expect-error Migrating from JS
    sendEvent.mockClear()
    // @ts-expect-error Migrating from JS
    NotesPopup.mockClear()
    mockedGetSyncedSetting.mockClear()

    mockVersionSpan = {
      textContent: ''
    }
    const todoistCheckbox = mockElement() as unknown as jest.Mocked<HTMLElement>
    todoistCheckbox.removeAttribute = jest.fn()
    todoistCheckbox.setAttribute = jest.fn()
    todoistCheckbox.hasAttribute = jest.fn().mockReturnValue(true)

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'versionInfo') {
        return mockVersionSpan
      }
      else {
        return todoistCheckbox
      }
    })
  })

  it('sets up correctly', async () => {
    mockedGetSyncedSetting.mockResolvedValueOnce(true) // enableTodoistOptions
    const popup = new Popup()
    popup.handleNewVersionBadge = jest.fn().mockResolvedValue(null)
    await popup.popupLoaded()

    expect(document.getElementById).toHaveBeenCalledWith('notesTab')
    expect(document.getElementById).toHaveBeenCalledWith('settingsTab')
    expect(document.getElementById).toHaveBeenCalledWith('infoTab')
    expect(document.getElementById).toHaveBeenCalledWith('versionInfo')
    expect(mockVersionSpan.textContent).toBe('Version: 1.0.0')

    expect(mockedGetSyncedSetting).toHaveBeenCalledWith('enableTodoistOptions', false)
    // @ts-expect-error Migrating from JS
    expect(popup.todoistCheckbox.setAttribute).toHaveBeenCalledWith('checked', 'checked')

    expect(NotesPopup).toHaveBeenCalled()

    expect(popup.handleNewVersionBadge).toHaveBeenCalled()
    expect(sendEvent).toHaveBeenCalledWith('popup_loaded', {
      page_title: 'Popup',
      page_location: '/popup.html'
    })
  })

  it('throws and error if notesTab is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'notesTab') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws and error if settingsTab is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'settingsTab') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws and error if infoTab is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'infoTab') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws and error if actionsSection is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'actionsSection') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws and error if settingsSection is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'settingsSection') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws and error if infoSection is not found', async () => {
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'infoSection') {
        return mockElement()
      }
      return null
    })
    const popup = new Popup()
    const expected = 'notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found'
    await expect(popup.popupLoaded()).rejects.toThrow(expected)
  })

  it('throws new error if versionSpan is not found', async () => {
    mockedGetSyncedSetting.mockResolvedValueOnce(false)
    const popup = new Popup()
    popup.handleNewVersionBadge = jest.fn().mockResolvedValue(null)
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id !== 'versionInfo') {
        return mockElement()
      }
      return null
    })

    await expect(popup.popupLoaded()).rejects.toThrow('versionSpan not found')
    expect(document.getElementById).toHaveBeenCalledWith('notesTab')
    expect(document.getElementById).toHaveBeenCalledWith('settingsTab')
    expect(document.getElementById).toHaveBeenCalledWith('infoTab')
    expect(document.getElementById).toHaveBeenCalledWith('versionInfo')

    expect(mockedGetSyncedSetting).toHaveBeenCalledWith('enableTodoistOptions', false)
    // @ts-expect-error Migrating from JS
    expect(popup.todoistCheckbox.removeAttribute).toHaveBeenCalledWith('checked')

    expect(NotesPopup).not.toHaveBeenCalled()

    expect(popup.handleNewVersionBadge).toHaveBeenCalled()
  })

  it('sets up correctly with todoist disabled', async () => {
    mockedGetSyncedSetting.mockResolvedValueOnce(false)
    const popup = new Popup()
    popup.handleNewVersionBadge = jest.fn().mockResolvedValue(null)
    await popup.popupLoaded()

    expect(document.getElementById).toHaveBeenCalledWith('notesTab')
    expect(document.getElementById).toHaveBeenCalledWith('settingsTab')
    expect(document.getElementById).toHaveBeenCalledWith('infoTab')
    expect(document.getElementById).toHaveBeenCalledWith('versionInfo')
    expect(mockVersionSpan.textContent).toBe('Version: 1.0.0')

    expect(mockedGetSyncedSetting).toHaveBeenCalledWith('enableTodoistOptions', false)
    // @ts-expect-error Migrating from JS
    expect(popup.todoistCheckbox.removeAttribute).toHaveBeenCalledWith('checked')

    expect(NotesPopup).toHaveBeenCalled()

    expect(popup.handleNewVersionBadge).toHaveBeenCalled()
    expect(sendEvent).toHaveBeenCalledWith('popup_loaded', {
      page_title: 'Popup',
      page_location: '/popup.html'
    })
  })

  it('logs error if handleNewVersionBadge fails', async () => {
    console.error = jest.fn()
    const error = new Error('test error')
    mockedGetSyncedSetting.mockResolvedValueOnce(true)
    const popup = new Popup()
    popup.handleNewVersionBadge = jest.fn().mockRejectedValue(error)
    await popup.popupLoaded()

    expect(console.error).toHaveBeenCalledWith(new Error('test error'))
  })
})
