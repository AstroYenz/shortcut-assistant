import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'


interface StoryData {
  id: string | null
  title: string | null
  description: string | null
  state: string | null
  notes: string | null
}

interface StoryContextType {
  story: StoryData
  isLoading: boolean
  error: string | null
  refreshStory: () => Promise<void>
}

const StoryContext = createContext<StoryContextType | undefined>(undefined)

interface StoryProviderProps {
  children: ReactNode
  initialStory?: Partial<StoryData>
}

function StoryProvider({ children, initialStory = {} }: StoryProviderProps): React.ReactElement {
  const [story, setStory] = useState<StoryData>({
    id: null,
    title: null,
    description: null,
    state: null,
    notes: null,
    ...initialStory
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function refreshStory(): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      // Get story data from DOM using existing Story utility patterns
      // This mimics what the legacy Story class does
      const titleElement = document.querySelector('.story-name')
      const descriptionElement = document.querySelector('#story-description-v2')
      const stateElement = document.querySelector('#story-dialog-state-dropdown .value')

      const url = window.location.href
      const idMatch = url.match(/\/story\/(\d+)/)

      const newStoryData: StoryData = {
        id: idMatch ? idMatch[1] : null,
        title: titleElement?.textContent?.trim() || null,
        description: descriptionElement?.textContent?.trim() || null,
        state: stateElement?.textContent?.trim() || null,
        notes: null // Will be loaded separately if needed
      }

      setStory(newStoryData)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story data')
    }
    finally {
      setIsLoading(false)
    }

    return Promise.resolve()
  }

  useEffect(() => {
    // Initial story data load
    refreshStory()
  }, [])

  const contextValue: StoryContextType = {
    story,
    isLoading,
    error,
    refreshStory
  }

  return (
    <StoryContext.Provider value={contextValue}>
      {children}
    </StoryContext.Provider>
  )
}

function useStoryContext(): StoryContextType {
  const context = useContext(StoryContext)
  if (context === undefined) {
    throw new Error('useStoryContext must be used within a StoryProvider')
  }
  return context
}

export { StoryProvider, useStoryContext }
export type { StoryData, StoryContextType }
