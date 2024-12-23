import { logError } from '../utils/log-error'
import { Story } from '../utils/story'


export class NotesButton {
  constructor() {
    if (window.location.href.includes('story')) {
      this.setContentIfDataExists().catch(logError)
    }
  }

  async setContentExistsNotice(): Promise<void> {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description view-notes micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = 'This story has private notes set'
    newButton.tabIndex = 2

    const span = document.createElement('span')
    span.className = 'fa fa-pencil'
    newButton.appendChild(span)

    newButton.append(' Has Notes')

    const container = await Story.getEditDescriptionButtonContainer()
    const existingButton = container?.querySelector('.action.edit-description.view-notes.micro.flat-white')
    if (!existingButton) {
      container?.appendChild(newButton)
    }
  }

  remove(): void {
    const element = document.querySelector('.view-notes')
    if (element !== null) {
      element.remove()
    }
  }

  async setContentIfDataExists(): Promise<void> {
    const response = await chrome.runtime.sendMessage({ action: 'getSavedNotes' })
    const data = response.data
    if (!data) {
      this.remove()
    }
    else {
      this.setContentExistsNotice().catch(logError)
    }
  }
}
