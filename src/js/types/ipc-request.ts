type IpcAction = 'reactCallOpenAI' | 'getSavedNotes' | 'sendEvent' | 'saveUserToken' | 'addLabels' | 'initiateGoogleOAuth' | 'processShortcutApiToken'

interface IpcRequestBase {
  action: IpcAction
  message?: string
}

interface IpcRequestSendEvent extends IpcRequestBase {
  action: 'sendEvent'
  data: { eventName: string, params?: Record<string, string> }
}

interface IpcRequestReactCallOpenAI extends IpcRequestBase {
  action: 'reactCallOpenAI'
  data: { prompt: string, type: string, requestId: string }
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
  | IpcRequestReactCallOpenAI
  | IpcRequestGetSavedNotes
  | IpcRequestSaveUserToken
  | IpcRequestInitiateGoogleOAuth
  | IpcRequestProcessShortcutApiToken

export default IpcRequest
export {
  IpcAction,
  IpcRequestBase,
  IpcRequestReactCallOpenAI,
  IpcRequestGetSavedNotes,
  IpcRequestSaveUserToken,
  IpcRequestSendEvent,
  IpcRequestInitiateGoogleOAuth,
  IpcRequestProcessShortcutApiToken
}
