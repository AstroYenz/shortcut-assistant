import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'

import { submitShortcutApiToken } from '@/bridge'
import { Settings } from '@/client/components/drawers/settings'


jest.mock('@/bridge', () => ({
  submitShortcutApiToken: jest.fn()
}))

jest.mock('@/client/components/drawers/settings/google-auth-section', () => ({
  GoogleAuthSection: jest.fn(({ onAuthStatusChange }) => {
    // Simulate a button that can trigger auth status changes
    return (
      <div>
        <h3>Step 1: Authenticate with Google</h3>
        <button
          data-testid="mock-google-auth-button"
          onClick={() => onAuthStatusChange && onAuthStatusChange('authenticated')}
        >
          Mocked Google Auth Button
        </button>
        <button
          data-testid="mock-google-auth-error"
          onClick={() => onAuthStatusChange && onAuthStatusChange('error')}
        >
          Trigger Error State
        </button>
      </div>
    )
  })
}))

const mockSubmitShortcutApiToken = jest.mocked(submitShortcutApiToken)

const mockChromeLocalGet = jest.fn()
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      local: {
        get: mockChromeLocalGet
      }
    }
  },
  writable: true
})

describe('Settings component', function testSettingsComponentSuite() {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn()
  }

  const STATUS_RESET_DELAY_MS = 3000

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockChromeLocalGet.mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        callback({})
      }
      return {}
    })

    mockSubmitShortcutApiToken.mockResolvedValue({ success: true, data: {} })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  function setup(props = {}) {
    const mergedProps = { ...defaultProps, ...props }
    return render(<Settings {...mergedProps} />)
  }

  it('renders the drawer when open is true', function testRendersDrawerWhenOpen() {
    setup()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render the drawer when open is false', function testDoesNotRenderDrawerWhenClosed() {
    setup({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onOpenChange when handleOpenChange is called', function testCallsOnOpenChange() {
    setup()

    // We can test this by directly triggering the Drawer's onOpenChange prop
    // Find the Drawer and trigger its onOpenChange handler
    const drawer = screen.getByRole('dialog')

    // The component sets up its own handler that will call the prop
    // Simulate clicking outside or pressing escape which would trigger this
    fireEvent.keyDown(drawer, { key: 'Escape' })

    // Check if our mock was called with the right value
    expect(defaultProps.onOpenChange).toHaveBeenCalled()
  })

  it('loads stored token from Chrome storage', function testLoadsStoredToken() {
    mockChromeLocalGet.mockImplementation((key, callback) => {
      if (typeof callback === 'function') {
        callback({ backendKey: 'api-key' })
      }
      return { backendKey: 'api-key' }
    })

    setup()

    // Submit button should show "Update API Token" when token is stored
    // Use more specific query to avoid ambiguity
    expect(screen.getByRole('button', { name: /update api token/i })).toBeInTheDocument()
  })

  it('disables submit button when no API key is entered', function testDisablesSubmitButtonWithNoKey() {
    setup()

    // Mock successful Google auth by triggering the mocked component's success
    fireEvent.click(screen.getByTestId('mock-google-auth-button'))

    // Submit button should still be disabled because no API key is entered
    const submitButton = screen.getByRole('button', { name: /save api token/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when Google auth is not successful', function testDisablesSubmitButtonWithNoAuth() {
    setup()

    // Enter API key
    const input = screen.getByPlaceholderText('Shortcut API Key')
    fireEvent.change(input, { target: { value: 'test-api-key' } })

    // Button should still be disabled because Google auth status is not authenticated
    const submitButton = screen.getByRole('button', { name: /save api token/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when API key is entered and Google auth is successful', function testEnablesSubmitButtonWithKeyAndAuth() {
    setup()

    // Enter API key
    const input = screen.getByPlaceholderText('Shortcut API Key')
    fireEvent.change(input, { target: { value: 'test-api-key' } })

    // Trigger successful Google auth from the mocked component
    fireEvent.click(screen.getByTestId('mock-google-auth-button'))

    // Button should be enabled
    const submitButton = screen.getByRole('button', { name: /save api token/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('updates API key state when input changes', function testUpdatesApiKeyState() {
    setup()

    const input = screen.getByPlaceholderText('Shortcut API Key')
    fireEvent.change(input, { target: { value: 'test-api-key' } })

    // The input should reflect the new value
    expect(input).toHaveValue('test-api-key')
  })

  describe('API token submission', function testApiTokenSubmission() {
    it('submits API token when button is clicked', async function testSubmitsApiToken() {
      mockSubmitShortcutApiToken.mockResolvedValue({ success: true, data: {} })

      setup()

      // Enter API key
      const input = screen.getByPlaceholderText('Shortcut API Key')
      fireEvent.change(input, { target: { value: 'test-api-key' } })

      // Trigger successful Google auth
      fireEvent.click(screen.getByTestId('mock-google-auth-button'))

      // Click submit button
      const submitButton = screen.getByRole('button', { name: /save api token/i })
      fireEvent.click(submitButton)

      // Check if submitShortcutApiToken was called with the correct API key
      expect(mockSubmitShortcutApiToken).toHaveBeenCalledWith('test-api-key')

      // The button should be disabled during submission
      expect(submitButton).toBeDisabled()

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved!/i })).toBeInTheDocument()
      })

      // API key input should be cleared
      expect(input).toHaveValue('')
    })

    it('handles error in API token submission', async function testHandlesApiTokenError() {
      mockSubmitShortcutApiToken.mockResolvedValue({ success: false, data: { error: 'API error' } })
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      setup()

      // Enter API key
      const input = screen.getByPlaceholderText('Shortcut API Key')
      fireEvent.change(input, { target: { value: 'test-api-key' } })

      // Trigger successful Google auth
      fireEvent.click(screen.getByTestId('mock-google-auth-button'))

      // Click submit button
      const submitButton = screen.getByRole('button', { name: /save api token/i })
      fireEvent.click(submitButton)

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting API token:', 'API error')
      })

      // Button should show error state
      // Use a more specific selector to avoid ambiguity with the mock error button
      const errorButton = screen.getAllByRole('button').find(
        button => button.textContent === 'Error' && !button.hasAttribute('data-testid')
      )
      expect(errorButton).toBeInTheDocument()
      expect(errorButton).toHaveClass('bg-red-600')

      consoleErrorSpy.mockRestore()
    })

    it('resets submit status after the defined delay period', async function testResetsSubmitStatusAfterDelay() {
      mockSubmitShortcutApiToken.mockResolvedValue({ success: true, data: {} })

      setup()

      // Enter API key
      const input = screen.getByPlaceholderText('Shortcut API Key')
      fireEvent.change(input, { target: { value: 'test-api-key' } })

      // Trigger successful Google auth
      fireEvent.click(screen.getByTestId('mock-google-auth-button'))

      // Click submit button
      const submitButton = screen.getByRole('button', { name: /save api token/i })
      fireEvent.click(submitButton)

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved!/i })).toBeInTheDocument()
      })

      // Fast-forward time by the delay period
      act(() => {
        jest.advanceTimersByTime(STATUS_RESET_DELAY_MS)
      })

      // Button should reset to default state
      expect(screen.getByRole('button', { name: /update api token/i })).toBeInTheDocument()
    })
  })

  it('does not submit if API key is empty', function testDoesNotSubmitEmptyKey() {
    setup()

    // Trigger successful Google auth
    fireEvent.click(screen.getByTestId('mock-google-auth-button'))

    // Click submit button with empty API key
    const submitButton = screen.getByRole('button', { name: /save api token/i })
    fireEvent.click(submitButton)

    // Submission function should not be called
    expect(mockSubmitShortcutApiToken).not.toHaveBeenCalled()
  })
})
