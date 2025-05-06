import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'

import PROMPT from './prompt'


const BREAKUP_PROMPT = 'You are a Senior Engineering Manager who is assisting team members with taking'
  + ' a large user story and breaking it up into smaller  more approachable (from an engineering work'
  + ' perspective) stories and subtasks. '
  + ''
  + 'Only respond with new stories, structured/formatted like the one the user gave you.'
  + ' Do not be verbose. Do not include story titles. Separate all stories you create with `---`.'

const promptTypes: Record<AiPromptType, string> = {
  breakup: BREAKUP_PROMPT,
  analyze: PROMPT
}

export async function fetchCompletion(description: string, type: AiPromptType, tabId: number, token: string): Promise<void> {
  const openai = new OpenAI({ apiKey: token })
  const messages: ChatCompletionMessageParam[] = [{ role: 'system', content: promptTypes[type] },
    { role: 'user', content: description }]
  const stream = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-turbo-preview',
    stream: true
  })
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    const data = { content, type }
    // TODO: Not awaiting here could be the cause of the issue where message content is misplaced
    chrome.tabs.sendMessage(tabId, { status: AiProcessMessageType.updated, data } as AiProcessMessage)
  }
  chrome.runtime.sendMessage({ status: AiProcessMessageType.completed, message: type } as AiProcessMessage)
}
