import camelToSnake from '../utils/camel-to-snake'

import changeEstimate from './change-estimate'
import changeIteration from './change-iteration'
import changeState from './change-state'


export type shortcut = ({
  altKey?: boolean
  ctrlKey?: boolean
  func: () => Promise<void>
  key: string
  metaKey?: boolean
  shiftKey: boolean
})

export class KeyboardShortcuts {
  predefinedShortcuts: shortcut[] = [
    // MacOS
    { key: 's', shiftKey: true, metaKey: true, func: changeState },
    { key: 'i', shiftKey: true, metaKey: true, func: changeIteration },
    { key: 'e', shiftKey: true, metaKey: true, func: changeEstimate },
    // Windows
    { key: 's', shiftKey: true, ctrlKey: true, func: changeState },
    { key: 'i', shiftKey: true, ctrlKey: true, func: changeIteration },
    { key: 'e', shiftKey: true, ctrlKey: true, func: changeEstimate },
  ]

  shortcuts: Map<string, () => Promise<void>>

  constructor() {
    this.shortcuts = new Map()
    this.predefinedShortcuts.forEach((shortcut) => {
      this.registerShortcut(shortcut)
    })
  }

  activate(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * Serializes an object representing a keyboard shortcut into a string representation.
   *
   * @param {object} shortcut - The shortcut to serialize
   * @param {string} shortcut.key - The alphanumeric key of the shortcut
   * @param {boolean} shortcut.metaKey - Indicates if the meta key is pressed
   * @param {boolean} shortcut.shiftKey - Indicates if the shift key is pressed
   * @param {boolean} shortcut.altKey - Indicates if the alt key is pressed
   * @param {boolean} shortcut.ctrlKey - Indicates if the ctrl key is pressed
   *
   * @returns {string} The serialized string representation of the shortcut.
   * @example {key: 'a', shiftKey: True, func: () => {} } => 'a-0-1-0-0'
   */
  serializeShortcut({ key, metaKey, shiftKey, altKey, ctrlKey }: {
    altKey?: boolean
    ctrlKey?: boolean
    key: string
    metaKey?: boolean
    shiftKey: boolean
  }): string {
    return `${key.toLowerCase()}-${metaKey ? '1' : '0'}-${shiftKey ? '1' : '0'}-${altKey ? '1' : '0'}-${ctrlKey ? '1' : '0'}`
  }

  /**
   * Registers a shortcut.
   *
   * @param {Object} shortcut - The shortcut object containing the details of the shortcut.
   * @param {string} shortcut.key - The alphanumeric key of the shortcut
   * @param {boolean} shortcut.metaKey - Indicates if the meta key is pressed
   * @param {boolean} shortcut.shiftKey - Indicates if the shift key is pressed
   * @param {boolean} shortcut.altKey - Indicates if the alt key is pressed
   * @param {boolean} shortcut.ctrlKey - Indicates if the ctrl key is pressed
   * @param {Function} shortcut.func - The function to be called when the shortcut is triggered.
   * @example {key: 'a', shiftKey: True, func: () => {console.log('Shift+a was pressed')}} => null
   * @return {void}
   */
  registerShortcut(shortcut: shortcut): void {
    const serializedKey = this.serializeShortcut(shortcut)
    this.shortcuts.set(serializedKey, shortcut.func.bind(this))
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handleKeyDown(event: KeyboardEvent): Promise<void> {
    const serializedEventKey = this.serializeShortcut({
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      key: event.key,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey
    })

    if (this.shortcuts.has(serializedEventKey)) {
      event.preventDefault()
      const func: (() => Promise<void>) | undefined = this.shortcuts.get(serializedEventKey)
      if (func) {
        chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'keyboard-shortcut', params: { shortcutAction: camelToSnake(func.name) } } })
        func().catch((e) => {
          console.error('Error running shortcut:', e)
        })
      }
    }
  }
}
