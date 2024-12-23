import sleep from '@sx/utils/sleep'
import { Story } from '@sx/utils/story'


export class NotesPopup {
  private saveButton: HTMLElement

  constructor() {
    const saveButton = document.getElementById('saveButton')
    if (saveButton === null) {
      throw new Error('saveButton not found')
    }
    saveButton.addEventListener('click', this.save.bind(this))
    this.set.bind(this)().catch(console.error)
    this.saveButton = saveButton
  }

  public static _autoExpandTextarea(event: Event): void {
    const target = event.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = (target.scrollHeight) + 'px'
  }

  resizeInput(): void {
    const storyNotesInput = this.getInput()
    // Static method doesn't need to be bound
    // eslint-disable-next-line @typescript-eslint/unbound-method
    storyNotesInput?.addEventListener('input', NotesPopup._autoExpandTextarea)
  }

  async save(): Promise<void> {
    const storyId = await Story.id()
    if (!storyId) {
      throw new Error('Story ID not found')
    }
    const data = { [this.getKey(storyId)]: this.getInput()?.value }
    await chrome.storage.sync.set(data)
    this.saveButton.textContent = 'Saved!'
    const TWO_SECONDS = 2000
    await sleep(TWO_SECONDS)
    this.saveButton.textContent = 'Save'
  }

  getInput(): HTMLInputElement | null {
    return document.getElementById('storyNotes') as HTMLInputElement | null
  }

  getKey(storyId: string): string {
    return 'notes_' + storyId
  }

  async set(): Promise<void> {
    this.resizeInput()
    const storyId = await Story.id()
    if (!storyId) {
      throw new Error('Story ID not found')
    }
    const key = this.getKey(storyId)
    const storyNotesInput: HTMLInputElement | null = this.getInput()
    const result = await chrome.storage.sync.get(key)
    const value = result[key] as string | undefined
    if (storyNotesInput === null) {
      throw new Error('storyNotesInput not found')
    }
    if (value !== undefined) {
      storyNotesInput.value = value
    }
  }

  static handleMessage(message: Record<string, string>): void {
    if (message.message === 'checkNotes') {
      new NotesPopup()
    }
  }
}


// eslint-disable-next-line @typescript-eslint/unbound-method
chrome.runtime.onMessage.addListener(NotesPopup.handleMessage)
