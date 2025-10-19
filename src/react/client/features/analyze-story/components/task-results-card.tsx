import React from 'react'


import { TASK_MESSAGES, RESULTS_TITLES } from '../constants'
import type { TaskStatus } from '../hooks/use-task-streaming'

import { cn } from '@/client/lib/utils/cn'
import { ScrollArea } from '@/components/ui/scroll-area'


interface TaskResultsCardProps {
  taskType: 'analyze' | 'breakup'
  taskStatus: TaskStatus
  streamingContent: string
  className?: string
}

function TaskResultsCard({
  taskType,
  taskStatus,
  streamingContent,
  className
}: TaskResultsCardProps): React.ReactElement {
  const title = taskType === 'analyze'
    ? RESULTS_TITLES.ANALYZE
    : RESULTS_TITLES.BREAKUP

  const content = streamingContent || (taskStatus === 'loading' ? TASK_MESSAGES.PROCESSING : '')

  return (
    <div className={cn('bg-gray-800 border border-gray-600 rounded-md p-4 flex flex-col', className)}>
      <h4 className="text-sm font-medium text-gray-200 mb-3 flex-shrink-0">
        {title}
      </h4>
      <ScrollArea className="flex-1 min-h-0">
        <div className="pr-4 whitespace-pre-wrap">
          {content}
        </div>
      </ScrollArea>
    </div>
  )
}

export { TaskResultsCard }
