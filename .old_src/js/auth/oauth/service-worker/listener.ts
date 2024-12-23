import registerUser from '@sx/auth/oauth/service-worker/registration'
import IpcRequest from '@sx/types/ipc-request'


chrome.runtime.onMessage.addListener((request: IpcRequest) => {
  if (request.action === 'saveUserToken') {
    registerUser(request.data.googleToken, request.data.shortcutToken)
  }
})
