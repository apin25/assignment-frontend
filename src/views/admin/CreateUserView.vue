<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserPlus, Save, X, User, Mail, Hash, Lock, Eye, EyeOff, XCircle } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { UserRegistrationDto, ApiResponseDto, User as UserType } from '@/types/auth'

const router = useRouter()
const { showToast } = useToast()
const { getAuthHeaders, isAdmin } = useAuth()

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const userForm = ref<UserRegistrationDto>({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'STUDENT'
})

const createUser = async () => {
  errorMessage.value = null

  if (userForm.value.password.length < 8) {
    errorMessage.value = 'Password harus terdiri dari minimal 8 karakter.'
    return
  }

  loading.value = true
 
  console.log('Payload yang akan dikirim ke API:', userForm.value);

  try {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    };

    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + '/api/users', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(userForm.value)
    })
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        errorMessage.value = errorData.message || `Request failed with status ${response.status}`;
        return;
    }

    const result: ApiResponseDto<UserType> = await response.json()
    
    if (result.success) {
      showToast('User berhasil dibuat!', 'success') 
      router.push('/users')
    } else {
      errorMessage.value = result.message || 'Gagal membuat user';
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    errorMessage.value = 'Terjadi kesalahan saat mencoba membuat user.';
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/users')
}

if (!isAdmin.value) {
  router.push('/dashboard')
}
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
        <h1 class="text-3xl font-bold text-gray-900">Create New User</h1>
        <p class="text-gray-600 mt-2">Add a new user to the system</p>
      </div>

      <div
        v-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md relative"
        role="alert"
      >
        <div class="flex">
          <div class="py-1"><XCircle class="h-6 w-6 text-red-500 mr-4"/></div>
          <div>
            <p class="font-bold">Pembuatan User Gagal</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>
        <button @click="errorMessage = null" class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <span class="text-2xl text-red-500">&times;</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border p-8">
        <div class="flex items-center mb-6">
          <div class="p-3 bg-green-100 rounded-xl mr-4">
            <UserPlus class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">User Information</h2>
            <p class="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>

        <form @submit.prevent="createUser" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="userForm.username"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter unique username"
              />
            </div>
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
                v-model="userForm.name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                v-model="userForm.email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="userForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                title="Password harus terdiri dari minimal 8 karakter"
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter password (min. 8 characters)"
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
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Role <span class="text-red-500">*</span>
            </label>
            <select
              id="role"
              v-model="userForm.role"
              required
              class="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              class="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-colors"
            >
              <X class="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save class="h-4 w-4 mr-2" />
              {{ loading ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
