import OpenAI from 'openai'
import {Chat} from 'openai/resources'

import {AiPromptType} from '@sx/analyze/types/ai-prompt-type'
import {AiProcessMessage, AiProcessMessageType} from '@sx/analyze/types/AiProcessMessage'

import getOpenAiToken from './get-openai-token'
import PROMPT from './prompt'

import ChatCompletionMessageParam = Chat.ChatCompletionMessageParam


const BREAKUP_PROMPT = 'You are a Senior Engineering Manager who is assisting team members with taking' +
  ' a large user story and breaking it up into smaller  more approachable (from an engineering work' +
  ' perspective) stories and subtasks. ' +
  '' +
  'Only respond with new stories, structured/formatted like the one the user gave you.' +
  ' Do not be verbose. Do not include story titles. Separate all stories you create with `---`.'

const promptTypes:  Record<AiPromptType, string> = {
  breakup: BREAKUP_PROMPT,
  analyze: PROMPT
}

export async function fetchCompletion(description: string, type: AiPromptType, tabId: number) {
  const openAIToken = await getOpenAiToken()
  const openai = new OpenAI({apiKey: openAIToken})
  const messages: ChatCompletionMessageParam[] = [{role: 'system', content: promptTypes[type]},
    {role: 'user', content: description}]
  const stream = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-turbo-preview',
    stream: true
  })
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    const data = {content, type}
    chrome.tabs.sendMessage(tabId, {type: AiProcessMessageType.updated, data} as AiProcessMessage)
  }
  chrome.runtime.sendMessage({type: AiProcessMessageType.completed, message: type} as AiProcessMessage)
}
