import dayjs from 'dayjs'

import _getStates, { ShortcutWorkflowStates } from '@sx/utils/get-states'
import { logError } from '@sx/utils/log-error'


export default class Workspace {
  static activate(): void {
    Workspace.states().catch(logError)
  }

  /**
   * Gets the ShortcutWorkflowStates from storage or the Shortcut site. If fetch is false, it will not
   * fetch the states from the Shortcut site if they are not in storage, which is used during
   * initialization when the values themselves are not needed.
   * @param fetch - If false, will not fetch the states from the Shortcut site if it is not in storage.
   */
  static async states(fetch?: true): Promise<ShortcutWorkflowStates>
  static async states(fetch: false): Promise<ShortcutWorkflowStates | null>
  static async states(fetch: boolean = true): Promise<ShortcutWorkflowStates | null> {
    let states: ShortcutWorkflowStates
    const storage = await chrome.storage.local.get(['states', 'stateRefreshDate'])
    // Consider the states stale if they are beyond the refresh date
    const refreshDateString: string = <string>storage.stateRefreshDate
    // If the refresh date is not set, default to yesterday
    const refreshDate = refreshDateString ? dayjs(refreshDateString) : dayjs().subtract(1, 'day')
    const now = dayjs()
    // Confirm that we have states and they actually have values
    const storageStates = <ShortcutWorkflowStates | undefined>storage.states
    if ((storageStates && storageStates.Started.length > 0) || now.isAfter(refreshDate)) {
      states = <ShortcutWorkflowStates>storage.states
      if (!fetch) {
        return null
      }
    }
    else if (!fetch) {
      return null
    }
    else {
      states = await _getStates()
    }
    await chrome.storage.local.set({ states, stateRefreshDate: now.add(1, 'week').format() })
    return states
  }
}
