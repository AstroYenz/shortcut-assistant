import React, { useState, useEffect } from 'react'

import { analyzeStory } from '@/bridge'
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

  useEffect(() => {
    // Subscribe to AI streaming results from content bridge
    const subscribeToAIResults = (window as any).__subscribeToAIResults
    if (!subscribeToAIResults) return
    
    const unsubscribe = subscribeToAIResults((message: any) => {
      // Only handle messages for our analysis type
      if (message.data?.type === analysisType) {
        if (message.status === 0) { // updated
          setStreamingContent(message.data.content || '')
        } else if (message.status === 2) { // completed
          setAnalysisStatus('success')
          setStreamingContent(message.data.content || '')
        } else if (message.status === 1) { // failed
          setAnalysisStatus('error')
          setError(message.message || 'Analysis failed')
        }
      }
    })

    return unsubscribe
  }, [analysisType])

  async function handleAnalyzeStory(): Promise<void> {
    if (!story.description) {
      setError('No story description available to analyze')
      return
    }

    setAnalysisStatus('loading')
    setError(null)
    setStreamingContent('')

    try {
      const response = await analyzeStory(story.description, analysisType)

      if (!response.success) {
        setError(response.data.error || 'Failed to start analysis')
        setAnalysisStatus('error')
      }
      // Don't set success here - wait for streaming results
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