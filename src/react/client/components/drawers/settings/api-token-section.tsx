import React from 'react'

import { Input } from '@/client/components/ui/input'


export type ApiTokenSectionProps = {
  apiKey: string
  hasStoredToken: boolean
  isSubmitting: boolean
  googleAuthStatus: 'idle' | 'loading' | 'success' | 'error'
  onApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function ApiTokenSection({
  apiKey,
  hasStoredToken,
  isSubmitting,
  googleAuthStatus,
  onApiKeyChange
}: ApiTokenSectionProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Step 2: Add Shortcut API Token</h3>
      <div className="flex items-center space-x-2">
        <Input
          name="apiKey"
          placeholder={hasStoredToken ? '••••••••••••••••••' : 'Shortcut API Key'}
          value={apiKey}
          onChange={onApiKeyChange}
          disabled={isSubmitting || googleAuthStatus !== 'success'}
          type="password"
        />
      </div>
      <p className="text-gray-400 text-xs">
        {googleAuthStatus !== 'success'
          ? 'Please complete Google authentication first.'
          : hasStoredToken
            ? 'API token saved. Enter a new token to update.'
            : 'This token enables advanced AI features for Shortcut.'}
      </p>
    </div>
  )
}

export { ApiTokenSection }
