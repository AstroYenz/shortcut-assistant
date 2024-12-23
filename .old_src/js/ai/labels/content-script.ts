import { AiProcessMessage } from '@sx/analyze/types/AiProcessMessage'
import { Story } from '@sx/utils/story'


class LabelsContentScript {
  static async onClick(): Promise<void> {
    const isAuthenticated = await LabelsContentScript.isAuthenticated()
    if (!isAuthenticated) {
      await chrome.action.openPopup()
      return
    }
    const button = document.querySelector('[data-assistant="add-labels"]')
    if (!button) {
      throw new Error('Could not find button')
    }
    button.textContent = 'Adding labels...'
    const message: AiProcessMessage = <AiProcessMessage>{ action: 'addLabels' }
    await chrome.runtime.sendMessage(message)
    button.textContent = 'Auto Add Labels...'
  }

  static async isAuthenticated(): Promise<boolean> {
    const storage = await chrome.storage.local.get('backendKey')
    return storage.backendKey !== undefined
  }

  static async addButton(): Promise<void> {
    const addLabelButton = document.querySelector('#story-dialog-add-label-dropdown')
    if (addLabelButton) {
      const labelDiv = addLabelButton.parentElement
      if (!labelDiv) {
        throw new Error('Could not find parent of add label button')
      }
      const newButton = await this.createButton()
      labelDiv.appendChild(newButton)
    }
  }

  static async createButton(): Promise<HTMLButtonElement> {
    const newButton = document.createElement('button')
    const isAuthenticated = await this.isAuthenticated()
    newButton.className = isAuthenticated ? 'add-labels action micro' : 'micro action'
    newButton.dataset.assistant = 'add-labels'
    newButton.style.marginTop = '5px'
    newButton.dataset.tooltip = isAuthenticated ? 'Use AI to add relevant labels' : 'Please authenticate w/ Shortcut Assistant to use this feature'
    newButton.addEventListener('click', LabelsContentScript.onClick)
    newButton.textContent = 'Auto Add Labels...'
    return newButton
  }

  static async init(): Promise<void> {
    const featureEnabled = process.env.NEW_AI_FEATURES_ENABLED
    if (featureEnabled === 'true') {
      await Story.isReady()
      await this.addButton()
    }
  }
}

export default LabelsContentScript
