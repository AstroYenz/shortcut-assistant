import { useState, useEffect } from 'react'

import { TASK_MESSAGES } from '../constants'


type TaskStatus = 'idle' | 'loading' | 'success' | 'error'

interface ReactAIStreamMessage {
    type: 'react-ai-stream'
    requestId: string
    status: 'streaming' | 'completed' | 'error'
    content?: string
    error?: string
    analysisType: 'analyze' | 'breakup'
}

interface UseTaskStreamingResult {
    taskStatus: TaskStatus
    streamingContent: string
    error: string | null
    currentRequestId: string | null
    setTaskStatus: (status: TaskStatus) => void
    setStreamingContent: (content: string) => void
    setError: (error: string | null) => void
    setCurrentRequestId: (id: string | null) => void
}

function useTaskStreaming(taskType: 'analyze' | 'breakup'): UseTaskStreamingResult {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('idle')
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)

  useEffect(() => {
    const subscribeToReactAIResults = (window as Window & {
            __subscribeToReactAIResults?: (callback: (message: ReactAIStreamMessage) => void) => () => void
        }).__subscribeToReactAIResults

    if (!subscribeToReactAIResults) {
      return
    }

    const unsubscribe = subscribeToReactAIResults((message: ReactAIStreamMessage) => {
      // Only handle messages for our current request and task type
      if (message.requestId === currentRequestId && message.analysisType === taskType) {
        if (message.status === 'streaming') {
          // Set the complete accumulated content from the message
          setStreamingContent(message.content || '')
        }
        if (message.status === 'completed') {
          setTaskStatus('success')
          // Set the final complete content
          setStreamingContent(message.content || '')
        }
        if (message.status === 'error') {
          setTaskStatus('error')
          setError(message.error || TASK_MESSAGES.TASK_FAILED)
        }
      }
    })

    return unsubscribe
  }, [taskType, currentRequestId])

  return {
    taskStatus,
    streamingContent,
    error,
    currentRequestId,
    setTaskStatus,
    setStreamingContent,
    setError,
    setCurrentRequestId
  }
}

export { useTaskStreaming }
export type { TaskStatus }
