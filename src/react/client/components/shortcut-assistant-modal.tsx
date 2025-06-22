import { Settings } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/client/components/ui/button'
import { Drawer, DrawerContent } from '@/client/components/ui/drawer'
import { AnalyzeStoryModal } from '@/client/features/analyze-story/components/analyze-story-modal'
import { BreakDownStoryModal } from '@/client/features/break-down-story/components/break-down-story-modal'
import { cn } from '@/client/lib/utils/cn'


type ModalView = 'main' | 'analyze' | 'breakdown' | 'settings'

interface ShortcutAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ShortcutAssistantModal({ open, onOpenChange }: ShortcutAssistantModalProps): React.ReactElement {
  const [currentView, setCurrentView] = useState<ModalView>('main')

  function handleOpenChange(isOpen: boolean): void {
    onOpenChange(isOpen)
    if (!isOpen) {
      // Reset to main view when modal closes
      setCurrentView('main')
    }
  }

  function handleViewChange(view: ModalView): void {
    setCurrentView(view)
  }

  function handleBackToMain(): void {
    setCurrentView('main')
  }

  function renderMainView(): React.ReactElement {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Shortcut Story Assistant</h1>
          <button
            onClick={() => handleViewChange('settings')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            aria-label="Open Settings"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Choose an action to enhance your story:
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleViewChange('analyze')}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Analyze Story</div>
                <div className="text-sm text-gray-500">
                  Get AI insights and suggestions for your story
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleViewChange('breakdown')}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Break Down Story</div>
                <div className="text-sm text-gray-500">
                  Split your story into smaller, manageable tasks
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderAnalyzeView(): React.ReactElement {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToMain}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Actions
        </button>
        <AnalyzeStoryModal onClose={handleBackToMain} />
      </div>
    )
  }

  function renderBreakdownView(): React.ReactElement {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToMain}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Actions
        </button>
        <BreakDownStoryModal onClose={handleBackToMain} />
      </div>
    )
  }

  function renderSettingsView(): React.ReactElement {
    // Import the existing Settings component dynamically to avoid circular dependencies
    const { Settings } = require('@/client/components/drawers/settings')
    
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToMain}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Actions
        </button>
        <Settings
          open={true}
          onOpenChange={(open: boolean) => {
            if (!open) {
              handleBackToMain()
            }
          }}
        />
      </div>
    )
  }

  function renderCurrentView(): React.ReactElement {
    switch (currentView) {
      case 'analyze':
        return renderAnalyzeView()
      case 'breakdown':
        return renderBreakdownView()
      case 'settings':
        return renderSettingsView()
      default:
        return renderMainView()
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="z-[9999]">
        <div className="mx-auto w-full max-w-lg p-6">
          {renderCurrentView()}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { ShortcutAssistantModal }