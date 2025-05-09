import { logError } from '@sx/utils/log-error'


describe('logError', () => {
  it('logs the error using console.error', () => {
    console.error = jest.fn()

    const error = new Error('An error occurred!')

    logError(error)

    expect(console.error).toHaveBeenCalledWith(error)
  })
})
