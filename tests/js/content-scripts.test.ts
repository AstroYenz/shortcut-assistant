import { AiFunctions } from '@sx/analyze/ai-functions'
import { analyzeStoryDescription } from '@sx/analyze/analyze-story-description'
import { activate, handleMessage } from '@sx/content-scripts'
import { CycleTime } from '@sx/cycle-time/cycle-time'
import { DevelopmentTime } from '@sx/development-time/development-time'
import changeIteration from '@sx/keyboard-shortcuts/change-iteration'
import changeState from '@sx/keyboard-shortcuts/change-state'
import { NotesButton } from '@sx/notes/notes-button'
import { Todoist } from '@sx/todoist/todoist'
import { getSyncedSetting } from '@sx/utils/get-synced-setting'
import { Story } from '@sx/utils/story'


jest.mock('@sx/development-time/development-time', () => ({
  DevelopmentTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('@sx/cycle-time/cycle-time', () => ({
  CycleTime: {
    set: jest.fn().mockResolvedValue(null)
  }
}))
jest.mock('@sx/analyze/analyze-story-description', () => {
  return {
    analyzeStoryDescription: jest.fn().mockResolvedValue(null)
  }
})

jest.mock('@sx/notes/notes-button', () => {
  return {
    NotesButton: jest.fn().mockImplementation(() => {
    })
  }
})
jest.mock('@sx/keyboard-shortcuts/keyboard-shortcuts', () => {
  return {
    KeyboardShortcuts: jest.fn().mockImplementation(() => {
      return {
        activate: jest.fn()
      }
    })
  }
})
jest.mock('@sx/todoist/todoist', () => {
  return {
    Todoist: {
      setTaskButtons: jest.fn().mockResolvedValue(null)
    }
  }
})


jest.mock('@sx/utils/get-synced-setting', () => ({
  getSyncedSetting: jest.fn().mockResolvedValue(true)
}))
const mockedGetSyncedSetting = getSyncedSetting as jest.MockedFunction<typeof getSyncedSetting>

jest.mock('@sx/utils/log-error', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-state', () => jest.fn())
jest.mock('@sx/keyboard-shortcuts/change-iteration', () => jest.fn())
jest.mock('@sx/utils/sleep', () => jest.fn().mockResolvedValue(null))


describe('activate function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Story, 'isReady').mockResolvedValue(true)
  })
  it('should activate features', async () => {
    const developmentTime = jest.spyOn(DevelopmentTime, 'set').mockResolvedValue()
    const cycleTime = jest.spyOn(CycleTime, 'set').mockResolvedValue()
    const addButtons = jest.spyOn(AiFunctions.prototype, 'addButtons').mockResolvedValue()

    await activate()

    expect(Story.isReady).toHaveBeenCalled()
    expect(developmentTime).toHaveBeenCalled()
    expect(cycleTime).toHaveBeenCalled()
    expect(addButtons).toHaveBeenCalled()
  })
})

describe('handleMessage function', () => {
  const originalLocation = window.location

  beforeEach(() => {
    jest.spyOn(Story, 'isReady').mockResolvedValue(true)
    interface MockLocation extends Location {
    }

    const mockLocation: Partial<MockLocation> = {
      href: 'https://example.com/story',
      assign: jest.fn(),
      reload: jest.fn()
    }
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    window.location = originalLocation
  })


  it('calls analyzeStoryDescription for analyzeStoryDescription message', async () => {
    const request = { message: 'analyzeStoryDescription', url: '' }
    await handleMessage(request)
    expect(analyzeStoryDescription).toHaveBeenCalledWith('https://example.com/story')
  })

  it('initializes on update message', async () => {
    // const spy = jest.spyOn(AiFunctions.prototype, 'addButtons')
    mockedGetSyncedSetting.mockResolvedValue(true)
    const request = { message: 'update', url: 'https://example.com/story' }
    await handleMessage(request)
    expect(DevelopmentTime.set).toHaveBeenCalled()
    expect(CycleTime.set).toHaveBeenCalled()
    expect(NotesButton).toHaveBeenCalled()
    expect(Todoist.setTaskButtons).toHaveBeenCalled()
  })

  it('calls changeState for change-state message', async () => {
    const request = { message: 'change-state', url: 'https://example.com/story' }
    await handleMessage(request)
    expect(changeState).toHaveBeenCalled()
  })

  it('calls changeIteration for change-iteration message', async () => {
    const request = { message: 'change-iteration', url: 'https://example.com/story' }
    await handleMessage(request)
    expect(changeIteration).toHaveBeenCalled()
  })
})
