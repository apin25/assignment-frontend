<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Save, FileText, User } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useFileApi } from '@/composables/useFileApi'
import type { FileDTO, UpdateFilenameDTO, ResponseWrapper } from '@/types'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const fileApi = useFileApi()

const loading = ref(false)
const saving = ref(false)
const fileData = ref<FileDTO | null>(null)
const filename = ref('')

const fileId = route.params.id as string

const fetchFileData = async () => {
  loading.value = true
  try {
    const result: ResponseWrapper<FileDTO> = await fileApi.getFileById(fileId)
    
    if (result.success) {
      fileData.value = result.data
      filename.value = result.data.filename
    } else {
      showToast('Failed to load file data', 'error')
      router.push('/resources/files')
    }
  } catch (error: any) {
    showToast(error.message || 'Error loading file data', 'error')
    router.push('/resources/files')
  } finally {
    loading.value = false
  }
}


const updateFilename = async () => {
  if (!filename.value.trim()) {
    showToast('Filename tidak boleh kosong', 'error')
    return
  }

  if (!fileData.value) {
    showToast('Data file tidak tersedia', 'error')
    return
  }

  if (filename.value.trim() === fileData.value.filename) {
    showToast('Filename tidak ada perubahan', 'warning')
    return
  }

  saving.value = true
  try {
    const updateData: UpdateFilenameDTO = {
      filename: filename.value.trim()
    }
    
    const result: ResponseWrapper<FileDTO> = await fileApi.updateFile(fileId, updateData)
    
    if (result.success && result.data) {
      fileData.value = result.data
      showToast('Filename berhasil diupdate!', 'success')
      router.push(`/resources/files/${fileId}`)
    } else {
      showToast(result.message || 'Update gagal', 'error')
    }
  } catch (error: any) {
    showToast(error.message || 'Error saat update filename', 'error')
  } finally {
    saving.value = false
  }
}


const goBack = () => {
  router.push(`/resources/files/${fileId}`)
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

// Validate filename format
const isValidFilename = (name: string): boolean => {
  const invalidChars = /[<>:"/\\|?*]/
  return !invalidChars.test(name) && name.length > 0 && name.length <= 255
}

const getFilenameError = (): string => {
  if (!filename.value.trim()) {
    return 'Filename tidak boleh kosong'
  }
  if (!isValidFilename(filename.value.trim())) {
    return 'Filename mengandung karakter yang tidak valid'
  }
  if (filename.value.trim().length > 255) {
    return 'Filename terlalu panjang (maksimal 255 karakter)'
  }
  return ''
}

onMounted(() => {
  fetchFileData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to File Details
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Edit File</h1>
        <p class="text-gray-600 mt-2">Update file information</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading file data...</p>
      </div>

      <!-- Edit Form -->
      <div v-else-if="fileData" class="bg-white rounded-2xl shadow-sm border p-8">
        <div class="flex items-center mb-6">
          <div class="p-3 bg-orange-100 rounded-xl mr-4">
            <FileText class="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Edit File Information</h2>
            <p class="text-sm text-gray-600">Update the filename below</p>
          </div>
        </div>

        <form @submit.prevent="updateFilename" class="space-y-6">
          <!-- Current File Info (Read-only) -->
          <div class="bg-gray-50 rounded-xl p-4 border">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Current File Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">File ID:</span>
                <span class="ml-2 font-medium font-mono text-xs">{{ fileData.id }}</span>
              </div>
              <div>
                <span class="text-gray-500">Owner:</span>
                <span class="ml-2 font-medium">{{ fileData.owner }}</span>
              </div>
              <div>
                <span class="text-gray-500">Created:</span>
                <span class="ml-2 font-medium">{{ formatDate(fileData.createdAt) }}</span>
              </div>

            </div>
          </div>

          <!-- Filename Input -->
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
                v-model="filename"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter new filename..."
              />
            </div>
          </div>

          <!-- Preview -->
          <div v-if="filename.trim() && filename.trim() !== fileData.filename" class="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Preview Changes</h4>
            <div class="text-sm">
              <div class="flex items-center">
                <span class="text-gray-600">Current:</span>
                <span class="ml-2 font-medium text-gray-900">{{ fileData.filename }}</span>
              </div>
              <div class="flex items-center mt-1">
                <span class="text-blue-600">New:</span>
                <span class="ml-2 font-medium text-blue-900">{{ filename.trim() }}</span>
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
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving || !filename.trim() || filename.trim() === fileData.filename"
              class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save class="h-4 w-4 mr-2" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
