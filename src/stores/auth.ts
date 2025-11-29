"use client"

import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import type { User, AuthRequest, AuthResponse, UserRegistrationDto, ApiResponseDto, UserUpdateDto } from "@/types/auth"

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem("accessToken"))
const loading = ref(false)

/**
 * Composable untuk mengelola semua state dan logika otentikasi.
 */
export const useAuth = () => {
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === "ADMIN")
  const isLecturer = computed(() => user.value?.role === "LECTURER")
  const isStudent = computed(() => user.value?.role === "STUDENT")
  const isAssistant = computed(() => user.value?.role === "ASSISTANT")

  /**
   * Helper untuk membuat header otentikasi untuk request API.
   */
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token.value}`,
    "Content-Type": "application/json",
  })

  /**
   * Memproses login pengguna, menyimpan token, dan mengambil data pengguna.
   * @param credentials Objek berisi username dan password.
   * @returns boolean yang menandakan keberhasilan login.
   */
  const login = async (credentials: AuthRequest): Promise<boolean> => {
    loading.value = true
    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const result: ApiResponseDto<AuthResponse> = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }

      if (result.success && result.data?.token) {
        token.value = result.data.token
        localStorage.setItem("accessToken", result.data.token)
        
        return await verifyToken()
      } else {
        throw new Error(result.message || "Login failed due to unexpected response.")
      }
    } catch (error) {
      console.error("Login error:", error)
      logout()
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Mendaftarkan pengguna baru.
   * @param userData DTO yang berisi data registrasi.
   */
  const register = async (userData: UserRegistrationDto): Promise<boolean> => {
    loading.value = true
    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const result: ApiResponseDto<null> = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }

      return result.success
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Memverifikasi token yang ada dan mengambil data pengguna terkait.
   * Akan membersihkan state jika token tidak valid.
   */
  const verifyToken = async (): Promise<boolean> => {
    if (!token.value) return false
    
    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/auth/verify", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        logout()
        return false
      }

      const result: ApiResponseDto<User> = await response.json()

      if (result.success && result.data) {
        user.value = result.data
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error("Token verification error:", error)
      logout()
      return false
    }
  }

  /**
   * Mengambil data profil pengguna saat ini.
   */
  const getCurrentUser = async (): Promise<User | null> => {
    if (await verifyToken()) {
      return user.value
    }
    return null
  }

  /**
   * Memperbarui profil pengguna saat ini.
   * @param updateData DTO yang berisi data untuk diupdate.
   */
  const updateProfile = async (updateData: UserUpdateDto): Promise<User | null> => {
    if (!token.value) return null
    loading.value = true
    try {
      const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + "/api/users/me", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      const result: ApiResponseDto<User> = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }

      if (result.success && result.data) {
        user.value = result.data
        return result.data
      } else {
        throw new Error(result.message || "Profile update failed.")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Membersihkan token dan data pengguna dari state dan localStorage.
   */
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem("accessToken")
    if (router.currentRoute.value.path !== "/login") {
      router.push("/login")
    }
  }

  /**
   * Menginisialisasi state otentikasi saat aplikasi dimuat.
   */
  const initAuth = async () => {
    if (token.value) {
      await verifyToken()
    }
  }

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),

    // Computed
    isAuthenticated,
    isAdmin,
    isLecturer,
    isStudent,
    isAssistant,

    // Methods
    login,
    register,
    logout,
    verifyToken,
    getCurrentUser,
    updateProfile,
    initAuth,
    getAuthHeaders,
  }
}
