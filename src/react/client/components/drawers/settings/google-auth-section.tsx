import React, { useEffect, useState, useCallback } from 'react'

import { initiateGoogleOAuth } from '@/bridge'
import { Button } from '@/client/components/ui/button'


type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

export type GoogleAuthSectionProps = {
  onAuthStatusChange?: (status: AuthStatus) => void
}

function GoogleAuthSection({ onAuthStatusChange }: GoogleAuthSectionProps): React.ReactElement {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle')

  const updateAuthStatus = useCallback((status: AuthStatus, errorMessage?: unknown): void => {
    setAuthStatus(status)
    if (onAuthStatusChange) {
      onAuthStatusChange(status)
    }
    if (errorMessage) {
      console.error('Error authenticating with Google:', errorMessage)
    }
  }, [onAuthStatusChange])

  useEffect(() => {
    // Check if Google auth has been completed already
    chrome.storage.local.get(['tempGoogleToken', 'backendKey'], (data) => {
      if (data.tempGoogleToken || data.backendKey) {
        updateAuthStatus('authenticated')
      }
    })
  }, [updateAuthStatus])

  async function handleGoogleAuth(): Promise<void> {
    updateAuthStatus('loading')

    try {
      const response = await initiateGoogleOAuth()

      if (response.success) {
        updateAuthStatus('authenticated')
      }
      else {
        updateAuthStatus('error', response.data.error)
      }
    }
    catch (error) {
      updateAuthStatus('error', error)
    }
  }

  type ButtonText = 'Authenticating...' | 'Authenticated with Google' | 'Login with Google'

  const getButtonText = (): ButtonText => {
    if (authStatus === 'loading') return 'Authenticating...'
    if (authStatus === 'authenticated') return 'Authenticated with Google'
    return 'Login with Google'
  }

  const buttonText = getButtonText()

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Step 1: Authenticate with Google</h3>
      <Button
        onClick={handleGoogleAuth}
        disabled={authStatus === 'loading' || authStatus === 'authenticated'}
        className={
          authStatus === 'authenticated'
            ? 'bg-green-600'
            : authStatus === 'error' ? 'bg-red-600' : ''
        }
      >
        {buttonText}
      </Button>
      <p className="text-gray-400 text-xs">
        We need to verify your Google account before enabling advanced features.
      </p>
    </div>
  )
}

export { GoogleAuthSection }
export type { AuthStatus }
