"use client"

import { ref } from "vue"
import type {
  ResourceGroupDTO,
  CreateResourceGroupDTO,
  UpdateResourceGroupDTO,
  FileDTO,
  ResponseWrapper,
} from "@/types"
import { useAuth } from "@/stores/auth"

export function useResourceGroupApi() {
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

  const getGroups = async (): Promise<ResponseWrapper<ResourceGroupDTO[]>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/resources/groups", {
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

  const getGroupById = async (id: string): Promise<ResponseWrapper<ResourceGroupDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${id}`, {
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

  const createGroup = async (groupData: CreateResourceGroupDTO): Promise<ResponseWrapper<ResourceGroupDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/resources/groups", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(groupData),
      })

      return await handleResponse(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error occurred"
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGroup = async (
    id: string,
    updateData: UpdateResourceGroupDTO,
  ): Promise<ResponseWrapper<ResourceGroupDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${id}`, {
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

  const deleteGroup = async (id: string): Promise<ResponseWrapper<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${id}`, {
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

  const getFilesInGroup = async (id: string): Promise<ResponseWrapper<FileDTO[]>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${id}/files`, {
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

  const addFileToGroup = async (groupId: string, resourceId: string): Promise<ResponseWrapper<FileDTO>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${groupId}/files/${resourceId}`, {
        method: "POST",
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

  const removeFileFromGroup = async (groupId: string, resourceId: string): Promise<ResponseWrapper<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/resources/groups/${groupId}/files/${resourceId}`, {
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
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getFilesInGroup,
    addFileToGroup,
    removeFileFromGroup,
  }
}
