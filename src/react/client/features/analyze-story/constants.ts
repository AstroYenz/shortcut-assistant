export const PREVIEW_TEXT_LENGTH = 150
export const CONTENT_PREVIEW_LENGTH = 100
export const MIN_RESULTS_HEIGHT = 100
export const MAX_RESULTS_HEIGHT = 384 // max-h-96 equivalent (24rem * 16px = 384px)

export const TASK_MESSAGES = {
  NO_DESCRIPTION: 'No story description available to process',
  TASK_FAILED: 'Task failed',
  PROCESSING: 'Processing...',
  NO_DESCRIPTION_AVAILABLE: 'No description available',
  UNTITLED_STORY: 'Untitled Story'
} as const

export const BUTTON_TEXTS = {
  ANALYZE: {
    IDLE: 'Analyze Story',
    LOADING: 'Analyzing...',
    SUCCESS: 'Analyze Again',
    ERROR: 'Retry'
  },
  BREAKUP: {
    IDLE: 'Break Up Story',
    LOADING: 'Breaking Up...',
    SUCCESS: 'Break Up Again',
    ERROR: 'Retry'
  }
} as const

export const TITLES = {
  ANALYZE: 'Analyze Story',
  BREAKUP: 'Break Up Story'
} as const

export const RESULTS_TITLES = {
  ANALYZE: 'Analysis Results',
  BREAKUP: 'Breakdown Results'
} as const
