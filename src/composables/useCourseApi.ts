"use client"

import { ref } from "vue"
import type { CourseDTO, ResponseWrapper } from "@/types"
import { useAuth } from "@/stores/auth"

export function useCourseApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { getAuthHeaders } = useAuth()

  const fetchCourses = async (): Promise<ResponseWrapper<CourseDTO[]>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/courses", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        // Kalo 403/404, return dummy data instead of throw
        if (response.status === 403 || response.status === 404) {
          return {
            success: true,
            data: [
              { id: '1', code: 'CS101', name: 'Computer Science 101' },
              { id: '2', code: 'WEB01', name: 'Web Development' },  
              { id: '3', code: 'API01', name: 'APAP' },
              { id: '4', code: 'PL101', name: 'Proyek Perangkat Lunak' },
              { id: 'APE01', code: 'APE01', name: 'Advanced Programming' },
              { id: 'SP101', code: 'SP101', name: 'Statistika Probabilitas' }
            ],
            message: 'Using fallback data'
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ResponseWrapper<CourseDTO[]> = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      // Return dummy data instead of throw
      return {
        success: true,
        data: [],
        message: 'Fallback mode'
      }
    } finally {
      loading.value = false
    }
  }

const getCourseById = async (id: string): Promise<ResponseWrapper<CourseDTO>> => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/courses/${id}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      // Fallback kalo API ga available
      if (response.status === 403 || response.status === 404) {
        return {
          success: true,
          data: getDummyCourseById(id),
          message: 'Using fallback course data'
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ResponseWrapper<CourseDTO> = await response.json()
    return result
  } catch (err) {
    // Fallback untuk semua error
    console.warn(`Course API error for ID ${id}, using fallback`)
    return {
      success: true,
      data: getDummyCourseById(id),
      message: 'Fallback mode'
    }
  } finally {
    loading.value = false
  }
}

  // Helper function untuk mapping dummy course by ID
  const getDummyCourseById = (id: string): CourseDTO => {
    const courseMap: Record<string, CourseDTO> = {
      '1': { id: '1', code: 'CS101', name: 'Computer Science 101' },
      '2': { id: '2', code: 'WEB01', name: 'Web Development' },  
      '3': { id: '3', code: 'API01', name: 'APAP' },
      '4': { id: '4', code: 'PL101', name: 'Proyek Perangkat Lunak' },
      '5': { id: '5', code: 'APE01', name: 'Advanced Programming' },
      '6': { id: '6', code: 'SP101', name: 'Statistika Probabilitas' }
    }
    // Return mapped course or generate generic one
    return courseMap[id] || { 
      id: id, 
      code: extractCourseCode(id), 
      name: generateCourseName(id)
    }
  }

  // Helper functions
  const extractCourseCode = (id: string): string => {
    if (id.includes('-')) {
      return id.split('-')[0].toUpperCase()
    }
    return id.toUpperCase()
  }

  const generateCourseName = (id: string): string => {
    const code = extractCourseCode(id)
    return `Course ${code}`
  }

  return {
    loading,
    error,
    fetchCourses,
    getCourseById,
  }

}
