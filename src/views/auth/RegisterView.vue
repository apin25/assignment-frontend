<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Mail, Lock, User, Hash } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { UserRegistrationDto } from '@/types/auth'
import ErrorBanner from '@/components/ErrorBanner.vue'
import PasswordValidation from '@/components/PasswordValidation.vue'

const router = useRouter()
const { showToast } = useToast()
const { register, loading } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

const registerForm = ref<UserRegistrationDto & { confirmPassword: string }>({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'STUDENT'
})

const handleRegister = async () => {
  showError.value = false
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorTitle.value = 'Registrasi Gagal'
    errorMessage.value = 'Password dan konfirmasi password tidak sama!'
    showError.value = true
    showToast('Password dan konfirmasi password tidak sama!', 'error')
    return
  }

  if (registerForm.value.password.length < 8) {
    errorTitle.value = 'Registrasi Gagal'
    errorMessage.value = 'Password harus minimal 8 karakter!'
    showError.value = true
    showToast('Password harus minimal 8 karakter!', 'error')
    return
  }

  try {
    const { confirmPassword, ...registrationData } = registerForm.value
    const success = await register(registrationData)
        
    if (success) {
      showToast('Registrasi berhasil! Silakan login dengan akun baru Anda.', 'success')
      router.push('/login')
    }
  } catch (error: any) {
    errorTitle.value = 'Registrasi Gagal'
    errorMessage.value = error.message || 'Registrasi gagal. Silakan coba lagi.'
    showError.value = true
    showToast(error.message || 'Registrasi gagal. Silakan coba lagi.', 'error')
  }
}

const closeError = () => {
  showError.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <img src="/images/ui-logo.png" alt="UI Logo" class="h-16 w-16" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Daftar SCELE-NG
        </h2>
        <p class="text-gray-600">
          Buat akun baru untuk mengakses sistem
        </p>
      </div>

      <!-- Register Form -->
      <div class="bg-white rounded-2xl shadow-xl border p-8">
        <!-- Error Banner -->
        <ErrorBanner
          :show="showError"
          :title="errorTitle"
          :message="errorMessage"
          @close="closeError"
        />

        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Username -->
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
                v-model="registerForm.username"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Username unik Anda"
              />
            </div>
          </div>

          <!-- Full Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                v-model="registerForm.name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nama lengkap Anda"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="registerForm.email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="nama@ui.ac.id"
              />
            </div>
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              v-model="registerForm.role"
              required
              class="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
            </select>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <!-- Password Validation -->
            <PasswordValidation :password="registerForm.password" />
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ulangi password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading || registerForm.password.length < 8 || registerForm.password !== registerForm.confirmPassword"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Sudah punya akun?
            <RouterLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Masuk sekarang
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
