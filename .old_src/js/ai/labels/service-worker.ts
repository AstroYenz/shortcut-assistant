import getHeaders from '@sx/auth/headers'
import { OpenAIError } from '@sx/utils/errors'
import { Story } from '@sx/utils/story'


class LabelsServiceWorker {
  public static async requestLabels(): Promise<void> {
    const storyId = await Story.id()
    let response: Response
    const headers = await getHeaders()
    try {
      const baseUrl = process.env.PROXY_URL
      if (!baseUrl) {
        throw new OpenAIError('PROXY_URL is not set')
      }

      const url = `${baseUrl}/labels`

      response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          storyId: storyId
        }),
        headers: headers
      })
    }
    catch (e) {
      throw new OpenAIError(`Error getting completion from proxy: ${e as string}`)
    }

    if (!response.ok) {
      throw new OpenAIError(`Proxy response was not ok. Status: ${response.status} ${response.statusText}`)
    }
  }
}

export default LabelsServiceWorker
