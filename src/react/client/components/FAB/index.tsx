import { Settings } from 'lucide-react'
import React, { useState } from 'react'

import '@/styles/globals.css'
import './styles.css'
import { Drawers } from '@/client/components/drawers'
import { ShortcutAssistantModal } from '@/client/components/shortcut-assistant-modal'
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

  function handleOpenAnalyze(): void {
    setOpenModal('analyze')
    setIsOpen(false)
  }

  function handleOpenBreakdown(): void {
    setOpenModal('breakdown')
    setIsOpen(false)
  }

  function handleModalChange(open: boolean): void {
    if (!open) {
      setOpenModal(null)
    }
  }

  return (
    <>
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
            <button className="shortcut-assistant-fab-menu-item">Add Labels</button>
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
