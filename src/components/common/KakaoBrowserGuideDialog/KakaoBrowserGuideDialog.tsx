import {
  useState,
} from 'react'

import {
  Dialog,
} from '@/components/common/Dialog/Dialog'

type KakaoBrowserGuideDialogProps = {
  open: boolean
  onClose: () => void
}

export function KakaoBrowserGuideDialog({
  open,
  onClose,
}: KakaoBrowserGuideDialogProps) {
  const [
    copying,
    setCopying,
  ] =
    useState(false)

  const handleCopyLink =
    async () => {
      if (
        copying
      ) {
        return
      }

      setCopying(true)

      try {
        await copyText(
          window.location.href,
        )

        onClose()

        window.alert(
          '링크를 복사했어요.\nSafari 또는 Chrome에서 열어 주세요.',
        )
      } catch {
        window.alert(
          '링크 복사에 실패했어요.\n카카오톡 메뉴에서 주소를 복사한 뒤 Safari 또는 Chrome에서 열어 주세요.',
        )
      } finally {
        setCopying(false)
      }
    }

  return (
    <Dialog
      open={
        open
      }
      title="외부 브라우저에서 열어주세요"
      description="카카오톡 내부 브라우저에서는 PDF 저장 및 인쇄 기능이 제한될 수 있어요. 링크를 복사한 뒤 Safari 또는 Chrome에서 열어 다시 시도해 주세요."
      confirmText={
        copying
          ? '복사 중...'
          : '링크 복사'
      }
      cancelText="닫기"
      confirmDisabled={
        copying
      }
      onConfirm={() =>
        void handleCopyLink()
      }
      onCancel={
        onClose
      }
    />
  )
}

async function copyText(
  text: string,
) {
  if (
    navigator.clipboard
      ?.writeText
  ) {
    await navigator.clipboard.writeText(
      text,
    )

    return
  }

  const textarea =
    document.createElement(
      'textarea',
    )

  textarea.value =
    text

  textarea.setAttribute(
    'readonly',
    '',
  )

  textarea.style.position =
    'fixed'

  textarea.style.left =
    '-9999px'

  textarea.style.opacity =
    '0'

  document.body.appendChild(
    textarea,
  )

  textarea.select()

  const copied =
    document.execCommand(
      'copy',
    )

  textarea.remove()

  if (
    !copied
  ) {
    throw new Error(
      'Failed to copy URL',
    )
  }
}