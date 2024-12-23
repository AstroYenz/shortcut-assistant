import sleep from '../../.old_src/js/utils/sleep'


describe('sleep function', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should complete after the specified time using fake timers', async () => {
    const ms = 1000
    const promise = sleep(ms)

    jest.advanceTimersByTime(ms)

    await expect(promise).resolves.toBeUndefined()

    expect(jest.getTimerCount()).toBe(0)
  })
})
