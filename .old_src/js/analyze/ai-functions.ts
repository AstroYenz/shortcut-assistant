import { sendEvent } from '@sx/analytics/event'
import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'
import { AiProcessMessage, AiProcessMessageType } from '@sx/analyze/types/AiProcessMessage'
import '@sx/analyze/listeners'
import sleep from '@sx/utils/sleep'
import { Story } from '@sx/utils/story'


interface AiFeature {
  name: string
  key: AiPromptType
  description: string
  clickFunc: () => Promise<void>
  callbackFunc: () => Promise<void>
}

export class AiFunctions {
  static features: Record<AiPromptType, AiFeature> = {
    analyze: {
      name: 'Analyze',
      key: 'analyze',
      description: 'Analyze the story details to get a better understanding of the story.',
      clickFunc: AiFunctions.triggerAnalysis,
      callbackFunc: AiFunctions.analysisComplete
    },
    breakup: {
      name: 'Break Up',
      key: 'breakup',
      description: 'Break up the story into smaller tasks.',
      clickFunc: AiFunctions.triggerBreakUp,
      callbackFunc: AiFunctions.breakupComplete
    },
  }

  public static buttons: Partial<Record<AiPromptType, HTMLButtonElement>> = {}

  static createButton(feature: AiFeature): HTMLButtonElement {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = feature.description
    newButton.dataset.key = feature.key
    newButton.tabIndex = 2
    newButton.style.marginTop = '10px'
    newButton.setAttribute(`data-${feature.key}`, 'true')
    newButton.addEventListener('click', async function () {
      await feature.clickFunc()
    })
    newButton.textContent = feature.name
    return newButton
  }

  public async addButtons(): Promise<void> {
    const story = new Story()
    for (const feature of Object.values(AiFunctions.features)) {
      const newButton = AiFunctions.createButton(feature)
      AiFunctions.buttons[feature.key] = newButton
      try {
        await story.addButton(newButton, feature.key)
      }
      catch (e) {
        console.error(e)
      }
    }
  }

  static async triggerAnalysis(): Promise<void> {
    const functions = new AiFunctions()
    AiFunctions.buttons.analyze!.textContent = 'Analyzing...'
    await functions.analyzeStoryDescription(window.location.href, 'analyze')
  }

  static async triggerBreakUp(): Promise<void> {
    const functions = new AiFunctions()
    AiFunctions.buttons.breakup!.textContent = 'Breaking Up...'
    await functions.analyzeStoryDescription(window.location.href, 'breakup')
  }

  private async analyzeStoryDescription(activeTabUrl: string, type: AiPromptType): Promise<void> {
    if (activeTabUrl.includes('story')) {
      const description = Story.description
      await chrome.runtime.sendMessage({
        action: 'callOpenAI',
        data: { prompt: description, type }
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  static async analysisComplete(): Promise<void> {
    AiFunctions.buttons.analyze!.textContent = AiFunctions.features.analyze.name
    AiFunctions.buttons.analyze!.classList.remove('cursor-progress')
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  static async breakupComplete(): Promise<void> {
    AiFunctions.buttons.breakup!.textContent = AiFunctions.features.breakup.name
    AiFunctions.buttons.breakup!.classList.remove('cursor-progress')
  }

  private async handleFailure(): Promise<void> {
    const errorState = document.getElementById('errorState')
    if (errorState) {
      errorState.style.cssText = ''
      const SIX_SECONDS = 6000
      await sleep(SIX_SECONDS)
      errorState.style.display = 'none'
    }
    sendEvent('ai_request_failed').catch((e) => {
      console.error(e)
    })
  }

  public async processOpenAIResponse(message: AiProcessMessage): Promise<void> {
    if (message.status === AiProcessMessageType.completed || message.status === AiProcessMessageType.failed) {
      if (!message.data) {
        return
      }
      const feature = AiFunctions.features[message.data.type]
      await feature.callbackFunc()
    }
    if (message.status === AiProcessMessageType.failed) {
      await this.handleFailure()
    }
  }
}
