import { BUTTON_TEXTS, TITLES } from '../constants'
import type { TaskStatus } from '../hooks/use-task-streaming'


function getButtonText(taskStatus: TaskStatus, taskType: 'analyze' | 'breakup'): string {
  const texts = taskType === 'analyze' ? BUTTON_TEXTS.ANALYZE : BUTTON_TEXTS.BREAKUP

  switch (taskStatus) {
  case 'loading': return texts.LOADING
  case 'success': return texts.SUCCESS
  case 'error': return texts.ERROR
  default: return texts.IDLE
  }
}

function getTitle(taskType: 'analyze' | 'breakup'): string {
  return taskType === 'analyze' ? TITLES.ANALYZE : TITLES.BREAKUP
}

function generateRequestId(taskType: 'analyze' | 'breakup', timestamp?: number): string {
  const time = timestamp || Date.now()
  return `react-${taskType}-${time}`
}

export { getButtonText, getTitle, generateRequestId }
