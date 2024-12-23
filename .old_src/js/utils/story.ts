import dayjs from 'dayjs'

import { ShortcutWorkflowState, ShortcutWorkflowStates } from '@sx/utils/get-states'
import Workspace from '@sx/workspace/workspace'

import {
  findFirstMatchingElementForState,
} from '../development-time/find-first-matching-element-for-state'

import { getActiveTabUrl } from './get-active-tab-url'
import { hoursBetweenExcludingWeekends } from './hours-between-excluding-weekends'
import sleep from './sleep'


export class Story {
  private static storyTitleLoaded(): boolean {
    return document.querySelector('.story-name') !== null
  }

  private static storyDescriptionLoaded(): boolean {
    return document.querySelector('#story-description-v2') !== null
  }

  private static historicalActivityLoaded(): boolean {
    return document.querySelector('.historical-change-v2') !== null
  }

  /**
   * Waits for the story title/name and historical activity (such as the story being created) to be
   * present on the page which indicates that the page is ready.
   * @returns {Promise<boolean>} - A promise that resolves to true when the page is ready,
   * and false if the page is not ready after 10 seconds.
   **/
  static async isReady(loop: number = 0): Promise<boolean> {
    const WAIT_FOR_PAGE_TO_LOAD_TIMEOUT: number = 300
    const MAX_ATTEMPTS: number = 20
    const storyTitleReady: boolean = this.storyTitleLoaded()
    const storyDescriptionReady: boolean = this.storyDescriptionLoaded()
    const historyActivityReady: boolean = this.historicalActivityLoaded()
    if (storyTitleReady && storyDescriptionReady && historyActivityReady) {
      return true
    }
    if (loop >= MAX_ATTEMPTS) {
      throw new Error('Story page did not load in time')
    }
    const HALF_LOOP = 0.5
    await sleep((loop * HALF_LOOP) * WAIT_FOR_PAGE_TO_LOAD_TIMEOUT)
    return this.isReady(loop + 1)
  }

  static get title(): string | null {
    const titleDiv: Element | null = document.querySelector('.story-name')
    const title: string | null | undefined = titleDiv?.textContent
    if (!title) {
      return null
    }
    return title
  }

  static get description(): string | null {
    const descriptionDiv: Element | null = document.querySelector('#story-description-v2')
    const description: string | null | undefined = descriptionDiv?.textContent
    if (!description) {
      return null
    }
    return description
  }

  static async notes(): Promise<string | null> {
    const storyId = await Story.id()
    if (!storyId) {
      return null
    }
    const key = 'notes_' + storyId
    const result = await chrome.storage.sync.get(key)
    if (result[key] === undefined) {
      return null
    }
    return <string>result[key]
  }

  static async id(): Promise<string | null> {
    const url = await getActiveTabUrl()
    const match = url?.match(/\/story\/(\d+)/)
    if (!match) {
      return null
    }
    return match[1]
  }

  private buttonExists(identifier: string): Element | null {
    return document.querySelector(`button[data-${identifier}="true"]`)
  }

  public async addButton(newButton: HTMLButtonElement, identifier: string): Promise<void> {
    const existingButton = this.buttonExists(identifier)
    if (!existingButton) {
      const container = await Story.getEditDescriptionButtonContainer()
      container?.appendChild(newButton)
    }
    // Prevent duplicate buttons
    const WAIT = 200
    sleep(WAIT).then(() => {
      const existingButtons = document.querySelectorAll(`button[data-${identifier}="true"]`)
      if (existingButtons.length > 1) {
        existingButtons[0].remove()
      }
    })
  }

  static async getEditDescriptionButtonContainer(attempts: number = 0): Promise<HTMLElement | null | undefined> {
    const ONE_SECOND = 1000
    await sleep(ONE_SECOND)
    const container: HTMLElement | null = document.querySelector('#story-description-v2')
    const MAX_ATTEMPTS = 10
    if (!container && attempts < MAX_ATTEMPTS) {
      return this.getEditDescriptionButtonContainer(attempts + 1)
    }
    return container
  }

  /**
   * Calculates the time between a given state and the current time.
   *
   * @param {string} state - The state for which to calculate the time spent.
   * @returns {number} - The time spent in the state in hours, excluding weekends.
   */
  static getTimeInState(state: string): number | null {
    const now = dayjs()
    const nowFormatted = now.format('MMM D YYYY, h:mm A')
    const dateInState = this.getDateInState(state)
    if (!dateInState) {
      return null
    }
    return hoursBetweenExcludingWeekends(dateInState, nowFormatted)
  }

  static getDateInState(state: string): string | null {
    const latestUpdateElements = findFirstMatchingElementForState(state)
    if (!latestUpdateElements) {
      return null
    }

    const parentDiv: HTMLElement | null = latestUpdateElements.element?.parentElement || null
    const dateElement: Element | null | undefined = parentDiv?.querySelector('.date')
    return dateElement ? dateElement.innerHTML : null
  }

  static get state(): HTMLElement | null {
    const storyStateDiv: HTMLElement | null = document.getElementById('story-dialog-state-dropdown')
    if (!storyStateDiv) {
      return null
    }
    return storyStateDiv.querySelector('.value')
  }

  static async isCompleted(): Promise<boolean> {
    const states: ShortcutWorkflowStates = await Workspace.states()
    const doneStates: string[] = states.Done
    const state: string = this.state?.textContent || ''
    return doneStates.some(doneState => state.includes(doneState))
  }

  static async isInState(state: ShortcutWorkflowState): Promise<boolean> {
    let storyState = ''
    try {
      storyState = this.state?.textContent || ''
    }
    catch (e) {
      console.warn(`Could not find state element for state ${state}`)
    }

    const states = await Workspace.states()
    return states[state].some(state => storyState.includes(state))
  }
}
