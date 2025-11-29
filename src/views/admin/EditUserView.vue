<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Save, X, User, Mail, Hash, Lock, Eye, EyeOff, XCircle } from 'lucide-vue-next' 
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { User as UserType, AdminUserUpdateDto, ApiResponseDto } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getAuthHeaders, isAdmin } = useAuth()

const loading = ref(false)
const updating = ref(false)
const userData = ref<UserType | null>(null)
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const editForm = ref<AdminUserUpdateDto>({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'STUDENT'
})

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
      editForm.value = {
        username: result.data.username,
        name: result.data.name,
        email: result.data.email,
        password: '',
        role: result.data.role as 'STUDENT' | 'LECTURER' | 'ADMIN'
      }
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

const updateUser = async () => {
  errorMessage.value = null
  if (editForm.value.password && editForm.value.password.length > 0 && editForm.value.password.length < 8) {
    errorMessage.value = 'Password baru harus terdiri dari minimal 8 karakter.'
    return
  }

  updating.value = true
  
  try {
    const updateData: Partial<AdminUserUpdateDto> = {}
        if (editForm.value.name && editForm.value.name !== userData.value?.name) {
      updateData.name = editForm.value.name
    }
    if (editForm.value.email && editForm.value.email !== userData.value?.email) {
      updateData.email = editForm.value.email
    }
    if (editForm.value.password && editForm.value.password.trim()) {
      updateData.password = editForm.value.password
    }
    if (editForm.value.role && editForm.value.role !== userData.value?.role) {
      updateData.role = editForm.value.role
    }

    if (Object.keys(updateData).length === 0) {
      showToast('Tidak ada perubahan untuk disimpan.', 'info')
      updating.value = false
      return
    }

    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/users/${userId}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
      errorMessage.value = errorData.message || `Request failed with status ${response.status}`;
      return;
    }
    
    const result: ApiResponseDto<UserType> = await response.json()
    
    if (result.success) {
      showToast('User berhasil diperbarui!', 'success')
      router.push('/users')
    } else {
      errorMessage.value = result.message || 'Gagal memperbarui user';
    }
  } catch (error: any) {
    console.error('Error updating user:', error)
    errorMessage.value = 'Terjadi kesalahan saat mencoba memperbarui user.';
  } finally {
    updating.value = false
  }
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
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center"
        >
          ← Back to User Management
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Edit User</h1>
        <p class="text-gray-600 mt-2">Update user information and permissions</p>
      </div>

      <div
        v-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md relative"
        role="alert"
      >
        <div class="flex">
          <div class="py-1"><XCircle class="h-6 w-6 text-red-500 mr-4"/></div>
          <div>
            <p class="font-bold">Update Gagal</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>
        <button @click="errorMessage = null" class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <span class="text-2xl text-red-500">&times;</span>
        </button>
      </div>


      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading user data...</p>
      </div>

      <div v-else-if="userData" class="bg-white rounded-2xl shadow-sm border p-8">
        <div class="flex items-center mb-6">
          <div class="p-3 bg-yellow-100 rounded-xl mr-4">
            <User class="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">User Information</h2>
            <p class="text-sm text-gray-600">ID: {{ userData.id }}</p>
          </div>
        </div>

        <form @submit.prevent="updateUser" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                :value="editForm.username"
                type="text"
                readonly
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>

        
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                v-model="editForm.name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="editForm.email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              New Password (Optional)
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="editForm.password"
                :type="showPassword ? 'text' : 'password'"
                minlength="8"
                title="Jika diisi, password baru harus minimal 8 karakter"
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl"
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Leave blank to keep current password. If filled, must be at least 8 characters.</p>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Role <span class="text-red-500">*</span>
            </label>
            <select
              id="role"
              v-model="editForm.role"
              required
              class="block w-full px-3 py-3 border border-gray-300 rounded-xl"
            >
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
          </div>

          <div class="flex justify-end gap-4 pt-6">
            <button
              type="button"
              @click="goBack"
              class="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl"
            >
              <X class="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl"
            >
              <Save class="h-4 w-4 mr-2" />
              {{ updating ? 'Updating...' : 'Update User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
