import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

const VIEWPORT_GAP = 12
const POPOVER_GAP = 8

export function useViewportPopover<T extends HTMLElement>(open: boolean, preferredHeight: number) {
  const anchorRef = useRef<T>(null)
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP - POPOVER_GAP
    const availableAbove = rect.top - VIEWPORT_GAP - POPOVER_GAP
    const placeBelow = availableBelow >= preferredHeight || availableBelow >= availableAbove
    const width = Math.min(rect.width, window.innerWidth - VIEWPORT_GAP * 2)
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_GAP),
      window.innerWidth - width - VIEWPORT_GAP,
    )
    const availableHeight = Math.max(0, placeBelow ? availableBelow : availableAbove)

    setPopoverStyle({
      position: 'fixed',
      left,
      width,
      maxHeight: availableHeight,
      visibility: 'visible',
      ...(placeBelow
        ? { top: rect.bottom + POPOVER_GAP, bottom: 'auto' }
        : { top: 'auto', bottom: window.innerHeight - rect.top + POPOVER_GAP }),
    })
  }, [preferredHeight])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  return { anchorRef, popoverStyle }
}
