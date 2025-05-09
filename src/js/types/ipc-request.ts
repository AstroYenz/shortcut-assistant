import { AiPromptType } from '@sx/analyze/types/ai-prompt-type'


type IpcAction = 'callOpenAI' | 'getSavedNotes' | 'sendEvent' | 'saveUserToken' | 'addLabels' | 'initiateGoogleOAuth' | 'processShortcutApiToken'

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

interface IpcRequestInitiateGoogleOAuth extends IpcRequestBase {
  action: 'initiateGoogleOAuth'
  data: Record<string, never>
}

interface IpcRequestProcessShortcutApiToken extends IpcRequestBase {
  action: 'processShortcutApiToken'
  data: { shortcutToken: string }
}

type IpcRequest =
  | IpcRequestSendEvent
  | IpcRequestCallOpenAI
  | IpcRequestGetSavedNotes
  | IpcRequestSaveUserToken
  | IpcRequestInitiateGoogleOAuth
  | IpcRequestProcessShortcutApiToken

export default IpcRequest
export {
  IpcAction,
  IpcRequestBase,
  IpcRequestCallOpenAI,
  IpcRequestGetSavedNotes,
  IpcRequestSaveUserToken,
  IpcRequestSendEvent,
  IpcRequestInitiateGoogleOAuth,
  IpcRequestProcessShortcutApiToken
}
