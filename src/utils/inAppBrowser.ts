export function isKakaoTalkInAppBrowser() {
  if (
    typeof navigator ===
    'undefined'
  ) {
    return false
  }

  return /KAKAOTALK/i.test(
    navigator.userAgent,
  )
}