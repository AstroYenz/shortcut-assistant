import { Story } from '@sx/utils/story'


export async function analyzeStoryDescription(activeTabUrl: string): Promise<void> {
  if (activeTabUrl.includes('story')) {
    const description = Story.description
    await chrome.runtime.sendMessage({
      action: 'callOpenAI',
      data: { prompt: description }
    })
  }
}
