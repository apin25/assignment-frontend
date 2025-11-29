export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "ADMIN" | "LECTURER" | "STUDENT" | "ASSISTANT"
  createdAt: string
  deletedAt?: string
}

export interface FileDTO {
  id: string
  filename: string
  owner: string
  createdAt: string
  deletedAt?: string
  minAccessDateTime?: string
  maxAccessDateTime?: string
  visibilityRole?: string
}

export interface CreateFileDTO {
  filename: string
  contentB64: string
  owner: string
  minAccessDateTime?: string
  maxAccessDateTime?: string
  visibilityRole?: string
}

export interface UpdateFilenameDTO {
  filename: string
}

export interface ResourceGroupDTO {
  id: string
  name: string
  description: string
  owner: string
  createdAt: string
  modifiedAt: string
  deletedAt?: string
  courseId?: string
}

export interface CreateResourceGroupDTO {
  name: string
  description: string
  owner: string
  courseId?: string
}

export interface UpdateResourceGroupDTO {
  name: string
  description: string
}

export interface CourseDTO {
  id: string
  code: string
  name: string
  description?: string
  createdAt: string
  deletedAt?: string
}

export interface ResponseWrapper<T> {
  success: boolean
  message: string
  data: T
}

export interface Feedback {
  id: string
  courseId: string
  lecturer: string
  createdBy: string
  anonymous: boolean
  clarityScore: number
  engagementScore: number
  overallScore: number
  data: string
  reply: string | null
  createdAt: string
  modifiedAt: string | null
  readAt: string | null
  repliedAt: string | null
  hiddenAt: string | null
}