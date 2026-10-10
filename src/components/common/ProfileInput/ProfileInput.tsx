import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Input } from '@/components/common/Input/Input'

type ProfileInputProps = ComponentPropsWithoutRef<typeof Input>

export const ProfileInput = forwardRef<HTMLInputElement, ProfileInputProps>(
  (props, ref) => <Input ref={ref} {...props} />,
)

ProfileInput.displayName = 'ProfileInput'
