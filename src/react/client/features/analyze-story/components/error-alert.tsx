import React from 'react'


interface ErrorAlertProps {
    error: string
}

function ErrorAlert({ error }: ErrorAlertProps): React.ReactElement {
  return (
    <div className="bg-red-900 border border-red-700 rounded-md p-3">
      <p className="text-sm text-red-200">{error}</p>
    </div>
  )
}

export { ErrorAlert }
