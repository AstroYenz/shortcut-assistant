import { max } from 'lodash'

import { hoursBetweenExcludingWeekends } from '@sx/utils/hours-between-excluding-weekends'
import sleep from '@sx/utils/sleep'
import { Story } from '@sx/utils/story'
import Workspace from '@sx/workspace/workspace'


export class CycleTime {
  static clear(): void {
    const cycleTimeDiv = document.querySelector('.story-date-cycle-time')
    if (cycleTimeDiv) {
      cycleTimeDiv.remove()
    }
  }

  static async set(): Promise<void> {
    await Story.isReady()
    const WAIT_TIME = 300
    await sleep(WAIT_TIME)
    this.clear()
    const isCompleted = await Story.isCompleted()
    if (!isCompleted) {
      return
    }
    const states = await Workspace.states()
    const createdDiv = document.querySelector('.story-date-created')
    const inDevelopmentDates: Array<string | null> = states.Started.map(state => Story.getDateInState(state))
    const inDevelopmentDateString: string | undefined | null = max(inDevelopmentDates)
    const completedDiv = document.querySelector('.story-date-completed')
    const completedValue = completedDiv?.querySelector('.value')
    const completedDateString = completedValue?.innerHTML

    if (!createdDiv) {
      console.error('Could not find created date')
      return
    }

    if (!inDevelopmentDateString || !completedDateString) {
      console.error('Could not find completed date')
      return
    }

    const cycleTimeDiv = document.createElement('div')

    cycleTimeDiv.style.paddingTop = '0'
    cycleTimeDiv.style.marginTop = '0'
    cycleTimeDiv.className = 'attribute story-date-cycle-time'
    const cycleTimeHours = hoursBetweenExcludingWeekends(inDevelopmentDateString, completedDateString)

    if (isNaN(cycleTimeHours)) return

    const ONE_DAY = 24
    const cycleTimeDisplay = cycleTimeHours > ONE_DAY ? `${(cycleTimeHours / ONE_DAY).toFixed(2)} days` : `${cycleTimeHours.toFixed(2)} hours`
    cycleTimeDiv.innerHTML = `
            <span class='name'>Cycle Time</span>
            <span class='value'>${cycleTimeDisplay}</span>`
    const storyCreatedDivParent = createdDiv.parentElement
    storyCreatedDivParent?.insertBefore(cycleTimeDiv, createdDiv)
  }
}
