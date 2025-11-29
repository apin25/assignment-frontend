<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  FileText,
  ArrowLeft,
  Copy,
  Check,
  Download,
  EyeOff,
  Eye,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  FileIcon,
  Info
} from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useFileApi } from '@/composables/useFileApi'
import type { FileDTO } from '@/types'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getFileById, getFileContent } = useFileApi()

const loading = ref(false)
const loadingContent = ref(false)
const fileData = ref<FileDTO | null>(null)
const fileContent = ref<string>('')
const copied = ref(false)
const isDecoded = ref(false)
const decodedContent = ref<string>('')

const fileId = route.params.id as string

// File type detection
const fileInfo = computed(() => {
  if (!fileData.value || !fileContent.value) return null
  
  const filename = fileData.value.filename.toLowerCase()
  const extension = filename.split('.').pop() || ''
  
  // Detect file type
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac']
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  
  const isImage = imageExtensions.includes(extension)
  const isVideo = videoExtensions.includes(extension)
  const isAudio = audioExtensions.includes(extension)
  const isDocument = documentExtensions.includes(extension)
  const isPdf = extension === 'pdf'
  
  // Calculate file size from base64
  const sizeInBytes = (fileContent.value.length * 3) / 4
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${Math.round(bytes)} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  
  // Get MIME type
  const getMimeType = (): string => {
    if (isImage) {
      if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
      if (extension === 'png') return 'image/png'
      if (extension === 'gif') return 'image/gif'
      if (extension === 'webp') return 'image/webp'
      if (extension === 'bmp') return 'image/bmp'
      if (extension === 'svg') return 'image/svg+xml'
      return 'image/unknown'
    }
    if (isVideo) return `video/${extension}`
    if (isAudio) return `audio/${extension}`
    if (extension === 'pdf') return 'application/pdf'
    if (extension === 'txt') return 'text/plain'
    return 'application/octet-stream'
  }
  
  return {
    filename: fileData.value.filename,
    extension: extension.toUpperCase(),
    mimeType: getMimeType(),
    size: formatSize(sizeInBytes),
    sizeBytes: sizeInBytes,
    isImage,
    isVideo,
    isAudio,
    isDocument,
    isPdf,
    isText: extension === 'txt' || extension === 'json' || extension === 'xml' || extension === 'csv'
  }
})

// Data URL for preview
const previewDataUrl = computed(() => {
  if (!fileInfo.value || !fileContent.value) return ''
  
  if (fileInfo.value.isImage || fileInfo.value.isPdf) {
    return `data:${fileInfo.value.mimeType};base64,${fileContent.value}`
  }
  
  if (fileInfo.value.isVideo) {
    return `data:${fileInfo.value.mimeType};base64,${fileContent.value}`
  }
  
  if (fileInfo.value.isAudio) {
    return `data:${fileInfo.value.mimeType};base64,${fileContent.value}`
  }
  
  return ''
})

// Image dimensions (for images only)
const imageDimensions = ref<{ width: number; height: number } | null>(null)

const getImageDimensions = () => {
  if (!fileInfo.value?.isImage || !previewDataUrl.value) return
  
  const img = new Image()
  img.onload = () => {
    imageDimensions.value = {
      width: img.width,
      height: img.height
    }
  }
  img.src = previewDataUrl.value
}

const fetchFileData = async () => {
  loading.value = true
  try {
    const result = await getFileById(fileId)
    if (result.success) {
      fileData.value = result.data
    } else {
      showToast('Failed to load file data', 'error')
      router.push('/resources/files')
    }
  } catch (error) {
    showToast('Error loading file data', 'error')
    router.push('/resources/files')
  } finally {
    loading.value = false
  }
}

const fetchFileContent = async () => {
  loadingContent.value = true
  try {
    const result = await getFileContent(fileId)
    if (result.success) {
      fileContent.value = result.data
      // Get image dimensions if it's an image
      if (fileInfo.value?.isImage) {
        setTimeout(getImageDimensions, 100)
      }
    } else {
      showToast('Failed to load file content', 'error')
    }
  } catch (error) {
    showToast('Error loading file content', 'error')
  } finally {
    loadingContent.value = false
  }
}

