import { Settings } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

import '@/styles/globals.css'
import './styles.css'
import { Drawers } from '@/client/components/drawers'
import { ShortcutAssistantModal } from '@/client/components/shortcut-assistant-modal'
import { Toaster } from '@/components/ui/sonner'
import { checkAuthentication } from '@/client/lib/auth-check'
import { DrawerType } from '@/client/types/drawer'


type ModalType = 'analyze' | 'breakdown' | null

function FAB(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<DrawerType | null>(null)
  const [openModal, setOpenModal] = useState<ModalType>(null)

  function handleToggle(): void {
    setIsOpen(!isOpen)
  }

  function handleOpenSettings(): void {
    setOpenDrawer('settings')
    setIsOpen(false)
  }

  function handleDrawerChange(drawer: DrawerType | null): void {
    setOpenDrawer(drawer)
  }

  async function handleOpenAnalyze(): Promise<void> {
    const authStatus = await checkAuthentication()
    if (!authStatus.isAuthenticated) {
      toast.info('Please authenticate in Settings to use AI features')
      setOpenDrawer('settings')
      setIsOpen(false)
      return
    }
    setOpenModal('analyze')
    setIsOpen(false)
  }

  async function handleOpenBreakdown(): Promise<void> {
    const authStatus = await checkAuthentication()
    if (!authStatus.isAuthenticated) {
      toast.info('Please authenticate in Settings to use AI features')
      setOpenDrawer('settings')
      setIsOpen(false)
      return
    }
    setOpenModal('breakdown')
    setIsOpen(false)
  }

  async function handleAddLabels(): Promise<void> {
    const authStatus = await checkAuthentication()
    if (!authStatus.isAuthenticated) {
      toast.info('Please authenticate in Settings to use AI features')
      setOpenDrawer('settings')
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    try {
      await chrome.runtime.sendMessage({ action: 'addLabels' })
    }
    catch (error) {
      console.error('Error adding labels:', error)
    }
  }

  function handleModalChange(open: boolean): void {
    if (!open) {
      setOpenModal(null)
    }
  }

  return (
    <>
      <Toaster />
      <div className="shortcut-assistant-fab">
        <button
          className={`shortcut-assistant-fab-button ${isOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label="Toggle Shortcut Assistant"
          title="Toggle Shortcut Assistant"
          name="Toggle Shortcut Assistant"
          aria-expanded={isOpen}
          type="button"
        >
          <span className="shortcut-assistant-fab-icon">+</span>
        </button>

        {isOpen && (
          <div className="shortcut-assistant-fab-menu">
            <button
              className="shortcut-assistant-fab-menu-item"
              onClick={handleOpenAnalyze}
            >
              Analyze
            </button>
            <button
              className="shortcut-assistant-fab-menu-item"
              onClick={handleOpenBreakdown}
            >
              Break Down
            </button>
            <button
              className="shortcut-assistant-fab-menu-item"
              onClick={handleAddLabels}
            >
              Add Labels
            </button>
            <button
              className="shortcut-assistant-fab-menu-item"
              onClick={handleOpenSettings}
              aria-label="Open Settings"
              title="Open Settings"
              name="Open Settings"
              type="button"
            >
              <Settings />
            </button>
          </div>
        )}
      </div>
      <Drawers
        openDrawer={openDrawer}
        onOpenChange={handleDrawerChange}
      />
      {openModal && (
        <ShortcutAssistantModal
          open={true}
          onOpenChange={handleModalChange}
          initialView={openModal}
        />
      )}
    </>
  )
}

export default FAB
