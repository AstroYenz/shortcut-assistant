import {CycleTime} from '@sx/cycle-time/cycle-time'
import {hoursBetweenExcludingWeekends} from '@sx/utils/hours-between-excluding-weekends'
import {Story} from '@sx/utils/story'


jest.mock('@sx/utils/hours-between-excluding-weekends', () => ({
  hoursBetweenExcludingWeekends: jest.fn()
}))
const mockedHoursBetweenExcludingWeekends = hoursBetweenExcludingWeekends as jest.MockedFunction<typeof hoursBetweenExcludingWeekends>
jest.mock('@sx/utils/story', () => ({
  Story: {
    isInState: jest.fn(),
    getDateInState: jest.fn(),
    isCompleted: jest.fn(),
    isReady: jest.fn().mockResolvedValue(true)
  }
}))
jest.mock('@sx/workspace/workspace', () => {
  class MockWorkspace {
    async activate() {
      await MockWorkspace.states()
    }

    static async states(fetch = true) {
      if (!fetch) {
        return null
      }
      return { Started: ['In Development'] }
    }
  }

  return {
    __esModule: true,
    default: MockWorkspace,
  }
})


const mockedStory = Story as jest.Mocked<typeof Story>


describe('set function', () => {
  let createdDiv: HTMLElement, completedDiv: HTMLElement, storyCreatedDivParent: HTMLElement

  beforeEach(() => {
    jest.clearAllMocks()
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return createdDiv
      if (selector === '.story-date-completed') return completedDiv
    })
    document.createElement = jest.fn().mockImplementation(() => {
      return {
        style: {},
        className: '',
        innerHTML: ''
      }
    })

    // Setup DOM elements mock
    createdDiv = {
      // @ts-expect-error - Migrating from JS
      parentElement: {
        insertBefore: jest.fn()
      }
    }
    // @ts-expect-error - Migrating from JS
    completedDiv = {
      querySelector: jest.fn().mockReturnValue({innerHTML: '2022-09-23'})
    }
    // @ts-expect-error - Migrating from JS
    storyCreatedDivParent = createdDiv.parentElement
  })

  it('should not display cycle time when the story is not completed', async () => {
    mockedStory.isInState.mockResolvedValue(false)

    await CycleTime.set()

    expect(Story.isReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isCompleted).toHaveBeenCalledTimes(1)
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should log an error if there is no created date', async () => {
    mockedStory.isCompleted.mockResolvedValue(true)
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return null
      if (selector === '.story-date-completed') return completedDiv
    })
    console.error = jest.fn()
    await CycleTime.set()
    expect(console.error).toHaveBeenCalledWith('Could not find created date')
  })

  it('should log an error if there is no in development date', async () => {
    mockedStory.isInState.mockResolvedValue(true)
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === '.story-date-cycle-time') return null // simulate absence initially
      if (selector === '.story-date-created') return createdDiv
      if (selector === '.story-date-completed') return null
    })
    console.error = jest.fn()
    await CycleTime.set()
    expect(console.error).toHaveBeenCalledWith('Could not find completed date')
  })

  it('should not display cycle time when the cycle time is not a number', async () => {
    mockedStory.isCompleted.mockResolvedValue(true)
    mockedStory.getDateInState.mockReturnValue('2022-08-23')
    mockedHoursBetweenExcludingWeekends.mockReturnValue(NaN) // Simulate NaN

    await CycleTime.set()

    expect(Story.isReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isCompleted).toHaveBeenCalledTimes(1)
    expect(mockedStory.getDateInState).toHaveBeenCalledWith('In Development')
    expect(mockedHoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).not.toHaveBeenCalled()
  })

  it('should calculate and display cycle time when the story is completed', async () => {
    mockedStory.isCompleted.mockResolvedValue(true)
    mockedStory.getDateInState.mockReturnValue('2022-08-23')
    const TWO_DAYS = 48
    mockedHoursBetweenExcludingWeekends.mockReturnValue(TWO_DAYS) // Simulate 48 hours difference

    await CycleTime.set()

    expect(Story.isReady).toHaveBeenCalledTimes(1)
    expect(mockedStory.isCompleted).toHaveBeenCalledTimes(1)
    expect(mockedStory.getDateInState).toHaveBeenCalledWith('In Development')
    expect(mockedHoursBetweenExcludingWeekends).toHaveBeenCalledWith('2022-08-23', '2022-09-23')
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(storyCreatedDivParent.insertBefore).toHaveBeenCalledTimes(1) // Ensure the div was inserted
  })
})

describe('clear function', () => {
  it('should remove cycleTimeDiv from the document if it exists', () => {
    document.body.innerHTML = '<div class="story-date-cycle-time"></div>'

    CycleTime.clear()

    const cycleTimeDiv = document.querySelector('.story-date-cycle-time')
    expect(cycleTimeDiv).toBeNull()
  })

  it('should not throw an error if cycleTimeDiv does not exist in the document', () => {
    document.body.innerHTML = ''

    expect(CycleTime.clear).not.toThrow()
  })
})
