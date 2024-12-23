import sleep from '@sx/utils/sleep'


async function changeState(): Promise<void> {
  chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'change_state' } })
  const dropdownParent: HTMLElement | null = document.getElementById('story-dialog-state-dropdown')
  if (!dropdownParent) {
    console.error('The state dropdown was not found.')
    return
  }
  const dropdown: HTMLButtonElement | null = dropdownParent.querySelector('[data-toggle="true"]')
  if (dropdown) {
    dropdown.click()
    const dropdownPopup: HTMLElement | null = document.querySelector('[data-state="active"]')
    if (!dropdownPopup) {
      console.error('The dropdown popup was not found.')
      return
    }
    const inputParent: HTMLElement | null = document.querySelector('[data-perma-id="popover"]')
    if (!inputParent) {
      console.error('The input parent was not found.')
      return
    }
    const input: HTMLInputElement | null = inputParent.querySelector('[type="search"]')
    if (input) {
      const WAIT_TIME = 100
      await sleep(WAIT_TIME)
      input.value = ''
      input.focus()
    }
  }
}

export default changeState
