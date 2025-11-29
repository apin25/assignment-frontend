<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, FileText, X, Clock, Eye, AlertCircle } from 'lucide-vue-next'
import type { CreateFileDTO, ResponseWrapper, FileDTO } from '@/types'
import { useToast } from '@/stores/toast'
import { useFileApi } from '@/composables/useFileApi'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const { showToast } = useToast()
const fileApi = useFileApi()
const { user } = useAuth()

const uploading = ref(false)

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const WARN_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const uploadForm = ref<Omit<CreateFileDTO, 'visibilityRole'> & { visibilityRoles: string[] }>({
  filename: '',
  owner: '',
  contentB64: '',
  minAccessDateTime: '',
  maxAccessDateTime: '',
  visibilityRoles: []
})
const isAllRoles = ref(true)
const availableRoles = ['STUDENT', 'LECTURER', 'ASSISTANT', 'ADMIN']

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const fileSizeWarning = ref('')

// Watch for "ALL" checkbox changes
watch(isAllRoles, (newValue) => {
  if (newValue) {
    uploadForm.value.visibilityRoles = []
  }
})

// Watch for specific role changes
watch(() => uploadForm.value.visibilityRoles, (newRoles) => {
  if (newRoles.length > 0) {
    isAllRoles.value = false
  }
}, { deep: true })

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Check file size
  fileSizeWarning.value = ''
  if (file.size > MAX_FILE_SIZE) {
    fileSizeWarning.value = `File terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    target.value = '' // Clear the input
    selectedFile.value = null
    uploadForm.value.contentB64 = ''
    return
  } else if (file.size > WARN_FILE_SIZE) {
    fileSizeWarning.value = `File cukup besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Upload mungkin memakan waktu lama.`
  }

  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    uploadForm.value.contentB64 = result.split(',')[1]
  }
  reader.onerror = () => {
    showToast('Error membaca file', 'error')
    selectedFile.value = null
    uploadForm.value.contentB64 = ''
  }
  reader.readAsDataURL(file)
  
  if (!uploadForm.value.filename) {
    uploadForm.value.filename = file.name
  }
}

const uploadFile = async () => {
  // Validasi file
  if (!selectedFile.value) {
    showToast('Pilih file terlebih dahulu', 'error')
    return
  }

  // Validasi filename
  if (!uploadForm.value.filename.trim()) {
    showToast('Nama file tidak boleh kosong', 'error')
    return
  }

  // Validasi role visibility
  if (!isAllRoles.value && uploadForm.value.visibilityRoles.length === 0) {
    showToast('⚠️ Pilih minimal satu role untuk akses file, atau centang "ALL" untuk semua user', 'warning')
    return
  }

  // Validasi tanggal
  if (uploadForm.value.minAccessDateTime && uploadForm.value.maxAccessDateTime) {
    const minDate = new Date(uploadForm.value.minAccessDateTime)
    const maxDate = new Date(uploadForm.value.maxAccessDateTime)
    
    if (minDate >= maxDate) {
      showToast('⚠️ Tanggal mulai akses harus lebih awal dari tanggal akhir akses', 'warning')
      return
    }
  }

  uploading.value = true
  
  try {
    showToast('📤 Mengupload file...', 'info', 3000)
    
    // Prepare data untuk backend
    const formData: CreateFileDTO = {
      filename: uploadForm.value.filename.trim(),
      contentB64: uploadForm.value.contentB64,
      owner: user.value?.username || '',
      visibilityRole: isAllRoles.value ? [] : uploadForm.value.visibilityRoles.filter(role => role && role.trim())
    }

    // Handle datetime - pastikan format ISO string
    if (uploadForm.value.minAccessDateTime) {
      try {
        const minDate = new Date(uploadForm.value.minAccessDateTime)
        if (!isNaN(minDate.getTime())) {
          formData.minAccessDateTime = minDate.toISOString()
        }
      } catch (e) {
        console.warn('Invalid minAccessDateTime:', e)
      }
    }
    
    if (uploadForm.value.maxAccessDateTime) {
      try {
        const maxDate = new Date(uploadForm.value.maxAccessDateTime)
        if (!isNaN(maxDate.getTime())) {
          formData.maxAccessDateTime = maxDate.toISOString()
        }
      } catch (e) {
        console.warn('Invalid maxAccessDateTime:', e)
      }
    }

    const result: ResponseWrapper<FileDTO> = await fileApi.uploadFile(formData)

    if (result.success) {
      showToast('✅ File berhasil diupload!', 'success')
      
      setTimeout(() => {
        router.push('/resources/files')
      }, 1500)
      
    } else {
      showToast(result.message || 'Upload gagal', 'error')
    }

  } catch (error: any) {
    
    let errorMessage = 'Terjadi kesalahan saat upload'
    
    if (error.message) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Koneksi terputus. Periksa ukuran file atau koneksi internet Anda.'
      } else if (error.message.includes('413')) {
        errorMessage = 'File terlalu besar untuk server.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Coba file yang lebih kecil.'
      } else {
        errorMessage = error.message
      }
    }
    
    showToast(errorMessage, 'error')
  } finally {
    uploading.value = false
  }
}

const goBack = () => {
  router.push('/resources/files')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center"
        >
          ← Back to Files
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Upload File Baru</h1>
        <p class="text-gray-600 mt-2">Upload file baru ke sistem SCELE-NG dengan pengaturan akses</p>
      </div>

      <!-- Upload Form -->
      <div class="bg-white rounded-2xl shadow-sm border p-8">
        <div class="flex items-center mb-6">
          <div class="p-3 bg-green-100 rounded-xl mr-4">
            <Upload class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">File Upload</h2>
            <p class="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>

        <form @submit.prevent="uploadFile" class="space-y-6">
          <!-- File Selection -->
          <div>
            <label for="file" class="block text-sm font-medium text-gray-700 mb-2">
              Select File <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="file"
                ref="fileInput"
                type="file"
                required
                @change="handleFileSelect"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <!-- File size warning -->
            <div v-if="fileSizeWarning" class="mt-2 p-3 rounded-lg" :class="fileSizeWarning.includes('terlalu besar') ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'">
              <div class="flex items-center">
                <AlertCircle :class="fileSizeWarning.includes('terlalu besar') ? 'h-5 w-5 text-red-600 mr-2' : 'h-5 w-5 text-yellow-600 mr-2'" />
                <p :class="fileSizeWarning.includes('terlalu besar') ? 'text-sm text-red-800' : 'text-sm text-yellow-800'">{{ fileSizeWarning }}</p>
              </div>
            </div>
            
            <p class="text-xs text-gray-500 mt-1">
              Maksimum ukuran file: {{ MAX_FILE_SIZE / 1024 / 1024 }}MB
            </p>
            
            <!-- File Preview -->
            <div v-if="selectedFile" class="mt-3 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <FileText class="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p class="text-sm font-medium text-blue-900">{{ selectedFile.name }}</p>
                    <p class="text-xs text-blue-600">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button type="button" @click="selectedFile = null; uploadForm.contentB64 = ''; fileSizeWarning = ''" class="text-blue-600 hover:text-blue-800">
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Filename -->
          <div>
            <label for="filename" class="block text-sm font-medium text-gray-700 mb-2">
              Filename <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="filename"
                v-model="uploadForm.filename"
                type="text"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter filename..."
              />
            </div>
          </div>

          <!-- Owner -->
          <div>
            <label for="owner" class="block text-sm font-medium text-gray-700 mb-2">
              Owner (Auto-filled)
            </label>
            <div class="relative">
              <input
                id="owner"
                :value="user?.username || 'Loading...'"
                type="text"
                readonly
                class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Owner will be set automatically..."
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Owner otomatis diisi dengan username Anda yang sedang login
            </p>
          </div>

          <!-- Access Time Restrictions -->
          <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h3 class="text-sm font-medium text-yellow-800 mb-3 flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              Access Time Restrictions (Optional)
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="minAccessDateTime" class="block text-sm font-medium text-yellow-700 mb-2">
                  Minimum Access Date & Time
                </label>
                <input
                  id="minAccessDateTime"
                  v-model="uploadForm.minAccessDateTime"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label for="maxAccessDateTime" class="block text-sm font-medium text-yellow-700 mb-2">
                  Maximum Access Date & Time
                </label>
                <input
                  id="maxAccessDateTime"
                  v-model="uploadForm.maxAccessDateTime"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <p class="text-xs text-yellow-600 mt-2">
              Kosongkan untuk tidak ada pembatasan waktu akses
            </p>
          </div>

          <!-- Visibility -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Eye class="h-5 w-5 text-gray-500 mr-2" />
              Role File Permissions <span class="text-red-500 ml-1">*</span>
            </label>
            
            <div class="space-y-3 border border-gray-200 rounded-xl p-4">
              <!-- Checkbox untuk "ALL" -->
              <div class="relative flex items-start">
                <div class="flex h-6 items-center">
                  <input id="all-roles" v-model="isAllRoles" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                </div>
                <div class="ml-3 text-sm leading-6">
                  <label for="all-roles" class="font-medium text-gray-900">ALL - Semua user dapat akses</label>
                </div>
              </div>
              
              <!-- Divider -->
              <hr class="border-gray-200" />
              
              <!-- Checkbox untuk setiap role -->
              <p class="text-sm font-medium text-gray-700" :class="{'text-gray-400': isAllRoles}">Atau pilih role spesifik:</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                <div v-for="role in availableRoles" :key="role" class="relative flex items-start">
                  <div class="flex h-6 items-center">
                    <input 
                      :id="`role-${role}`" 
                      :value="role" 
                      v-model="uploadForm.visibilityRoles" 
                      :disabled="isAllRoles"
                      type="checkbox" 
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                  </div>
                  <div class="ml-3 text-sm leading-6">
                    <label 
                      :for="`role-${role}`" 
                      class="font-medium"
                      :class="isAllRoles ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'"
                    >
                      {{ role }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
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
              :disabled="uploading || !uploadForm.filename.trim() || !selectedFile || fileSizeWarning.includes('terlalu besar')"
              class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload class="h-4 w-4 mr-2" />
              {{ uploading ? 'Uploading...' : 'Upload File' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>