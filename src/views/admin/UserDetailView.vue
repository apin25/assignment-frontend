<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  User, 
  Mail, 
  Hash, 
  Calendar, 
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { User as UserType, ApiResponseDto } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getAuthHeaders, isAdmin } = useAuth()

const loading = ref(false)
const userData = ref<UserType | null>(null)

const userId = route.params.id as string

const fetchUserData = async () => {
  loading.value = true
  try {
    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/users/${userId}`, {
      headers: getAuthHeaders()
    })
    
    const result: ApiResponseDto<UserType> = await response.json()
    
    if (result.success) {
      userData.value = result.data
    } else {
      showToast('Failed to load user data', 'error')
      router.push('/users')
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    showToast('Error loading user data', 'error')
    router.push('/users')
  } finally {
    loading.value = false
  }
}

const deleteUser = async () => {
  if (!userData.value) return
  
  if (!confirm(`Apakah Anda yakin ingin menghapus user "${userData.value.name}"?`)) {
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    const result: ApiResponseDto<null> = await response.json()
    
    if (result.success) {
      showToast('User berhasil dihapus!', 'success')
      router.push('/users')
    } else {
      showToast(result.message || 'Hapus gagal', 'error')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast('Error saat hapus user', 'error')
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
    case 'LECTURER': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN': return Shield
    case 'LECTURER': return UserCheck
    case 'STUDENT': return User
    default: return User
  }
}

const isUserDeleted = (user: UserType): boolean => {
  return !!user.deletedAt
}

const goBack = () => {
  router.push('/users')
}

const checkAdminStatus = () => {
  if (!isAdmin.value) {
    router.push('/dashboard')
  } else {
    fetchUserData()
  }
}

onMounted(() => {
  checkAdminStatus()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to User Management
        </button>
        <h1 class="text-3xl font-bold text-gray-900">User Details</h1>
        <p class="text-gray-600 mt-2">View and manage user information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading user details...</p>
      </div>

      <!-- User Details -->
      <div v-else-if="userData" class="space-y-6">
        <!-- Main Info Card -->
        <div class="bg-white rounded-2xl shadow-sm border p-8">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center">
              <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mr-6">
                <span class="text-white text-2xl font-bold">
                  {{ userData.name.split(' ').map(n => n[0]).join('') }}
                </span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1" :class="{ 'line-through text-gray-500': isUserDeleted(userData) }">
                  {{ userData.name }}
                </h2>
                <p class="text-gray-600 mb-2" :class="{ 'line-through text-gray-400': isUserDeleted(userData) }">
                  @{{ userData.username }}
                </p>
                <div class="flex items-center gap-3">
                  <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border', getRoleBadgeColor(userData.role), isUserDeleted(userData) ? 'opacity-50' : '']">
                    <component :is="getRoleIcon(userData.role)" class="w-4 h-4 mr-1" />
                    {{ userData.role }}
                  </span>
                  <span v-if="isUserDeleted(userData)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <UserX class="w-4 h-4 mr-1" />
                    DELETED
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div v-if="!isUserDeleted(userData)" class="flex gap-3">
              <RouterLink
                :to="`/users/${userData.id}/edit`"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Edit class="w-4 h-4" />
                Edit User
              </RouterLink>
              
              <button
                @click="deleteUser"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Trash2 class="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>

          <!-- User Information Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- User ID -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div class="flex items-center mb-2">
                <Hash class="h-5 w-5 text-gray-600 mr-2" />
                <span class="text-sm font-medium text-gray-800">User ID</span>
              </div>
              <p class="text-lg font-mono text-gray-900 break-all">{{ userData.id }}</p>
            </div>
            
            <!-- Username -->
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div class="flex items-center mb-2">
                <User class="h-5 w-5 text-blue-600 mr-2" />
                <span class="text-sm font-medium text-blue-800">Username</span>
              </div>
              <p class="text-lg font-semibold text-blue-900" :class="{ 'line-through text-gray-400': isUserDeleted(userData) }">
                @{{ userData.username }}
              </p>
            </div>
            
            <!-- Email -->
            <div class="bg-green-50 rounded-xl p-4 border border-green-100">
              <div class="flex items-center mb-2">
                <Mail class="h-5 w-5 text-green-600 mr-2" />
                <span class="text-sm font-medium text-green-800">Email</span>
              </div>
              <p class="text-lg font-semibold text-green-900 break-all" :class="{ 'line-through text-gray-400': isUserDeleted(userData) }">
                {{ userData.email }}
              </p>
            </div>
            
            <!-- Full Name -->
            <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div class="flex items-center mb-2">
                <User class="h-5 w-5 text-purple-600 mr-2" />
                <span class="text-sm font-medium text-purple-800">Full Name</span>
              </div>
              <p class="text-lg font-semibold text-purple-900" :class="{ 'line-through text-gray-400': isUserDeleted(userData) }">
                {{ userData.name }}
              </p>
            </div>
            
            <!-- Created At -->
            <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div class="flex items-center mb-2">
                <Calendar class="h-5 w-5 text-yellow-600 mr-2" />
                <span class="text-sm font-medium text-yellow-800">Created At</span>
              </div>
              <p class="text-lg font-semibold text-yellow-900">
                {{ formatDate(userData.createdAt) }}
              </p>
            </div>
            
            <!-- Deleted At (if applicable) -->
            <div v-if="isUserDeleted(userData)" class="bg-red-50 rounded-xl p-4 border border-red-100">
              <div class="flex items-center mb-2">
                <Calendar class="h-5 w-5 text-red-600 mr-2" />
                <span class="text-sm font-medium text-red-800">Deleted At</span>
              </div>
              <p class="text-lg font-semibold text-red-900">
                {{ formatDate(userData.deletedAt!) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Additional Information Card -->
        <div class="bg-white rounded-2xl shadow-sm border p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Account Status</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Account Status -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center">
                <div :class="[
                  'w-3 h-3 rounded-full mr-3',
                  isUserDeleted(userData) ? 'bg-red-500' : 'bg-green-500'
                ]"></div>
                <span class="text-sm font-medium text-gray-700">Account Status</span>
              </div>
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                isUserDeleted(userData) 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              ]">
                {{ isUserDeleted(userData) ? 'Deleted' : 'Active' }}
              </span>
            </div>

            <!-- Role Permissions -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center">
                <Shield class="w-5 h-5 text-gray-600 mr-3" />
                <span class="text-sm font-medium text-gray-700">Role Permissions</span>
              </div>
              <span :class="['px-3 py-1 rounded-full text-sm font-medium', getRoleBadgeColor(userData.role)]">
                {{ userData.role }}
              </span>
            </div>
          </div>

          <!-- Role Description -->
          <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Role Description:</h4>
            <p class="text-sm text-blue-700">
              <template v-if="userData.role === 'ADMIN'">
                Full system access including user management, file management, and all administrative functions.
              </template>
              <template v-else-if="userData.role === 'LECTURER'">
                Access to course management, file uploads, student interactions, and grading functions.
              </template>
              <template v-else-if="userData.role === 'STUDENT'">
                Access to enrolled courses, file downloads, assignments, and basic profile management.
              </template>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>