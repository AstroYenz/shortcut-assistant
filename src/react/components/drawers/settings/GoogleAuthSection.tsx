import React from 'react'

import { Button } from '@/components/ui/button'


export type GoogleAuthSectionProps = {
  googleAuthStatus: 'idle' | 'loading' | 'success' | 'error'
  isAuthenticatingWithGoogle: boolean
  onGoogleAuth: () => void
}

function GoogleAuthSection({ googleAuthStatus, isAuthenticatingWithGoogle, onGoogleAuth }: GoogleAuthSectionProps): React.ReactElement {
  const buttonText = isAuthenticatingWithGoogle ? 'Authenticating...' : googleAuthStatus === 'success' ? 'Authenticated with Google' : 'Login with Google'

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Step 1: Authenticate with Google</h3>
      <Button
        onClick={onGoogleAuth}
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
