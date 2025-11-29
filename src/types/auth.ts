export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "STUDENT" | "LECTURER" | "ADMIN" | "ASSISTANT"
  createdAt: string
  deletedAt?: string | null
}

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface UserRegistrationDto {
  username: string
  email: string
  name: string
  password: string
  role: "STUDENT" | "LECTURER" | "ASSISTANT"
}

export interface UserUpdateDto {
  name?: string
  email?: string
  password?: string
}

export interface AdminUserUpdateDto {
  username?: string
  name?: string
  email?: string
  password?: string
  role?: "STUDENT" | "LECTURER" | "ASSISTANT"
}

export interface UserLookupDto {
  id: string;
  name: string;
}

export interface UsernameDto {
  id: string;
  username: string;
  name: string;
}

export interface ApiResponseDto<T> {
  success: boolean
  message: string
  data: T
}