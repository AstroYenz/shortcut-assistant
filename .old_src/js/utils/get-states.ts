import changeState from '@sx/keyboard-shortcuts/change-state'
import extractText from '@sx/utils/extract-text'
import sleep from '@sx/utils/sleep'


const _states = ['Backlog', 'Unstarted', 'Started', 'Done']
export type ShortcutWorkflowState = 'Backlog' | 'Unstarted' | 'Started' | 'Done'
export type ShortcutWorkflowStates = Record<ShortcutWorkflowState, string[]>
/**
 * Goes through the state dropdown and extracts each workflow state with the corresponding states.
 * This should not be used directly, use the Workspace class instead.
 * Example output:
 * {
 *  "In Progress": ["In Progress", "In Review", "Blocked"],
 *  "Done": ["Done", "Closed"]
 *  }
 */
export default async function _getStates(): Promise<ShortcutWorkflowStates> {
  await changeState()
  const WAIT_TIME = 100
  await sleep(WAIT_TIME)
  const parentDiv = document.querySelector('[data-perma-id="popover"]')
  const selectDropdown = parentDiv?.querySelector('[aria-multiselectable="true"]')
  const stateMap: ShortcutWorkflowStates = { Backlog: [], Unstarted: [], Started: [], Done: [] }
  let currentKey = ''

  const listItems = selectDropdown?.querySelectorAll('ul[aria-multiselectable="true"] > div > li')

  if (!listItems) {
    return stateMap
  }
  listItems.forEach((li) => {
    const divs = li.querySelectorAll('div')

    if (divs.length === 2) {
      // This is a key, aka "Backlog", "Unstarted", "Started", "Done"
      currentKey = divs[1].textContent?.trim() || ''
      if (_states.includes(currentKey as keyof ShortcutWorkflowStates) && currentKey) {
        stateMap[currentKey as keyof ShortcutWorkflowStates] = []
      }
    }
    else if (divs.length > 2) {
      // These are values for the key, aka "In Progress", "In Review", "Blocked"
      const value = extractText(divs[2])
      if (currentKey && value) {
        stateMap[currentKey as keyof ShortcutWorkflowStates].push(value)
      }
    }
  })
  return stateMap
}
