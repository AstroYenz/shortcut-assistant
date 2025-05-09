import { Settings } from 'lucide-react'
import React, { useState } from 'react'

import '@/styles/globals.css'
import './styles.css'
import { Drawers } from '@/client/components/drawers'
import { DrawerType } from '@/client/types/drawer'


function FAB(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<DrawerType | null>(null)

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
            <button className="shortcut-assistant-fab-menu-item">Analyze</button>
            <button className="shortcut-assistant-fab-menu-item">Break Up</button>
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
    </>
  )
}

export default FAB
