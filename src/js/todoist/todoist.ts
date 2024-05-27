import { forEach, kebabCase } from 'lodash'

import { logError } from '@sx/utils/log-error'
import { Story } from '@sx/utils/story'


export class Todoist {
  static tasks = {
    'Work on': 'Set task to work on story',
    'Review': 'Set task to review story',
    'Follow up': 'Set task to follow up on story'
  }

  static createButton(tooltip: string, title: string) {
    const newButton = document.createElement('button')
    newButton.className = 'action edit-description add-task micro flat-white'
    newButton.dataset.tabindex = ''
    newButton.dataset.tooltip = tooltip
    newButton.dataset.key = title
    newButton.tabIndex = 2
    newButton.style.marginTop = '10px'
    newButton.setAttribute('data-todoist', 'true')
    const titleAttribute = `data-${kebabCase(title)}`
    newButton.setAttribute(titleAttribute, 'true')
    return newButton
  }

  static createTooltipText(taskTitle: string | null, title: string) {
    const storyTitle = Story.title
    const storyLink = window.location.href
    if (!taskTitle) {
      return `${title} [${storyTitle}](${storyLink})`
    }
    else {
      return `${taskTitle} [${storyTitle}](${storyLink})`
    }
  }

  static buttonExists() {
    return document.querySelector('button[data-todoist="true"]')
  }

  static async setTaskButton(title: string, tooltip: string, taskTitle: string | null = null) {
    const newButton = Todoist.createButton(tooltip, title)
    taskTitle = Todoist.createTooltipText(taskTitle, title)
    newButton.addEventListener('click', function () {
      window.open(`https://todoist.com/add?content=${taskTitle}`, '_blank')
    })
    const span = document.createElement('span')

    span.className = 'fa fa-plus'
    newButton.appendChild(span)
    newButton.append(' ' + title + '   ')

    const story = new Story()
    await story.addButton(newButton, kebabCase(title))
  }

  static async setTaskButtons() {
    if (Todoist.buttonExists()) return
    forEach(Todoist.tasks, (tooltip, title) => {
      Todoist.setTaskButton(title, tooltip).catch(logError)
    })
  }
}
