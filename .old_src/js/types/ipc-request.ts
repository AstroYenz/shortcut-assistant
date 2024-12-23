import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'


type IpcAction = 'callOpenAI' | 'getSavedNotes' | 'sendEvent' | 'saveUserToken' | 'addLabels'

interface IpcRequestBase {
  action: IpcAction
  message?: string
}

interface IpcRequestSendEvent extends IpcRequestBase {
  action: 'sendEvent'
  data: { eventName: string, params?: Record<string, string> }
}

interface IpcRequestCallOpenAI extends IpcRequestBase {
  action: 'callOpenAI'
  data: { prompt: string, type: AiPromptType }
}

interface IpcRequestGetSavedNotes extends IpcRequestBase {
  action: 'getSavedNotes'
}

interface IpcRequestSaveUserToken extends IpcRequestBase {
  action: 'saveUserToken'
  data: { googleToken: string, shortcutToken: string }
}

type IpcRequest = IpcRequestSendEvent | IpcRequestCallOpenAI | IpcRequestGetSavedNotes | IpcRequestSaveUserToken

export default IpcRequest
export { IpcAction, IpcRequestBase, IpcRequestCallOpenAI, IpcRequestGetSavedNotes, IpcRequestSaveUserToken, IpcRequestSendEvent }
