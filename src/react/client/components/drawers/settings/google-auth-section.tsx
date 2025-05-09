import React, { useEffect, useState } from 'react'

import { initiateGoogleOAuth } from '@/bridge'
import { Button } from '@/client/components/ui/button'


type Status = 'idle' | 'loading' | 'success' | 'error'

const STATUS_RESET_DELAY_MS = 3000

export type GoogleAuthSectionProps = {
  onAuthStatusChange?: (status: Status) => void
}

function GoogleAuthSection({ onAuthStatusChange }: GoogleAuthSectionProps): React.ReactElement {
  const [googleAuthStatus, setGoogleAuthStatus] = useState<Status>('idle')
  const [isAuthenticatingWithGoogle, setIsAuthenticatingWithGoogle] = useState(false)

  useEffect(() => {
    // Check if Google auth has been completed already
    chrome.storage.local.get(['tempGoogleToken', 'backendKey'], (data) => {
      if (data.tempGoogleToken || data.backendKey) {
        setGoogleAuthStatus('success')
        if (onAuthStatusChange) {
          onAuthStatusChange('success')
        }
      }
    })
  }, [onAuthStatusChange])

  async function handleGoogleAuth(): Promise<void> {
    setIsAuthenticatingWithGoogle(true)
    setGoogleAuthStatus('loading')

    if (onAuthStatusChange) {
      onAuthStatusChange('loading')
    }

    try {
      const response = await initiateGoogleOAuth()

      if (response.success) {
        setGoogleAuthStatus('success')
        if (onAuthStatusChange) {
          onAuthStatusChange('success')
        }
      }
      else {
        console.error('Error authenticating with Google:', response.error)
        setGoogleAuthStatus('error')
        if (onAuthStatusChange) {
          onAuthStatusChange('error')
        }
      }
    }
    catch (error) {
      console.error('Error authenticating with Google:', error)
      setGoogleAuthStatus('error')
      if (onAuthStatusChange) {
        onAuthStatusChange('error')
      }
    }
    finally {
      setIsAuthenticatingWithGoogle(false)
    }
  }

  const buttonText = isAuthenticatingWithGoogle ? 'Authenticating...' : googleAuthStatus === 'success' ? 'Authenticated with Google' : 'Login with Google'

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Step 1: Authenticate with Google</h3>
      <Button
        onClick={handleGoogleAuth}
        disabled={isAuthenticatingWithGoogle || googleAuthStatus === 'success'}
        className={
          googleAuthStatus === 'success'
            ? 'bg-green-600'
            : googleAuthStatus === 'error' ? 'bg-red-600' : ''
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
