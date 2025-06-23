import React, { useState, useEffect } from 'react'

import { analyzeStoryReact } from '@/bridge'
import { Button } from '@/client/components/ui/button'
import { useStoryContext } from '@/client/contexts/story-context'
import { cn } from '@/client/lib/utils/cn'


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

  useEffect(() => {
    // Subscribe to React-specific AI streaming results
    const subscribeToReactAIResults = (window as Window & { __subscribeToReactAIResults?: (callback: (message: ReactAIStreamMessage) => void) => () => void }).__subscribeToReactAIResults
    if (!subscribeToReactAIResults) {
      console.log('❌ __subscribeToReactAIResults not found on window')
      return
    }

    console.log('🔔 Setting up React AI results subscription')
    const unsubscribe = subscribeToReactAIResults((message: ReactAIStreamMessage) => {
      console.log('📨 React component received message:', message)
      console.log('🎯 Current requestId:', currentRequestId, 'Message requestId:', message.requestId)
      console.log('🏷️ Analysis type match:', analysisType, 'vs', message.analysisType)

      // Only handle messages for our current request and analysis type
      if (message.requestId === currentRequestId && message.analysisType === analysisType) {
        console.log('✅ Message matches current request - processing...')
        if (message.status === 'streaming') {
          console.log('📝 Setting streaming content:', message.content?.substring(0, 100) + '...')
          // Set the complete accumulated content from the message
          setStreamingContent(message.content || '')
        }
        else if (message.status === 'completed') {
          console.log('🎉 Analysis completed')
          setAnalysisStatus('success')
          // Set the final complete content
          setStreamingContent(message.content || '')
        }
        else if (message.status === 'error') {
          console.log('💥 Analysis error:', message.error)
          setAnalysisStatus('error')
          setError(message.error || 'Analysis failed')
        }
      }
      else {
        console.log('⏭️ Message does not match current request - ignoring')
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
    console.log('🎯 Setting requestId before API call:', requestId)
    setCurrentRequestId(requestId)

    try {
      console.log('story.description', story.description)
      const response = await analyzeStoryReact(story.description, analysisType, timestamp)
      console.log('response', response)
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
    <div className="space-y-6">
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

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Story Details</h3>
          <div className="bg-gray-800 p-3 rounded-md">
            <p className="text-sm font-medium text-white">{story.title || 'Untitled Story'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {story.description?.substring(0, 150) || 'No description available'}
              {story.description && story.description.length > 150 && '...'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAnalyzeStory}
          disabled={analysisStatus === 'loading' || !story.description}
          className={cn({
            'bg-green-600': analysisStatus === 'success',
            'bg-red-600': analysisStatus === 'error'
          })}
        >
          {getButtonText()}
        </Button>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-md p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {(streamingContent || analysisStatus === 'loading') && (
          <div className="bg-gray-800 border border-gray-600 rounded-md p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-200">
              {analysisType === 'analyze' ? 'Analysis Results' : 'Breakdown Results'}
            </h4>
            <div className="text-sm text-gray-300 whitespace-pre-wrap min-h-[100px]">
              {streamingContent || (analysisStatus === 'loading' ? 'Processing...' : '')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AnalyzeStoryModal }
