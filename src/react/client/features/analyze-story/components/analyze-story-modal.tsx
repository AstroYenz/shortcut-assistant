import React, { useState, useEffect } from 'react'

import { analyzeStoryReact } from '@/bridge'
import { Button } from '@/client/components/ui/button'
import { useStoryContext } from '@/client/contexts/story-context'
import { cn } from '@/client/lib/utils/cn'

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

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
    const subscribeToReactAIResults = (window as any).__subscribeToReactAIResults
    if (!subscribeToReactAIResults) return
    
    const unsubscribe = subscribeToReactAIResults((message: any) => {
      // Only handle messages for our current request and analysis type
      if (message.requestId === currentRequestId && message.analysisType === analysisType) {
        if (message.status === 'streaming') {
          setStreamingContent((prev: string) => prev + (message.content || ''))
        } else if (message.status === 'completed') {
          setAnalysisStatus('success')
          setStreamingContent((prev: string) => prev + (message.content || ''))
        } else if (message.status === 'error') {
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

    try {
      const response = await analyzeStoryReact(story.description, analysisType)

      if (response.success) {
        setCurrentRequestId(response.data.requestId)
        // Status stays 'loading' - wait for streaming results
      } else {
        setError(response.data.error || 'Failed to start analysis')
        setAnalysisStatus('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze story')
      setAnalysisStatus('error')
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
          className="text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Story Details</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium">{story.title || 'Untitled Story'}</p>
            <p className="text-xs text-gray-600 mt-1">
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
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {(streamingContent || analysisStatus === 'loading') && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
            <h4 className="text-sm font-medium text-blue-900">
              {analysisType === 'analyze' ? 'Analysis Results' : 'Breakdown Results'}
            </h4>
            <div className="text-sm text-blue-800 whitespace-pre-wrap min-h-[100px]">
              {streamingContent || (analysisStatus === 'loading' ? 'Processing...' : '')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { AnalyzeStoryModal }