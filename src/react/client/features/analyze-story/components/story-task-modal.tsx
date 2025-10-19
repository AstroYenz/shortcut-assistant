import React from 'react'


import { TASK_MESSAGES } from '../constants'
import { useTaskStreaming } from '../hooks/use-task-streaming'
import { getButtonText, getTitle, generateRequestId } from '../utils/task-utils'

import { ErrorAlert } from './error-alert'
import { TaskResultsCard } from './task-results-card'

import { analyzeStoryReact } from '@/bridge'
import { Button } from '@/client/components/ui/button'
import { useStoryContext } from '@/client/contexts/story-context'
import { cn } from '@/client/lib/utils/cn'


interface StoryTaskModalProps {
  onClose?: () => void
  taskType: 'analyze' | 'breakup'
}

function StoryTaskModal({ onClose, taskType }: StoryTaskModalProps): React.ReactElement {
  const { story } = useStoryContext()
  const {
    taskStatus,
    streamingContent,
    error,
    setTaskStatus,
    setStreamingContent,
    setError,
    setCurrentRequestId
  } = useTaskStreaming(taskType)

  async function handleExecuteTask(): Promise<void> {
    if (!story.description) {
      setError(TASK_MESSAGES.NO_DESCRIPTION)
      return
    }

    setTaskStatus('loading')
    setError(null)
    setStreamingContent('')

    // Generate requestId before making the call to avoid timing issues
    const timestamp = Date.now()
    const requestId = generateRequestId(taskType, timestamp)
    setCurrentRequestId(requestId)

    try {
      const response = await analyzeStoryReact(story.description, taskType, timestamp)
      if (!response.success) {
        setError(response.error || 'Failed to start task')
        setTaskStatus('error')
        setCurrentRequestId(null)
      }
      // Success case: requestId is already set, wait for streaming results
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute task')
      setTaskStatus('error')
      setCurrentRequestId(null)
    }
  }

  function handleClose(): void {
    if (onClose) {
      onClose()
    }
  }

  const title = getTitle(taskType)
  const buttonText = getButtonText(taskStatus, taskType)
  const showResults = streamingContent || taskStatus === 'loading'

  return (
    <div className="flex flex-col h-full max-h-full space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-200 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        <div className="flex-shrink-0">
          <Button
            onClick={handleExecuteTask}
            disabled={taskStatus === 'loading' || !story.description}
            className={cn({
              'bg-green-600': taskStatus === 'success',
              'bg-red-600': taskStatus === 'error'
            })}
          >
            {buttonText}
          </Button>

          {error && <ErrorAlert error={error} />}
        </div>

        {showResults && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <TaskResultsCard
              taskType={taskType}
              taskStatus={taskStatus}
              streamingContent={streamingContent}
              className="flex-1 min-h-0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { StoryTaskModal }
