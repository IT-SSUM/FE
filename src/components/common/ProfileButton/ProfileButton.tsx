import type { ComponentPropsWithoutRef } from 'react'
import { Button } from '@/components/common/Button/Button'
import { cn } from '@/utils/cn'

type ProfileButtonProps = ComponentPropsWithoutRef<typeof Button>

export function ProfileButton({ className, ...props }: ProfileButtonProps) {
  return <Button className={cn('w-full', className)} {...props} />
}
