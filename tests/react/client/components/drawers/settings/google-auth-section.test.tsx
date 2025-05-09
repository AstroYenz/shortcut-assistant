import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { initiateGoogleOAuth } from '@/bridge'
import { GoogleAuthSection } from '@/client/components/drawers/settings/google-auth-section'


jest.mock('@/bridge', () => ({
  initiateGoogleOAuth: jest.fn()
}))

const mockGet = jest.fn()
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      local: {
        get: mockGet
      }
    }
  },
  writable: true
})

describe('GoogleAuthSection', function testGoogleAuthSectionSuite() {
  const mockInitiateGoogleOAuth = jest.mocked(initiateGoogleOAuth)

  const defaultProps = {
    onAuthStatusChange: jest.fn()
  }

  function setup(props = {}) {
    const mergedProps = { ...defaultProps, ...props }
    return render(<GoogleAuthSection {...mergedProps} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockImplementation((keys, callback) => {
      callback({})
    })
    mockInitiateGoogleOAuth.mockResolvedValue({ success: true, data: {} })
  })

  it('renders with correct heading', function testRendersCorrectHeading() {
    setup()
    expect(screen.getByText('Step 1: Authenticate with Google')).toBeInTheDocument()
  })

  it('renders the authentication description', function testRendersDescription() {
    setup()
    expect(screen.getByText('We need to verify your Google account before enabling advanced features.')).toBeInTheDocument()
  })

  it('displays "Login with Google" text initially', function testLoginButtonText() {
    setup()
    expect(screen.getByRole('button')).toHaveTextContent('Login with Google')
  })

  it('displays "Authenticating..." text when authentication in progress', async function testAuthenticatingButtonText() {
    setup()

    // Mock a delayed response to test the loading state
    mockInitiateGoogleOAuth.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: {} })
        }, 100)
      })
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Authenticating...')
    })
  })

  it('displays "Authenticated with Google" text after successful authentication', async function testAuthenticatedButtonText() {
    setup()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Authenticated with Google')
    })
  })

  it('shows as already authenticated if token exists in storage', function testAlreadyAuthenticated() {
    // Mock chrome.storage.local.get to return a token
    mockGet.mockImplementation((keys, callback) => {
      callback({ tempGoogleToken: 'mock-token' })
    })

    setup()

    expect(screen.getByRole('button')).toHaveTextContent('Authenticated with Google')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onAuthStatusChange with authenticated when authenticated with storage', function testCallsOnAuthStatusChangeSuccess() {
    // Mock chrome.storage.local.get to return a token
    mockGet.mockImplementation((keys, callback) => {
      callback({ tempGoogleToken: 'mock-token' })
    })

    setup()

    expect(defaultProps.onAuthStatusChange).toHaveBeenCalledWith('authenticated')
  })

  it('disables button when authenticating', async function testDisablesButtonWhenAuthenticating() {
    setup()

    // Mock a delayed response to test the loading state
    mockInitiateGoogleOAuth.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: {} })
        }, 100)
      })
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  it('applies success styling when authenticated', async function testAppliesSuccessStyling() {
    setup()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveClass('bg-green-600')
    })
  })

  it('applies error styling when authentication fails', async function testAppliesErrorStyling() {
    mockInitiateGoogleOAuth.mockResolvedValue({ success: false, data: { error: 'Auth failed' } })

    setup()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })
  })

  it('handles authentication errors properly', async function testHandlesAuthErrors() {
    mockInitiateGoogleOAuth.mockRejectedValue(new Error('Network error'))

    setup()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })
    expect(defaultProps.onAuthStatusChange).toHaveBeenCalledWith('error')
  })

  it('calls onAuthStatusChange with correct states during authentication flow', async function testCallsOnAuthStatusChange() {
    setup()

    fireEvent.click(screen.getByRole('button'))

    expect(defaultProps.onAuthStatusChange).toHaveBeenCalledWith('loading')

    await waitFor(() => {
      expect(defaultProps.onAuthStatusChange).toHaveBeenCalledWith('authenticated')
    })
  })
})
