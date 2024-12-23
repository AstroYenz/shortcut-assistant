import { sendEvent } from '@sx/analytics/event'
import { IpcRequestSaveUserToken } from '@sx/types/ipc-request'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import sleep from '@sx/utils/sleep'

import { NotesPopup } from './notes-popup'


/**
 * Handles all interactions with the popup.html file including saving settings
 * and displaying the correct section. Functionality for saving notes and the OpenAI token are also included.
 * @class
 */
export class Popup {
  private todoistCheckbox: HTMLInputElement
  private saveButton: HTMLButtonElement
  private changelogButton: HTMLButtonElement
  private authenticateButton: HTMLButtonElement

  constructor() {
    const todoistCheckbox = document.getElementById('todoistOptions') as HTMLInputElement | null
    const saveButton = document.getElementById('saveKeyButton') as HTMLButtonElement | null
    const authenticateButton = document.getElementById('oauth') as HTMLButtonElement | null
    const changelogButton = document.getElementById('changelog') as HTMLButtonElement | null

    if (saveButton === null || todoistCheckbox === null || changelogButton === null || authenticateButton === null) {
      throw new Error('saveButton, todoistCheckbox, changelogButton, or authenticateButton not found')
    }

    this.todoistCheckbox = todoistCheckbox
    this.saveButton = saveButton
    this.authenticateButton = authenticateButton
    this.changelogButton = changelogButton
    this.saveButton.addEventListener('click', this.saveButtonClicked.bind(this))
    this.authenticateButton.addEventListener('click', this.saveShortcutTokenButtonClicked.bind(this))

    this.changelogButton.addEventListener('click', async () => {
      await chrome.action.setBadgeText({ text: '' })
    })

    const newAiFeatures = document.getElementById('newAiFeatures')
    if (process.env.NEW_AI_FEATURES_ENABLED !== 'true') {
      newAiFeatures?.classList.add('hidden')
    }

    sendEvent('popup_view').catch((e) => {
      console.error(e)
    })
    this.popupLoaded().catch((e) => {
      console.error(e)
    })
  }

  async setOpenAIToken(token: string): Promise<void> {
    await chrome.storage.local.set({ openAIToken: token })
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async setShortcutApiToken(shortcutToken: string): Promise<void> {
    chrome.identity.getAuthToken({ interactive: true }, (googleToken) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        return
      }
      if (!googleToken) {
        console.error('No token received')
        return
      }
      chrome.runtime.sendMessage({ action: 'saveUserToken', data: { googleToken, shortcutToken } } as IpcRequestSaveUserToken)
    })
  }

  async saveOptions(): Promise<void> {
    const enableTodoistOptions = this.todoistCheckbox.checked
    await chrome.storage.sync.set({ enableTodoistOptions: enableTodoistOptions })
  }

  async handleSaveButtonClick(button: HTMLButtonElement, input: HTMLInputElement, saveFunction: (value: string) => Promise<void>, savedText: string): Promise<void> {
    button.disabled = true
    const inputValue = input.value
    if (inputValue !== '') {
      await saveFunction(inputValue)
    }
    await this.saveOptions()
    button.disabled = false
    button.textContent = 'Saved!'
    const THREE_SECONDS = 3000
    await sleep(THREE_SECONDS)
    button.textContent = savedText
  }

  async saveButtonClicked(): Promise<void> {
    const openAITokenInput = document.getElementById('openAIToken') as HTMLInputElement
    await this.handleSaveButtonClick(this.saveButton, openAITokenInput, this.setOpenAIToken.bind(this), 'Save')
  }

  async saveShortcutTokenButtonClicked(): Promise<void> {
    const shortcutTokenInput = document.getElementById('shortcutToken') as HTMLInputElement
    await this.handleSaveButtonClick(this.authenticateButton, shortcutTokenInput, this.setShortcutApiToken.bind(this), 'Authenticate')
  }

  setSectionDisplay(tabToShow: HTMLElement, sectionToShow: HTMLElement, tabsToHide: HTMLElement[], sectionsToHide: HTMLElement[]): void {
    tabToShow.addEventListener('click', function (e) {
      e.preventDefault()
      sectionToShow.classList.remove('hidden')
      sectionsToHide.forEach((section) => {
        section.classList.add('hidden')
      })
      tabToShow.classList.add('tab-active')
      tabsToHide.forEach((tab) => {
        tab.classList.remove('tab-active')
      })
    })
  }

  /**
   * Hides the new version indicator if the Chrome badge is empty.
   */
  async handleNewVersionBadge(): Promise<void> {
    const badgeBackgroundText = await chrome.action.getBadgeText({})
    if (badgeBackgroundText === '') {
      const infoTab = document.getElementById('infoTab')
      const tabBadge = infoTab?.querySelector('.badge') as HTMLElement | null
      if (!tabBadge) {
        throw new Error('tabBadge not found')
      }
      const whatsNewBadge = document.getElementById('whatsNewBadge')
      if (!whatsNewBadge) {
        throw new Error('whatsNewBadge not found')
      }
      tabBadge.style.display = 'none'
      whatsNewBadge.style.display = 'none'
    }
  }

  async updateFromSettings(): Promise<void> {
    const todoistEnabled = await getSyncedSetting('enableTodoistOptions', false)
    if (todoistEnabled) {
      this.todoistCheckbox.setAttribute('checked', 'checked')
    }
    else if (typeof this.todoistCheckbox.removeAttribute === 'function'
      && this.todoistCheckbox.hasAttribute('checked')) {
      this.todoistCheckbox.removeAttribute('checked')
    }
  }

  async popupLoaded(): Promise<void> {
    const notesTab = document.getElementById('notesTab')
    const settingsTab = document.getElementById('settingsTab')
    const infoTab = document.getElementById('infoTab')
    const actionsSection = document.getElementById('actionsSection')
    const settingsSection = document.getElementById('settingsSection')
    const infoSection = document.getElementById('infoSection')

    if (notesTab === null || settingsTab === null || infoTab === null || actionsSection === null || settingsSection === null || infoSection === null) {
      throw new Error('notesTab, settingsTab, infoTab, actionsSection, settingsSection, or infoSection not found')
    }

    await this.updateFromSettings()

    this.setSectionDisplay(notesTab, actionsSection, [settingsTab, infoTab], [settingsSection, infoSection])
    this.setSectionDisplay(settingsTab, settingsSection, [notesTab, infoTab], [actionsSection, infoSection])
    this.setSectionDisplay(infoTab, infoSection, [notesTab, settingsTab], [actionsSection, settingsSection])

    this.handleNewVersionBadge().catch((e) => {
      console.error(e)
    })
    const versionSpan = document.getElementById('versionInfo')
    if (versionSpan === null) {
      throw new Error('versionSpan not found')
    }
    const version = chrome.runtime.getManifest().version
    versionSpan.textContent = `Version: ${version}`
    new NotesPopup()
    sendEvent('popup_loaded', { page_title: 'Popup', page_location: '/popup.html' }).catch((e) => {
      console.error(e)
    })
  }
}
