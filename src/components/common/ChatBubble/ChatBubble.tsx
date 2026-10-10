import { cn } from '@/utils/cn'

type ChatBubbleSide = 'peer' | 'self'
type ChatBubbleState = 'sent' | 'failed'

type ChatBubbleProps = {
  side?: ChatBubbleSide
  state?: ChatBubbleState
  children: string
  className?: string
}

export function ChatBubble({
  side = 'peer',
  state = 'sent',
  children,
  className,
}: ChatBubbleProps) {
  const isSelf = side === 'self'

  return (
    <div className={cn('flex w-full', isSelf ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[250px] rounded-control px-4 py-3 typography-body-2',
          isSelf
            ? 'bg-primary-700 text-white'
            : 'border border-neutral-200 bg-white text-neutral-900',
          state === 'failed' ? 'border-error text-error' : '',
          className,
        )}
      >
        {children}
        {state === 'failed' ? (
          <p className="mt-1 typography-caption text-error">전송 실패</p>
        ) : null}
      </div>
    </div>
  )
}
