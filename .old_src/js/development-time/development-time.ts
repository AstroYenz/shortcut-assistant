import { Story } from '@sx/utils/story'
import Workspace from '@sx/workspace/workspace'


export class DevelopmentTime {
  static setTimeSpan(hoursElapsed: number): void {
    const stateSpan = Story.state
    if (!stateSpan) {
      throw new Error('Story state span not found')
    }
    const ONE_DAY = 24
    let daysElapsed = hoursElapsed / ONE_DAY
    daysElapsed = Math.abs(daysElapsed)
    const timeSpan = document.createElement('span')
    timeSpan.setAttribute('data-assistant', 'true')
    timeSpan.innerHTML = ` (${daysElapsed.toFixed(2)} days)`
    stateSpan.appendChild(timeSpan)
  }

  static remove(): void {
    const timeSpan = document.querySelector('[data-assistant="true"]')
    if (timeSpan) {
      timeSpan.remove()
    }
  }

  static async set(): Promise<void> {
    await Story.isReady()
    this.remove()
    const states = await Workspace.states()
    const inDevelopmentStates = states.Started
    const inDevelopment = await Story.isInState('Started')
    if (!inDevelopment) {
      return
    }
    const inDevelopmentTime: number = inDevelopmentStates.reduce((totalTime, state) => {
      return totalTime + (Story.getTimeInState(state) || 0)
    }, 0)

    if (inDevelopmentTime) {
      this.setTimeSpan(inDevelopmentTime)
    }
  }
}
