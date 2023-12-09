
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function extractStoryDescription() {
    const descriptionDiv = document.querySelector('[data-key="description"]');
    return descriptionDiv.textContent
}

async function callOpenAI(description) {
    chrome.runtime.sendMessage({action: 'callOpenAI', data: { prompt: description }}, response => {
    });
}
function resizeTextareaToFitContent(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

chrome.runtime.onMessage.addListener(
async function (request, sender, sendResponse) {
    const activeTabUrl = window.location.href
    if (request.message === 'analyzeStoryDescription') {
        if (activeTabUrl.includes('story')) {
            const description = extractStoryDescription()
            chrome.runtime.sendMessage({action: 'callOpenAI', data: { prompt: description }});
        }
    }
    if (request.message === 'setOpenAiResponse') {
        const commentBox = document.querySelector('.textfield');
        if (commentBox) {
            commentBox.click()
            sleep(100)
            const inputFieldParent = document.querySelector('[data-on-mouseup="App.Controller.Comment.handleOnMouseUp"]');
            inputFieldParent.value = '✨ Generated by Story Readiness Assistant GPT ✨\n\n' + request.data;
            resizeTextareaToFitContent(inputFieldParent)
        }

    }
});
