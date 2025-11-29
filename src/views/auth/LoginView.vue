<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, User, Lock } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { AuthRequest } from '@/types/auth'
import ErrorBanner from '@/components/ErrorBanner.vue'
import PasswordValidation from '@/components/PasswordValidation.vue'

const router = useRouter()
const { showToast } = useToast()
const { login, loading } = useAuth()

const showPassword = ref(false)
const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

const loginForm = ref<AuthRequest>({
  username: '',
  password: ''
})

const handleLogin = async () => {
  showError.value = false
  
  try {
    const success = await login(loginForm.value)
    if (success) {
      showToast('Login berhasil! Selamat datang kembali.', 'success')
      router.push('/dashboard')
    }
  } catch (error: any) {
    errorTitle.value = 'Login Gagal'
    errorMessage.value = error.message || 'Username atau password salah. Silakan coba lagi.'
    showError.value = true
    showToast(error.message || 'Login gagal. Periksa username dan password Anda.', 'error')
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
          Masuk ke SCELE-NG
        </h2>
        <p class="text-gray-600">
          Student Centered e-Learning Environment
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-xl border p-8">
        <!-- Error Banner -->
        <ErrorBanner
          :show="showError"
          :title="errorTitle"
          :message="errorMessage"
          @close="closeError"
        />

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="loginForm.username"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <!-- Password Field -->
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
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan password"
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
            <PasswordValidation :password="loginForm.password" />
          </div>

          <!-- Remember Me & Forgot Password -->
          <!-- <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div> -->

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading || loginForm.password.length < 8"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Belum punya akun?
            <RouterLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Daftar sekarang
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
