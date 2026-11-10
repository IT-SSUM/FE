import axiosInstance from '@/apis/axios'

export async function withdrawCurrentUser() {
  await axiosInstance.delete('/api/users/me')
}
