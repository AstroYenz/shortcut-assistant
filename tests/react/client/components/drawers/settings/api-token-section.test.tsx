import { render, screen, fireEvent } from '@testing-library/react'

import { ApiTokenSection } from '@/client/components/drawers/settings/api-token-section'


describe('ApiTokenSection', function testApiTokenSectionSuite() {
  const defaultProps = {
    apiKey: '',
    hasStoredToken: false,
    isSubmitting: false,
    googleAuthStatus: 'success' as const,
    onApiKeyChange: jest.fn()
  }

  function setup(props = {}) {
    const mergedProps = { ...defaultProps, ...props }
    return render(<ApiTokenSection {...mergedProps} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct heading', function testRendersCorrectHeading() {
    setup()
    expect(screen.getByText('Step 2: Add Shortcut API Token')).toBeInTheDocument()
  })

  it('renders input with correct placeholder when no token is stored', function testInputPlaceholderWithoutToken() {
    setup()
    expect(screen.getByPlaceholderText('Shortcut API Key')).toBeInTheDocument()
  })

  it('renders input with dots placeholder when token is stored', function testInputPlaceholderWithToken() {
    setup({ hasStoredToken: true })
    expect(screen.getByPlaceholderText('••••••••••••••••••')).toBeInTheDocument()
  })

  it('displays API key value from props', function testDisplaysApiKeyValue() {
    const apiKey = 'test-api-key'
    setup({ apiKey })
    const input: HTMLInputElement = screen.getByPlaceholderText('Shortcut API Key')
    expect(input.value).toBe(apiKey)
  })

  it('disables input when isSubmitting is true', function testDisablesInputWhenSubmitting() {
    setup({ isSubmitting: true })
    const input = screen.getByPlaceholderText('Shortcut API Key')
    expect(input).toBeDisabled()
  })

  it('disables input when googleAuthStatus is not success', function testDisablesInputWhenAuthNotSuccess() {
    setup({ googleAuthStatus: 'idle' })
    const input: HTMLInputElement = screen.getByPlaceholderText('Shortcut API Key')
    expect(input).toBeDisabled()
  })

  it('enables input when googleAuthStatus is success and not submitting', function testEnablesInputWhenAuthSuccess() {
    setup({ googleAuthStatus: 'success', isSubmitting: false })
    const input: HTMLInputElement = screen.getByPlaceholderText('Shortcut API Key')
    expect(input).not.toBeDisabled()
  })

  it('calls onApiKeyChange when input value changes', function testCallsOnApiKeyChange() {
    setup()
    const input = screen.getByPlaceholderText('Shortcut API Key')

    fireEvent.change(input, { target: { value: 'new-api-key' } })

    expect(defaultProps.onApiKeyChange).toHaveBeenCalled()
  })

  it('shows completion message when token is stored', function testCompletionMessage() {
    setup({ hasStoredToken: true })
    expect(screen.getByText('API token saved. Enter a new token to update.')).toBeInTheDocument()
  })

  it('shows instruction message when no token is stored', function testInstructionMessage() {
    setup()
    expect(screen.getByText('This token enables advanced AI features for Shortcut.')).toBeInTheDocument()
  })

  it('shows authentication required message when googleAuthStatus is not success', function testAuthRequiredMessage() {
    setup({ googleAuthStatus: 'idle' })
    expect(screen.getByText('Please complete Google authentication first.')).toBeInTheDocument()
  })
})
