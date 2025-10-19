import React, { useState, useEffect } from 'react'

import { analyzeStoryReact } from '@/bridge'
import { Button } from '@/client/components/ui/button'
import { useStoryContext } from '@/client/contexts/story-context'
import { ScrollArea } from '@/components/ui/scroll-area'


type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

interface ReactAIStreamMessage {
  type: 'react-ai-stream'
  requestId: string
  status: 'streaming' | 'completed' | 'error'
  content?: string
  error?: string
  analysisType: 'analyze' | 'breakup'
}

interface AnalyzeStoryModalProps {
  onClose?: () => void
  analysisType: 'analyze' | 'breakup'
}

function AnalyzeStoryModal({ onClose, analysisType }: AnalyzeStoryModalProps): React.ReactElement {
  const { story } = useStoryContext()
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)

  // Auto-start analysis when component mounts
  useEffect(() => {
    handleAnalyzeStory()
  }, [])

  useEffect(() => {
    // Subscribe to React-specific AI streaming results
    const subscribeToReactAIResults = (window as Window & { __subscribeToReactAIResults?: (callback: (message: ReactAIStreamMessage) => void) => () => void }).__subscribeToReactAIResults
    if (!subscribeToReactAIResults) {
      return
    }

    const unsubscribe = subscribeToReactAIResults((message: ReactAIStreamMessage) => {
      // Only handle messages for our current request and analysis type
      if (message.requestId === currentRequestId && message.analysisType === analysisType) {
        if (message.status === 'streaming') {
          // Set the complete accumulated content from the message
          setStreamingContent(message.content || '')
        }
        else if (message.status === 'completed') {
          setAnalysisStatus('success')
          // Set the final complete content
          setStreamingContent(message.content || '')
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        else if (message.status === 'error') {
          setAnalysisStatus('error')
          setError(message.error || 'Analysis failed')
        }
      }
    })

    return unsubscribe
  }, [analysisType, currentRequestId])

  async function handleAnalyzeStory(): Promise<void> {
    if (!story.description) {
      setError('No story description available to analyze')
      return
    }

    setAnalysisStatus('loading')
    setError(null)
    setStreamingContent('')

    // Generate requestId before making the call to avoid timing issues
    const timestamp = Date.now()
    const requestId = `react-${analysisType}-${timestamp}`
    setCurrentRequestId(requestId)

    try {
      const response = await analyzeStoryReact(story.description || '', analysisType, timestamp)
      if (!response.success) {
        setError(response.error || 'Failed to start analysis')
        setAnalysisStatus('error')
        setCurrentRequestId(null)
      }
      // Success case: requestId is already set, wait for streaming results
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze story')
      setAnalysisStatus('error')
      setCurrentRequestId(null)
    }
  }

  function handleClose(): void {
    if (onClose) {
      onClose()
    }
  }

  const getButtonText = (): string => {
    switch (analysisStatus) {
    case 'loading': return analysisType === 'analyze' ? 'Analyzing...' : 'Breaking Up...'
    case 'success': return analysisType === 'analyze' ? 'Analyze Again' : 'Break Up Again'
    case 'error': return 'Retry'
    default: return analysisType === 'analyze' ? 'Analyze Story' : 'Break Up Story'
    }
  }

  const getTitle = (): string => {
    return analysisType === 'analyze' ? 'Analyze Story' : 'Break Up Story'
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-200 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col h-full space-y-4 flex-1 min-h-0">
        <Button
          onClick={handleAnalyzeStory}
          disabled={analysisStatus === 'loading' || !story.description}
        >
          {getButtonText()}
        </Button>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-md p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {(streamingContent || analysisStatus === 'loading') && (
          <div className="bg-gray-800 border border-gray-600 rounded-md p-4 space-y-3 flex flex-col flex-1 min-h-0">
            <h4 className="text-sm font-medium text-gray-200">
              {analysisType === 'analyze' ? 'Analysis Results' : 'Breakdown Results'}
            </h4>
            <ScrollArea
              className="text-sm text-gray-300 whitespace-pre-wrap pr-2 pb-8 min-h-[100px] h-72"
            >
              {streamingContent || (analysisStatus === 'loading' && 'Processing...')}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}

export { AnalyzeStoryModal }
