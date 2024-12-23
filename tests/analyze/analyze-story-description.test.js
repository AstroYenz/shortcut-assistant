import {analyzeStoryDescription} from '../../.old_src/js/analyze/analyze-story-description'
import {Story} from '../../.old_src/js/utils/story'


jest.mock('../../.old_src/js/utils/story')


describe('analyzeStoryDescription function', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls chrome.runtime.sendMessage with proper data if the url includes "story"', async () => {
    const testUrl = 'http://app.shortcut.com/story/123'

    await analyzeStoryDescription(testUrl)

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'callOpenAI',
      data: {prompt: Story.description}
    })
  })

  it('does not call chrome.runtime.sendMessage if the url does not include "story"', async () => {
    const testUrl = 'http://app.shortcut.com/other'

    await analyzeStoryDescription(testUrl)

    expect(global.chrome.runtime.sendMessage).not.toHaveBeenCalled()
  })
})
