import { DevelopmentTime } from '@sx/development-time/development-time'
import { Story } from '@sx/utils/story'


jest.mock('@sx/workspace/workspace', () => {
  class MockWorkspace {
    async activate() {
      await MockWorkspace.states()
    }

    // eslint-disable-next-line @typescript-eslint/require-await
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


describe('DevelopmentTime.setTimeSpan', () => {
  beforeEach(() => {
    document.createElement = jest.fn().mockReturnValue(document.createElement('span'))
    jest.clearAllMocks()
    jest.spyOn(Story, 'isReady').mockResolvedValue(true)
  })

  it('throws an error if Story.state is not found', () => {
    jest.spyOn(Story, 'state', 'get').mockReturnValue(null)
    const ONE_DAY = 24
    expect(() => {
      DevelopmentTime.setTimeSpan(ONE_DAY)
    }).toThrow('Story state span not found')
  })

  it('appends a correctly formatted time span for positive hours', () => {
    const mockElement = { appendChild: jest.fn() } as unknown as HTMLElement
    jest.spyOn(Story, 'state', 'get').mockReturnValue(mockElement)
    const hoursElapsed = 48 // 2 days
    DevelopmentTime.setTimeSpan(hoursElapsed)
    // @ts-expect-error - TS doesn't know about mockElement
    const timeSpan = mockElement.appendChild.mock.calls[0][0]
    expect(timeSpan.innerHTML).toBe(' (2.00 days)')
  })

  it('appends a correctly formatted time span for negative hours', () => {
    const mockElement = { appendChild: jest.fn() } as unknown as HTMLElement
    jest.spyOn(Story, 'state', 'get').mockReturnValue(mockElement)
    const hoursElapsed = -72 // -3 days, but should be 3 days after abs
    DevelopmentTime.setTimeSpan(hoursElapsed)
    // @ts-expect-error - TS doesn't know about mockElement
    const timeSpan = mockElement.appendChild.mock.calls[0][0]
    expect(timeSpan.innerHTML).toBe(' (3.00 days)')
  })

  it('appends a correctly formatted time span for zero hours', () => {
    const mockElement = { appendChild: jest.fn() } as unknown as HTMLElement
    jest.spyOn(Story, 'state', 'get').mockReturnValue(mockElement)
    const hoursElapsed = 0
    DevelopmentTime.setTimeSpan(hoursElapsed)
    // @ts-expect-error - TS doesn't know about mockElement
    const timeSpan = mockElement.appendChild.mock.calls[0][0]
    expect(timeSpan.innerHTML).toBe(' (0.00 days)')
  })
})


describe('DevelopmentTime.remove', () => {
  const mockTimeSpan = { remove: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    document.querySelector = jest.fn().mockImplementation(() => mockTimeSpan)
    jest.spyOn(Story, 'isReady').mockResolvedValue(true)
  })

  it('removes the time span', () => {
    DevelopmentTime.remove()
    expect(mockTimeSpan.remove).toHaveBeenCalled()
  })

  it('does not remove the time span if it does not exist', () => {
    document.querySelector = jest.fn().mockImplementation(() => null)
    DevelopmentTime.remove()
    expect(mockTimeSpan.remove).not.toHaveBeenCalled()
  })
})

describe('DevelopmentTime.set', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(Story, 'isInState').mockResolvedValue(false)
    jest.spyOn(Story, 'getTimeInState').mockReturnValue(0)
    jest.spyOn(Story, 'isReady').mockResolvedValue(true)

    jest.spyOn(DevelopmentTime, 'setTimeSpan').mockImplementation(() => {
    })
  })

  it('calls setTimeSpan with hours from In Development state', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    jest.spyOn(Story, 'isInState').mockImplementation(async state => state === 'Started')
    jest.spyOn(Story, 'getTimeInState').mockReturnValue(24)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).toHaveBeenCalledWith(24)
  })

  it('does not call setTimeSpan with hours if hours are null', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    jest.spyOn(Story, 'isInState').mockImplementation(async state => state === 'Started')
    jest.spyOn(Story, 'getTimeInState').mockReturnValue(null)

    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).not.toHaveBeenCalled()
  })

  it('does not call setTimeSpan when not in Development or Review state', async () => {
    await DevelopmentTime.set()

    expect(DevelopmentTime.setTimeSpan).not.toHaveBeenCalled()
  })
})
