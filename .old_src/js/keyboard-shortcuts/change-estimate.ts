// eslint-disable-next-line @typescript-eslint/require-await
async function changeEstimate(): Promise<void> {
  chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'change_estimate' } })
  const dropdown: HTMLElement | null = document.querySelector('#story-dialog-estimate-dropdown')
  if (!dropdown) {
    console.error('The estimate dropdown was not found.')
    return
  }
  dropdown.click()
  document.addEventListener('keydown', setEstimate)
}

// eslint-disable-next-line @typescript-eslint/require-await
async function setEstimate(event: KeyboardEvent): Promise<void> {
  const key = event.key

  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  if (!key.match(/^\d+$/)) {
    return
  }
  const estimatesDropdown: HTMLDivElement | null = document.querySelector('.apply-on-click')
  if (!estimatesDropdown) {
    console.error('The estimates dropdown was not found.')
    return
  }
  const estimates: NodeListOf<HTMLDivElement> = estimatesDropdown.querySelectorAll('.focusable')
  estimates.forEach((div) => {
    if (div.innerText.includes(`${key} points`)) {
      div.click()
    }
    else {
      console.error('The estimate was not found.')
    }
  })
}

export default changeEstimate
export { setEstimate }
