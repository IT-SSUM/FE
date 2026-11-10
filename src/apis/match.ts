import { isAxiosError } from 'axios'
import axios from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type { CreateMatchRequest, CreateMatchResponse, MatchListItem, MatchDetail, AcceptMatchResponse, MatchStateResponse } from '@/types/match'
import type { UpdateMatchQuantityRequest, CancelMatchRequest, UpdateMatchAppointmentRequest } from '@/types/match'

export class MatchApiError extends Error {
  readonly response: ApiResponse<unknown>
  constructor(response: ApiResponse<unknown>) {
    super(response.message)
    this.response = response
  }
}
function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) throw new MatchApiError(response)
  return response.data
}
export function parseMatchId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
function path(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('올바른 매칭 번호가 필요합니다.')
  return `/api/matches/${id}`
}
export async function getMatches(signal?: AbortSignal): Promise<MatchListItem[]> {
  const { data } = await axios.get<ApiResponse<MatchListItem[]>>('/api/matches', { signal })
  const items = unwrap(data)
  if (!Array.isArray(items)) throw new Error('매칭 목록 응답 형식을 확인해 주세요.')
  return items
}
export async function getMatch(id: number, signal?: AbortSignal): Promise<MatchDetail> {
  return unwrap((await axios.get<ApiResponse<MatchDetail>>(path(id), { signal })).data)
}
export async function createMatch(body: CreateMatchRequest): Promise<CreateMatchResponse> {
  const { donationItemId, neededItemId, quantity, message } = body
  if (![donationItemId, neededItemId, quantity].every(n => Number.isSafeInteger(n) && n >= 1) || message.length > 500) {
    throw new Error('물품 번호·수량과 메시지(500자 이하)를 확인해 주세요.')
  }
  return unwrap((await axios.post<ApiResponse<CreateMatchResponse>>('/api/matches', { donationItemId, neededItemId, quantity, message })).data)
}
export async function acceptMatch(id: number): Promise<AcceptMatchResponse> {
  return unwrap((await axios.patch<ApiResponse<AcceptMatchResponse>>(`${path(id)}/accept`)).data)
}
export async function withdrawMatch(id: number): Promise<MatchStateResponse> {
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(id)}/withdraw`)).data)
}
export async function reserveMatch(id: number): Promise<MatchStateResponse> {
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(id)}/reserve`)).data)
}
export async function rejectMatch(id: number): Promise<MatchStateResponse> {
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(id)}/reject`)).data)
}
export async function updateMatchQuantity({ matchId, body }: { matchId: number; body: UpdateMatchQuantityRequest }): Promise<MatchStateResponse> {
  const { quantity } = body
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('수량은 1 이상의 정수로 입력해 주세요.')
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(matchId)}/quantity`, { quantity })).data)
}
export async function completeMatch(id: number): Promise<MatchStateResponse> {
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(id)}/complete`)).data)
}
export async function cancelMatch({ matchId, body }: { matchId: number; body: CancelMatchRequest }): Promise<MatchStateResponse> {
  const reason = body.reason.trim()
  if (!reason) throw new Error('취소 사유를 입력해 주세요.')
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(matchId)}/cancel`, { reason })).data)
}
export async function updateMatchAppointment({ matchId, body }: { matchId: number; body: UpdateMatchAppointmentRequest }): Promise<MatchStateResponse> {
  const { deliveryMethod, scheduledAt, deliveryPlace, receiverName } = body
  if (!deliveryMethod || !deliveryPlace.trim() || !receiverName.trim() || !/T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(scheduledAt) || !Number.isFinite(Date.parse(scheduledAt))) throw new Error('전달 방법·일시·장소·수령인을 확인해 주세요.')
  return unwrap((await axios.patch<ApiResponse<MatchStateResponse>>(`${path(matchId)}/appointment`, { deliveryMethod, scheduledAt, deliveryPlace: deliveryPlace.trim(), receiverName: receiverName.trim() })).data)
}
export function matchErrorMessage(error: unknown): string {
  const response = isAxiosError<ApiResponse<unknown>>(error) ? error.response : undefined
  const body = error instanceof MatchApiError ? error.response : response?.data
  if (response?.status === 401) return '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.'
  const messages: Record<string, string> = {
    MATCH_400: '물품의 카테고리·단위·상태 조건이 맞지 않아요.',
    MATCH_403: '해당 매칭의 당사자만 요청할 수 있어요.',
    MATCH_403_1: '받은 제안·요청만 수락할 수 있어요.',
    MATCH_404: '존재하지 않는 매칭이에요.',
    MATCH_409: '신청 가능한 수량이 부족해요.',
    MATCH_409_1: '이미 응답했거나 응답 대기 상태가 아닌 매칭이에요.',
  }
  return (body?.code && messages[body.code]) || body?.message || (error instanceof Error && !isAxiosError(error) ? error.message : '요청을 처리하지 못했어요. 다시 시도해 주세요.')
}
