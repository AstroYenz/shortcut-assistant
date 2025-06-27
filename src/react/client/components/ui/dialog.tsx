import React, { ReactNode } from 'react'

import { cn } from '@/client/lib/utils/cn'


interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps): React.ReactElement | null {
  if (!open) return null

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  function handleEscapeKey(e: React.KeyboardEvent): void {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[75vh]">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

function DialogContent({ children, className }: DialogContentProps): React.ReactElement {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

function DialogHeader({ children, className }: DialogHeaderProps): React.ReactElement {
  return (
    <div className={cn('pb-4 border-b border-gray-700', className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

function DialogTitle({ children, className }: DialogTitleProps): React.ReactElement {
  return (
    <h2 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h2>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle }