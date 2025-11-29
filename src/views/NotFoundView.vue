<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ArrowLeft, FileQuestion } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <!-- 404 Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mb-6">
          <FileQuestion class="w-12 h-12 text-white" />
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. 
          Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button
          @click="goHome"
          class="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Home class="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        
        <button
          @click="goBack"
          class="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p class="text-sm text-blue-800">
          <strong>Need help?</strong> Jika Anda yakin URL ini seharusnya ada, 
          silakan hubungi administrator sistem.
        </p>
      </div>
    </div>
  </div>
</template>
