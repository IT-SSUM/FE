import axiosInstance from '@/apis/axios'
import type { ApiResponse, MatchDetail, MatchListItem } from './types'

export async function getMatches() {
  const response = await axiosInstance.get<ApiResponse<MatchListItem[]>>('/api/matches')
  return response.data.data
}

export async function getMatch(matchId: number) {
  const response = await axiosInstance.get<ApiResponse<MatchDetail>>(`/api/matches/${matchId}`)
  return response.data.data
}
