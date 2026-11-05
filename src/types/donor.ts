export type DonorProfile = {
  email: string
  name: string
  birthDate: string
  phone: string
  regionId: number
  regionName: string
}

export type UpdateDonorProfileRequest = {
  name?: string
  birthDate?: string
  phone?: string
}