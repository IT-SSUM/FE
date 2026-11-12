import chatIcon from '@/assets/logo/chat.svg'
import checkIcon from '@/assets/logo/check.svg'
import plannerIcon from '@/assets/logo/planner.svg'

export type NotificationViewItem = {
  id: number
  type: string
  title: string
  description: string
  unread: boolean
  to: string | null
  time: string
}

function notificationIcon(type: string) {
  switch (type) {
    case 'MATCH_REQUESTED':
    case 'CHAT':
      return chatIcon

    case 'MATCH_ACCEPTED':
    case 'MATCH_RESERVED':
    case 'MATCH_SCHEDULED':
      return plannerIcon

    case 'MATCH_COMPLETED':
    case 'MATCH_RECEIVE_REQUIRED':
    case 'MATCH_CANCELED':
    case 'MATCH_REJECTED':
      return checkIcon

    default:
      return chatIcon
  }
}

export function NotificationCard({
  notification,
  disabled,
  onClick,
}: {
  notification: NotificationViewItem
  disabled: boolean
  onClick: () => void
}) {
  const icon = notificationIcon(notification.type)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        notification.unread
          ? 'w-full rounded-card bg-primary-100 p-4 text-left transition-opacity disabled:opacity-60'
          : 'w-full rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100 disabled:opacity-60'
      }
    >
      <div className="flex items-start gap-3">
        <img
          src={icon}
          alt=""
          aria-hidden
          className="mt-0.5 size-6 shrink-0 object-contain"
        />

        <div className="min-w-0 flex-1">
          <h3 className="typography-title-3 text-neutral-900">
            {notification.title}
          </h3>
          <p className="mt-1 break-words typography-body-2 text-neutral-700">
            {notification.description}
          </p>
          <p className="mt-1 text-right typography-label-2 text-neutral-700">
            {notification.time}
          </p>
        </div>
      </div>
    </button>
  )
}
