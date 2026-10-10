import {
  House,
  MessageSquare,
  Plus,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { cn } from '@/utils/cn'

export type BottomNavigationActiveItem =
  | 'home'
  | 'explore'
  | 'register'
  | 'chat'
  | 'my'

type BottomNavigationItem = {
  key: BottomNavigationActiveItem
  label: string
  to: string
  icon: LucideIcon
}

type BottomNavigationProps = {
  activeItem?: BottomNavigationActiveItem
  className?: string
}

const donorNavigationItems: BottomNavigationItem[] = [
  { key: 'home', label: '홈', to: ROUTES.donor.home, icon: House },
  { key: 'explore', label: '탐색', to: ROUTES.donor.needList, icon: Search },
  { key: 'register', label: '등록', to: ROUTES.donor.donationNew, icon: Plus },
  { key: 'chat', label: '채팅', to: ROUTES.chatList, icon: MessageSquare },
  { key: 'my', label: '마이', to: ROUTES.donor.myPage, icon: UserRound },
]

export function BottomNavigation({
  activeItem,
  className,
}: BottomNavigationProps) {
  return (
    <nav
      aria-label="기부자 하단 내비게이션"
      className={cn(
        'grid h-20 w-full max-w-[393px] grid-cols-5 border-t border-neutral-200 bg-white px-2',
        className,
      )}
    >
      {donorNavigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center justify-center gap-1 typography-label-2 transition-colors',
                isActive || activeItem === item.key
                  ? 'text-primary-700'
                  : 'text-neutral-700',
              )
            }
          >
            {({ isActive }) => {
              const active = isActive || activeItem === item.key

              return (
                <>
                  <span
                    className={cn(
                      'flex h-6 w-10 items-center justify-center rounded-control text-primary-700 transition-colors',
                      active ? 'bg-primary-100' : 'bg-transparent',
                    )}
                  >
                    <Icon aria-hidden size={24} strokeWidth={2} />
                  </span>
                  <span>{item.label}</span>
                </>
              )
            }}
          </NavLink>
        )
      })}
    </nav>
  )
}
