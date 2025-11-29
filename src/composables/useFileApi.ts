"use client"

import { ref } from "vue"
import type { FileDTO, CreateFileDTO, UpdateFilenameDTO, ResponseWrapper } from "@/types"
import { useAuth } from "@/stores/auth"

export function useFileApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { getAuthHeaders } = useAuth()

  // Helper function to handle API responses
  const handleResponse = async (response: Response): Promise<ResponseWrapper<any>> => {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorText = await response.text()
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
        }
      } catch {
      }
      throw new Error(errorMessage)
    }

    const text = await response.text()
    if (!text) {
      throw new Error("Empty response from server")
    }

    try {
      return JSON.parse(text)
    } catch {
      throw new Error("Invalid JSON response from server")
    }
  }

  const fetchFiles = async (params?: URLSearchParams): Promise<ResponseWrapper<FileDTO[]>> => {
      loading.value = true
      error.value = null

      try {
        const endpoint = "/api/resources/files"
        const url = `${import.meta.env.VITE_BE_AUTH_URL}${endpoint}${params ? "?" + params.toString() : ""}`
        console.log("Fetching from URL:", url)

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        })

        return await handleResponse(response)
      } catch (err) {
        error.value = err instanceof Error ? err.message : "Unknown error occurred"
        throw err
      } finally {
        loading.value = false
      }
    }

  const fetchAllFiles = async (params?: URLSearchParams): Promise<ResponseWrapper<FileDTO[]>> => {
    return fetchFiles(params)
  }

  const getFileById = async (id: string): Promise<ResponseWrapper<FileDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/files/${id}`, {
        headers: getAuthHeaders(),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  const getFileContent = async (id: string): Promise<ResponseWrapper<string>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/files/${id}/content`, {
        headers: getAuthHeaders(),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadFile = async (fileData: CreateFileDTO): Promise<ResponseWrapper<FileDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/resources/files", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(fileData),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFile = async (id: string, updateData: UpdateFilenameDTO): Promise<ResponseWrapper<FileDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/files/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFile = async (id: string): Promise<ResponseWrapper<null>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/files/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchFiles,
    fetchAllFiles,
    getFileById,
    getFileContent,
    uploadFile,
    updateFile,
    deleteFile,
  }
}
