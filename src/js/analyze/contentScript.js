import {logError} from '../utils/logError'
import {sleep} from '../utils/sleep'


export class CommentBox{
    static resizeToFitContent(textarea){
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }

    static async getCommentBox(){
        const commentBox = document.querySelector('.textfield')
        let inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]')
        if (commentBox && !inputFieldParent) {
            commentBox.click()
            await sleep(100)
            inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]')
        }
        return inputFieldParent
    }

    static async populate(text){
        if (text === undefined) {
            return
        }

        const commentBox = await this.getCommentBox()
        const content = '✨ Generated by Story Readiness Assistant GPT ✨\n\n'
        if (!commentBox.value.includes(content)) {
            commentBox.value = content
        }
        commentBox.value = commentBox.value + text
        this.resizeToFitContent(commentBox)
    }

    static async clear(){
        const commentBox = await this.getCommentBox()
        commentBox.value = ''
        this.resizeToFitContent(commentBox)
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'updateOpenAiResponse') {
        if (request.data !== undefined) {
            CommentBox.populate(request.data).catch(logError)
        }
    }
    if (request.type === 'OpenAIResponseFailed') {
        CommentBox.clear().catch(logError)
    }
})