const toggleDecoding = () => {
  if (!isDecoded.value) {
    // Decode Base64
    try {
      decodedContent.value = atob(fileContent.value)
      isDecoded.value = true
      showToast('Content decoded successfully!', 'success')
    } catch (error) {
      showToast('Failed to decode Base64 content', 'error')
    }
  } else {
    // Switch back to encoded
    isDecoded.value = false
    showToast('Showing encoded content', 'info')
  }
}

const copyToClipboard = async () => {
  const contentToCopy = isDecoded.value ? decodedContent.value : fileContent.value
  if (contentToCopy) {
    try {
      await navigator.clipboard.writeText(contentToCopy)
      copied.value = true
      showToast('Content copied to clipboard!', 'success')
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (error) {
      showToast('Failed to copy content', 'error')
    }
  }
}

const downloadFile = async () => {
  if (fileContent.value && fileData.value) {
    try {
      const link = document.createElement('a')
      link.href = `data:application/octet-stream;base64,${fileContent.value}`
      link.download = fileData.value.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast('File downloaded successfully!', 'success')
    } catch (error) {
      showToast('Error downloading file', 'error')
    }
  }
}

const goBack = () => {
  router.push(`/resources/files/${fileId}`)
}

const goToFileList = () => {
  router.push('/resources/files')
}

onMounted(async () => {
  await fetchFileData()
  await fetchFileContent()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="goBack"
            class="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Details
          </button>
          <span class="text-gray-400">|</span>
          <button
            @click="goToFileList"
            class="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            All Files
          </button>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">File Content & Preview</h1>
        <p class="text-gray-600 mt-2">View, preview, and manage file content</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading || loadingContent" class="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading file content...</p>
      </div>

      <!-- File Content -->
      <div v-else-if="fileData && fileContent && fileInfo" class="space-y-6">
        <!-- File Info Header -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-xl mr-4">
                <component :is="fileInfo.isImage ? ImageIcon : FileIcon" class="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ fileInfo.filename }}</h2>
                <p class="text-sm text-gray-500">
                  {{ fileInfo.size }} • {{ fileInfo.mimeType }} • Owner: {{ fileData.owner }}
                </p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-3">
              <!-- Encode/Decode Toggle (only for non-binary files) -->
              <button
                v-if="fileInfo.isText"
                @click="toggleDecoding"
                :class="[
                  'font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105',
                  isDecoded 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white'
                ]"
              >
                <component :is="isDecoded ? ToggleRight : ToggleLeft" class="w-4 h-4" />
                {{ isDecoded ? 'Decoded' : 'Encoded' }}
              </button>

              <button
                @click="copyToClipboard"
                class="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <component :is="copied ? Check : Copy" class="w-4 h-4" />
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
              
              <button
                @click="downloadFile"
                class="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download class="w-4 h-4" />
                Download
              </button>
              
              <button
                @click="goBack"
                class="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <EyeOff class="w-4 h-4" />
                Hide Content
              </button>
            </div>
          </div>

          <!-- File Information Panel -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Info class="w-5 h-5 mr-2 text-blue-600" />
              File Information
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Extension</p>
                <p class="text-lg font-bold text-gray-900">{{ fileInfo.extension }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">MIME Type</p>
                <p class="text-sm text-gray-900 font-mono">{{ fileInfo.mimeType }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">File Size</p>
                <p class="text-lg font-bold text-gray-900">{{ fileInfo.size }}</p>
              </div>
              <div v-if="imageDimensions">
                <p class="text-sm font-medium text-gray-600">Resolution</p>
                <p class="text-lg font-bold text-gray-900">{{ imageDimensions.width }}×{{ imageDimensions.height }}</p>
              </div>
              <div v-else-if="fileInfo.isImage">
                <p class="text-sm font-medium text-gray-600">Resolution</p>
                <p class="text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <component :is="fileInfo.isImage ? ImageIcon : FileText" class="h-5 w-5 mr-2 text-blue-600" />
              {{ fileInfo.isPdf ? 'PDF Preview' : fileInfo.isImage ? 'Image Preview' : fileInfo.isVideo ? 'Video Preview' : fileInfo.isAudio ? 'Audio Preview' : 'Content Preview' }}
            </h3>
          </div>
          
          <!-- PDF Preview -->
          <div v-if="fileInfo.isPdf" class="bg-gray-50 rounded-xl p-6 border">
            <div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-sm text-blue-800">
                <strong>📄 PDF Preview:</strong> 
                File PDF dapat dilihat langsung di bawah ini. Gunakan scroll untuk melihat halaman selanjutnya.
              </p>
            </div>
            <div class="w-full" style="height: 600px;">
              <iframe 
                :src="previewDataUrl" 
                class="w-full h-full border rounded-lg shadow-lg"
                title="PDF Preview"
              >
                <p class="text-center text-gray-600 p-4">
                  Browser Anda tidak mendukung preview PDF. 
                  <button @click="downloadFile" class="text-blue-600 hover:underline">
                    Klik di sini untuk download
                  </button>
                </p>
              </iframe>
            </div>
            <div class="mt-4 flex justify-center">
              <button
                @click="downloadFile"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download class="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
          
          <!-- Image Preview -->
          <div v-else-if="fileInfo.isImage" class="bg-gray-50 rounded-xl p-6 border text-center">
            <img 
              :src="previewDataUrl" 
              :alt="fileInfo.filename" 
              class="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
              @load="getImageDimensions"
            />
          </div>
          
          <!-- Video Preview -->
          <div v-else-if="fileInfo.isVideo" class="bg-gray-50 rounded-xl p-6 border text-center">
            <video 
              :src="previewDataUrl" 
              controls 
              class="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            >
              Your browser does not support video playback.
            </video>
          </div>
          
          <!-- Audio Preview -->
          <div v-else-if="fileInfo.isAudio" class="bg-gray-50 rounded-xl p-6 border text-center">
            <audio 
              :src="previewDataUrl" 
              controls 
              class="w-full max-w-md mx-auto"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
          
          <!-- Text Content -->
          <div v-else-if="fileInfo.isText" class="space-y-4">
            <div :class="[
              'rounded-xl p-4 max-h-96 overflow-auto border',
              isDecoded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            ]">
              <pre class="text-sm text-gray-700 whitespace-pre-wrap break-all font-mono leading-relaxed">{{ isDecoded ? decodedContent : fileContent }}</pre>
            </div>
            
            <div :class="[
              'p-4 rounded-lg border',
              isDecoded ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            ]">
              <p :class="[
                'text-sm',
                isDecoded ? 'text-green-800' : 'text-blue-800'
              ]">
                <strong>📝 Note:</strong> 
                <span v-if="isDecoded">
                  This is the decoded content of your text file.
                </span>
                <span v-else>
                  This is the Base64 encoded content. Click "Decoded" to view the actual text content.
                </span>
              </p>
            </div>
          </div>
          
          <!-- Binary File (DOC, DOCX, PPTX, XLSX, etc.) -->
          <div v-else class="bg-gray-50 rounded-xl p-6 border text-center">
            <div class="py-8">
              <FileIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 class="text-lg font-semibold text-gray-700 mb-2">Binary File</h4>
              <p class="text-gray-600 mb-4">
                File {{ fileInfo.extension }} tidak dapat di-preview langsung di browser.
                <br>
                <span class="text-sm text-gray-500">
                  (silakan download {{ fileInfo.extension }} ke local untuk mengakses file)
                </span>
              </p>
              <button
                @click="downloadFile"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download class="w-4 h-4 inline mr-2" />
                Download to View
              </button>
            </div>
          </div>
        </div>

        <!-- Base64 Raw Content (Collapsible) -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <details class="group">
            <summary class="cursor-pointer text-lg font-bold text-gray-900 flex items-center hover:text-blue-600 transition-colors">
              <FileText class="h-5 w-5 mr-2" />
              Raw Base64 Content
              <span class="ml-auto text-sm text-gray-500 group-open:hidden">(Click to expand)</span>
              <span class="ml-auto text-sm text-gray-500 hidden group-open:inline">(Click to collapse)</span>
            </summary>
            <div class="mt-4 bg-gray-50 rounded-xl p-4 max-h-64 overflow-auto border">
              <pre class="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono leading-relaxed">{{ fileContent }}</pre>
            </div>
            <div class="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p class="text-sm text-yellow-800">
                <strong>⚠️ Raw Data:</strong> 
                This is the raw Base64 encoded content as stored in the database. 
                File size: <strong>{{ fileInfo.size }}</strong> ({{ fileContent.length.toLocaleString() }} characters)
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>