import sleep from '../utils/sleep'


async function changeIteration(): Promise<void> {
  chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'change_iteration' } })
  const iterationSelect: HTMLInputElement | null = document.querySelector('[data-perma-id="iteration-select"]')
  const childButton: HTMLButtonElement | null | undefined = iterationSelect?.querySelector('[role="button"]')

  if (childButton) {
    childButton.click()
  }

  if (iterationSelect && childButton) {
    iterationSelect.click()
    const iterationPopup: HTMLElement | null = document.querySelector('.iteration-selector')
    if (iterationPopup) {
      const input: HTMLInputElement | null = iterationPopup.querySelector('.autocomplete-input')
      if (!input) {
        console.error('The iteration input field was not found.')
        return
      }
      const ms = 100
      await sleep(ms)
      input.value = ''
      input.focus()
    }
  }
}

export default changeIteration
