export type ApiFieldError = {
  field: string
  reason: string
}

export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: ApiFieldError[]
}
