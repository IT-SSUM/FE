import axiosInstance from '@/apis/axios'
import type { ApiResponse, MatchListItem } from './types'

export async function getMatches() {
  const response = await axiosInstance.get<ApiResponse<MatchListItem[]>>('/api/matches')
  return response.data.data
}
