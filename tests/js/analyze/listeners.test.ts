import { AiFunctions } from '@sx/analyze/ai-functions'
import handleMessages from '@sx/analyze/listeners'
import { AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'


describe('handleMessages', () => {
  it('should return if message status is not defined', async () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const result = await handleMessages({})
    expect(result).toBeUndefined()
  })

  it.each([
    AiProcessMessageType.updated,
    AiProcessMessageType.completed,
    AiProcessMessageType.failed
  ])('should process OpenAI response if message status is %s', async (status) => {
    const message = {
      status,
      data: { content: '', type: 'analyze' }
    }
    const spy = jest.spyOn(AiFunctions.prototype, 'processOpenAIResponse')
    spy.mockImplementation(async (): Promise<void> => {})
    jest.spyOn(AiFunctions, 'analysisComplete')
    await handleMessages(message)
    expect(spy).toHaveBeenCalledWith(message)
  })
})
