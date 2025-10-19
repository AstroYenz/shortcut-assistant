import React, { useState } from 'react'

import { Settings } from '@/client/components/drawers/settings'
import { Button } from '@/client/components/ui/button'
import { Dialog, DialogContent } from '@/client/components/ui/dialog'
import { AnalyzeStoryModal } from '@/client/features/analyze-story/components/analyze-story-modal'


type ModalView = 'main' | 'analyze' | 'breakdown' | 'settings'

interface ShortcutAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialView?: 'analyze' | 'breakdown'
}

function ShortcutAssistantModal({ open, onOpenChange, initialView }: ShortcutAssistantModalProps): React.ReactElement {
  const [currentView, setCurrentView] = useState<ModalView>(initialView || 'main')

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
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Choose an action to enhance your story:
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => {
                handleViewChange('analyze')
              }}
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
              onClick={() => {
                handleViewChange('breakdown')
              }}
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
      <AnalyzeStoryModal
        onClose={handleBackToMain}
        analysisType="analyze"
      />
    )
  }

  function renderBreakdownView(): React.ReactElement {
    return (
      <AnalyzeStoryModal
        onClose={handleBackToMain}
        analysisType="breakup"
      />
    )
  }

  function renderSettingsView(): React.ReactElement {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {renderCurrentView()}
      </DialogContent>
    </Dialog>
  )
}

export { ShortcutAssistantModal }
