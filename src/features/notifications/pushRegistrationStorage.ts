const KEY = 'itssum.push-registration'
type StoredRegistration = { userId: number; pushRegistrationId: number }

export function getPushRegistration(userId: number): StoredRegistration | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null') as StoredRegistration | null
    return value?.userId === userId && Number.isSafeInteger(value.pushRegistrationId) && value.pushRegistrationId > 0 ? value : null
  } catch { return null }
}

export function savePushRegistration(userId: number, pushRegistrationId: number) {
  if (!Number.isSafeInteger(pushRegistrationId) || pushRegistrationId < 1) throw new Error('푸시 등록 응답 ID를 확인해주세요.')
  localStorage.setItem(KEY, JSON.stringify({ userId, pushRegistrationId }))
}

export function clearPushRegistration(userId: number, pushRegistrationId: number) {
  if (getPushRegistration(userId)?.pushRegistrationId === pushRegistrationId) localStorage.removeItem(KEY)
}
