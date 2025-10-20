import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { toast } from 'sonner'

import FAB from '@/client/components/FAB'
import * as authCheck from '@/client/lib/auth-check'


// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn()
  },
  Toaster: function MockToaster() {
    return <div data-testid="mock-toaster" />
  }
}))

// Mock auth-check
jest.mock('@/client/lib/auth-check')

// Mock Drawers to avoid rendering the full settings drawer
jest.mock('@/client/components/drawers', () => ({
  Drawers: function MockDrawers({ openDrawer }: { openDrawer: string | null }) {
    return <div data-testid="mock-drawers">{openDrawer}</div>
  }
}))

// Mock ShortcutAssistantModal
jest.mock('@/client/components/shortcut-assistant-modal', () => ({
  ShortcutAssistantModal: function MockModal({
    open,
    onOpenChange,
    initialView
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialView: 'analyze' | 'breakdown'
  }) {
    return open
      ? (
        <div data-testid="mock-modal" data-initial-view={initialView}>
          <button onClick={() => {
            onOpenChange(false)
          }}
          >
            Close Modal
          </button>
        </div>
      )
      : null
  }
}))

// Mock chrome.runtime.sendMessage
const mockSendMessage = jest.fn()
Object.defineProperty(global, 'chrome', {
  value: {
    runtime: {
      sendMessage: mockSendMessage
    }
  },
  writable: true
})

describe('FAB', function testFABSuite() {
  const mockCheckAuthentication = jest.mocked(authCheck.checkAuthentication)

  function setup() {
    return render(<FAB />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSendMessage.mockResolvedValue(undefined)
    // Default to authenticated state for existing tests
    mockCheckAuthentication.mockResolvedValue({
      isAuthenticated: true,
      hasGoogleAuth: true,
      hasShortcutToken: true
    })
  })

  describe('Initial rendering', () => {
    it('renders the FAB button', function testRendersFabButton() {
      setup()
      expect(screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })).toBeInTheDocument()
    })

    it('does not render menu items initially', function testMenuNotRenderedInitially() {
      setup()
      expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
      expect(screen.queryByText('Break Down')).not.toBeInTheDocument()
      expect(screen.queryByText('Add Labels')).not.toBeInTheDocument()
    })

    it('has correct accessibility attributes', function testAccessibilityAttributes() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      expect(fabButton).toHaveAttribute('aria-label', 'Toggle Shortcut Assistant')
      expect(fabButton).toHaveAttribute('title', 'Toggle Shortcut Assistant')
      expect(fabButton).toHaveAttribute('aria-expanded', 'false')
      expect(fabButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Menu toggling', () => {
    it('toggles the menu when FAB button is clicked', function testToggleMenu() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })

      // Open menu
      fireEvent.click(fabButton)
      expect(screen.getByText('Analyze')).toBeInTheDocument()
      expect(fabButton).toHaveClass('open')
      expect(fabButton).toHaveAttribute('aria-expanded', 'true')

      // Close menu
      fireEvent.click(fabButton)
      expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
      expect(fabButton).not.toHaveClass('open')
      expect(fabButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('displays all menu items when opened', function testDisplaysAllMenuItems() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      expect(screen.getByText('Analyze')).toBeInTheDocument()
      expect(screen.getByText('Break Down')).toBeInTheDocument()
      expect(screen.getByText('Add Labels')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Open Settings' })).toBeInTheDocument()
    })
  })

  describe('Analyze button', () => {
    it('opens the analyze modal when Analyze button is clicked', async function testOpenAnalyzeModal() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const analyzeButton = screen.getByText('Analyze')
      fireEvent.click(analyzeButton)

      await waitFor(() => {
        const modal = screen.getByTestId('mock-modal')
        expect(modal).toBeInTheDocument()
        expect(modal).toHaveAttribute('data-initial-view', 'analyze')
      })
    })

    it('closes the FAB menu when Analyze button is clicked', async function testClosesMenuOnAnalyze() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const analyzeButton = screen.getByText('Analyze')
      fireEvent.click(analyzeButton)

      await waitFor(() => {
        expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
        expect(fabButton).not.toHaveClass('open')
      })
    })
  })

  describe('Break Down button', () => {
    it('opens the breakdown modal when Break Down button is clicked', async function testOpenBreakdownModal() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const breakdownButton = screen.getByText('Break Down')
      fireEvent.click(breakdownButton)

      await waitFor(() => {
        const modal = screen.getByTestId('mock-modal')
        expect(modal).toBeInTheDocument()
        expect(modal).toHaveAttribute('data-initial-view', 'breakdown')
      })
    })

    it('closes the FAB menu when Break Down button is clicked', async function testClosesMenuOnBreakdown() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const breakdownButton = screen.getByText('Break Down')
      fireEvent.click(breakdownButton)

      await waitFor(() => {
        expect(screen.queryByText('Break Down')).not.toBeInTheDocument()
        expect(fabButton).not.toHaveClass('open')
      })
    })
  })

  describe('Add Labels button', () => {
    it('sends chrome message when Add Labels button is clicked', async function testSendsChromeMessage() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const addLabelsButton = screen.getByText('Add Labels')
      fireEvent.click(addLabelsButton)

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith({ action: 'addLabels' })
      })
    })

    it('closes the FAB menu when Add Labels button is clicked', async function testClosesMenuOnAddLabels() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const addLabelsButton = screen.getByText('Add Labels')
      fireEvent.click(addLabelsButton)

      await waitFor(() => {
        expect(screen.queryByText('Add Labels')).not.toBeInTheDocument()
        expect(fabButton).not.toHaveClass('open')
      })
    })

    it('handles errors when adding labels fails', async function testHandlesAddLabelsError() {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const testError = new Error('Failed to add labels')
      mockSendMessage.mockRejectedValue(testError)

      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const addLabelsButton = screen.getByText('Add Labels')
      fireEvent.click(addLabelsButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding labels:', testError)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Settings drawer', () => {
    it('opens settings drawer when settings button is clicked', function testOpenSettingsDrawer() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const settingsButton = screen.getByRole('button', { name: 'Open Settings' })
      fireEvent.click(settingsButton)

      expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')
    })

    it('closes the FAB menu when settings button is clicked', function testClosesMenuOnSettings() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const settingsButton = screen.getByRole('button', { name: 'Open Settings' })
      fireEvent.click(settingsButton)

      expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
      expect(fabButton).not.toHaveClass('open')
    })

    it('has correct accessibility attributes on settings button', function testSettingsButtonAccessibility() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const settingsButton = screen.getByRole('button', { name: 'Open Settings' })
      expect(settingsButton).toHaveAttribute('aria-label', 'Open Settings')
      expect(settingsButton).toHaveAttribute('title', 'Open Settings')
      expect(settingsButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Modal integration', () => {
    it('closes modal when onOpenChange is called with false', async function testClosesModal() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const analyzeButton = screen.getByText('Analyze')
      fireEvent.click(analyzeButton)

      await waitFor(() => {
        expect(screen.getByTestId('mock-modal')).toBeInTheDocument()
      })

      const closeButton = screen.getByText('Close Modal')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()
    })

    it('can open different modals sequentially', async function testOpenDifferentModals() {
      setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })

      // Open analyze modal
      fireEvent.click(fabButton)
      fireEvent.click(screen.getByText('Analyze'))
      await waitFor(() => {
        expect(screen.getByTestId('mock-modal')).toHaveAttribute('data-initial-view', 'analyze')
      })

      // Close modal
      fireEvent.click(screen.getByText('Close Modal'))
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()

      // Open breakdown modal
      fireEvent.click(fabButton)
      fireEvent.click(screen.getByText('Break Down'))
      await waitFor(() => {
        expect(screen.getByTestId('mock-modal')).toHaveAttribute('data-initial-view', 'breakdown')
      })
    })
  })

  describe('Drawer integration', () => {
    it('handles drawer state changes', function testHandlesDrawerChanges() {
      const { rerender } = setup()
      const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
      fireEvent.click(fabButton)

      const settingsButton = screen.getByRole('button', { name: 'Open Settings' })
      fireEvent.click(settingsButton)

      expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')

      // Re-render should maintain the drawer state
      rerender(<FAB />)
      expect(screen.getByTestId('mock-drawers')).toBeInTheDocument()
    })
  })

  describe('Authentication checks', () => {
    describe('Analyze button', () => {
      it('shows toast and opens settings when not authenticated', async function testAnalyzeAuthCheck() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: false,
          hasGoogleAuth: false,
          hasShortcutToken: false
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const analyzeButton = screen.getByText('Analyze')
        fireEvent.click(analyzeButton)

        await waitFor(() => {
          expect(toast.info).toHaveBeenCalledWith('Please authenticate in Settings to use AI features')
          expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')
        })

        // Should not open the modal
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()
      })

      it('opens modal when authenticated', async function testAnalyzeWhenAuthenticated() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: true,
          hasGoogleAuth: true,
          hasShortcutToken: true
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const analyzeButton = screen.getByText('Analyze')
        fireEvent.click(analyzeButton)

        await waitFor(() => {
          expect(screen.getByTestId('mock-modal')).toBeInTheDocument()
        })

        expect(toast.info).not.toHaveBeenCalled()
      })
    })

    describe('Break Down button', () => {
      it('shows toast and opens settings when not authenticated', async function testBreakdownAuthCheck() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: false,
          hasGoogleAuth: false,
          hasShortcutToken: false
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const breakdownButton = screen.getByText('Break Down')
        fireEvent.click(breakdownButton)

        await waitFor(() => {
          expect(toast.info).toHaveBeenCalledWith('Please authenticate in Settings to use AI features')
          expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')
        })

        // Should not open the modal
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()
      })

      it('opens modal when authenticated', async function testBreakdownWhenAuthenticated() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: true,
          hasGoogleAuth: true,
          hasShortcutToken: true
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const breakdownButton = screen.getByText('Break Down')
        fireEvent.click(breakdownButton)

        await waitFor(() => {
          expect(screen.getByTestId('mock-modal')).toBeInTheDocument()
        })

        expect(toast.info).not.toHaveBeenCalled()
      })
    })

    describe('Add Labels button', () => {
      it('shows toast and opens settings when not authenticated', async function testAddLabelsAuthCheck() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: false,
          hasGoogleAuth: false,
          hasShortcutToken: false
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const addLabelsButton = screen.getByText('Add Labels')
        fireEvent.click(addLabelsButton)

        await waitFor(() => {
          expect(toast.info).toHaveBeenCalledWith('Please authenticate in Settings to use AI features')
          expect(screen.getByTestId('mock-drawers')).toHaveTextContent('settings')
        })

        // Should not send chrome message
        expect(mockSendMessage).not.toHaveBeenCalled()
      })

      it('sends chrome message when authenticated', async function testAddLabelsWhenAuthenticated() {
        mockCheckAuthentication.mockResolvedValue({
          isAuthenticated: true,
          hasGoogleAuth: true,
          hasShortcutToken: true
        })

        setup()
        const fabButton = screen.getByRole('button', { name: 'Toggle Shortcut Assistant' })
        fireEvent.click(fabButton)

        const addLabelsButton = screen.getByText('Add Labels')
        fireEvent.click(addLabelsButton)

        await waitFor(() => {
          expect(mockSendMessage).toHaveBeenCalledWith({ action: 'addLabels' })
        })

        expect(toast.info).not.toHaveBeenCalled()
      })
    })
  })
})

