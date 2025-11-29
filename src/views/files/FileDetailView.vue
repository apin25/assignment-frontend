<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  FileText, 
  Download, 
  Edit, 
  ArrowLeft, 
  Calendar, 
  User, 
  Hash,
  Eye,
  Shield,
  Clock,
  Users,
  Key
} from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useFileApi } from '@/composables/useFileApi'
import { useAuth } from '@/stores/auth'
import type { FileDTO, ResponseWrapper } from '@/types'

const router = useRouter()
const route = useRoute()
const fileApi = useFileApi()
const { user, isAdmin } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const fileData = ref<FileDTO | null>(null)
const fileContent = ref<string>('')

const fileId = route.params.id as string

const fetchFileData = async () => {
  loading.value = true
  try {
    const result: ResponseWrapper<FileDTO> = await fileApi.getFileById(fileId)
    
    if (result.success) {
      fileData.value = result.data
    } else {
      showToast('Failed to load file data', 'error')
      router.push('/resources/file')
    }
  } catch (error: any) {
    showToast(error.message || 'Error loading file data', 'error')
    router.push('/resources/file')
  } finally {
    loading.value = false
  }
}

const fetchFileContent = async () => {
  try {
    const result: ResponseWrapper<string> = await fileApi.getFileContent(fileId)
    
    if (result.success) {
      fileContent.value = result.data
      return result.data
    } else {
      showToast('Failed to load file content', 'error')
      return null
    }
  } catch (error: any) {
    showToast(error.message || 'Error loading file content', 'error')
    return null
  }
}

const downloadFile = async () => {
  let content = fileContent.value
  if (!content) {
    content = await fetchFileContent()
  }
  
  if (content) {
    try {
      const link = document.createElement('a')
      link.href = `data:application/octet-stream;base64,${content}`
      link.download = fileData.value?.filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast('File downloaded successfully!', 'success')
    } catch (error) {
      showToast('Error downloading file', 'error')
    }
  }
}

const viewContent = () => {
  router.push(`/resources/files/${fileId}/content`)
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

// REAL file size calculation from Base64
const getFileSize = async (): Promise<string> => {
  let content = fileContent.value
  if (!content) {
    content = await fetchFileContent()
  }
  
  if (!content) return 'Unknown'
  
  // Real calculation: Base64 to actual file size
  const bytes = (content.length * 3) / 4
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileSizeDisplay = ref('Loading...')

const goBack = () => {
  router.push('/resources/files')
}

const getRoleFilePermissions = computed(() => {
  if (!fileData.value) {
    return { 
      roles: ['LOADING...'], 
      description: 'Loading access information...' 
    }
  }

  const visibilityRole = fileData.value.visibilityRole

  if (!visibilityRole || 
      visibilityRole === 'ALL' ||
      visibilityRole === '' ||
      visibilityRole === null ||
      visibilityRole === undefined) {
    
    const hasTimeRestrictions = fileData.value.minAccessDateTime || fileData.value.maxAccessDateTime
    let description = 'Accessible by all authenticated users'
    
    if (hasTimeRestrictions) {
      description += ' with time restrictions'
    }
    
    return { 
      roles: ['ALL USERS'], 
      description: description
    }
  }

  if (Array.isArray(visibilityRole)) {
    if (visibilityRole.length === 0) {
      const hasTimeRestrictions = fileData.value.minAccessDateTime || fileData.value.maxAccessDateTime
      let description = 'Accessible by all authenticated users'
      
      if (hasTimeRestrictions) {
        description += ' with time restrictions'
      }
      
      return { 
        roles: ['ALL USERS'], 
        description: description
      }
    }

    const rolesArray = [...visibilityRole].filter(role => role && role.trim() !== '')
    
    if (rolesArray.length === 0) {
      const hasTimeRestrictions = fileData.value.minAccessDateTime || fileData.value.maxAccessDateTime
      let description = 'Accessible by all authenticated users'
      
      if (hasTimeRestrictions) {
        description += ' with time restrictions'
      }
      
      return { 
        roles: ['ALL USERS'], 
        description: description
      }
    }

    const hasTimeRestrictions = fileData.value.minAccessDateTime || fileData.value.maxAccessDateTime
    let description = `Accessible only by: ${rolesArray.join(', ')}`
    
    if (hasTimeRestrictions) {
      description += ' with time restrictions'
    }
    
    return { 
      roles: rolesArray, 
      description: description
    }
  }

  if (typeof visibilityRole === 'string' && visibilityRole.trim() !== '') {
    const hasTimeRestrictions = fileData.value.minAccessDateTime || fileData.value.maxAccessDateTime
    let description = `Accessible only by: ${visibilityRole}`
    
    if (hasTimeRestrictions) {
      description += ' with time restrictions'
    }
    
    return { 
      roles: [visibilityRole], 
      description: description
    }
  }

  return { 
    roles: ['UNKNOWN'], 
    description: 'Access permissions could not be determined' 
  }
})


const isFileAccessible = computed(() => {
  if (!fileData.value) return false
  if (isAdmin.value) return true
  
  const now = new Date()
  
  if (fileData.value.minAccessDateTime) {
    const minAccess = new Date(fileData.value.minAccessDateTime)
    if (now < minAccess) return false
  }
  
  if (fileData.value.maxAccessDateTime) {
    const maxAccess = new Date(fileData.value.maxAccessDateTime)
    if (now > maxAccess) return false
  }
  
  const visibilityRole = fileData.value.visibilityRole
  
  if (!visibilityRole || 
      (Array.isArray(visibilityRole) && visibilityRole.length === 0) ||
      visibilityRole === 'ALL') {
    return true
  }
  
  if (Array.isArray(visibilityRole)) {
    return visibilityRole.includes(user.value?.role || '')
  }
  
  if (typeof visibilityRole === 'string') {
    return visibilityRole === user.value?.role
  }
  
  return false
})


const canUserEditFile = computed(() => {
  if (!fileData.value || !user.value) return false
  return isAdmin.value || fileData.value.owner === user.value.username
});


// Watch untuk route changes (refresh ketika kembali dari edit)
watch(() => route.params.id, async (newId) => {
  if (newId && newId !== fileId) {
    await fetchFileData()
    fileSizeDisplay.value = await getFileSize()
  }
}, { immediate: false })


// Refresh data ketika component menjadi visible lagi (misalnya dari edit page)
const handleVisibilityChange = async () => {
  if (!document.hidden) {
    await fetchFileData()
  }
}


onMounted(async () => {
  await fetchFileData()
  fileSizeDisplay.value = await getFileSize()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Files
        </button>
        <h1 class="text-3xl font-bold text-gray-900">File Details</h1>
        <p class="text-gray-600 mt-2">Comprehensive file information and metadata</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading file details...</p>
      </div>

      <!-- File Details -->
      <div v-else-if="fileData" class="space-y-6">
        <!-- Main Header Card -->
        <div class="bg-white rounded-2xl shadow-sm border p-8">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center">
              <div class="p-4 bg-blue-100 rounded-xl mr-4">
                <FileText class="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ fileData.filename }}</h2>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="font-mono">ID: {{ fileData.id }}</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user?.role === 'LECTURER' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'ASSISTANT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  ]">
                    {{ user?.role }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                v-if="isFileAccessible"
                @click="viewContent"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Eye class="w-4 h-4" />
                View Content
              </button>
              
              <button
                v-if="isFileAccessible"
                @click="downloadFile"
                class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Download class="w-4 h-4" />
                Download
              </button>
              
              <RouterLink
                v-if="canUserEditFile"
                :to="`/resources/files/${fileData.id}/edit`"
                class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Edit class="w-4 h-4" />
                Edit
              </RouterLink>
            </div>

          </div>
        </div>

        <!-- Detailed Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-2xl shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Hash class="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div class="flex items-center mb-2">
                  <User class="h-5 w-5 text-blue-600 mr-2" />
                  <span class="text-sm font-medium text-blue-800">Owner</span>
                </div>
                <p class="text-lg font-semibold text-blue-900">{{ fileData.owner }}</p>
              </div>
              
              <div class="bg-green-50 rounded-xl p-4 border border-green-100">
                <div class="flex items-center mb-2">
                  <Hash class="h-5 w-5 text-green-600 mr-2" />
                  <span class="text-sm font-medium text-green-800">File Size</span>
                </div>
                <p class="text-lg font-semibold text-green-900">{{ fileSizeDisplay }}</p>
              </div>
              
              <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div class="flex items-center mb-2">
                  <Calendar class="h-5 w-5 text-purple-600 mr-2" />
                  <span class="text-sm font-medium text-purple-800">Created At</span>
                </div>
                <p class="text-lg font-semibold text-purple-900">{{ formatDate(fileData.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Access Control -->
          <div class="bg-white rounded-2xl shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield class="w-5 h-5 mr-2 text-green-600" />
              Access Control
            </h3>
            
            <div class="space-y-4">
              <!-- Access Status -->
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Access Status</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isFileAccessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ isFileAccessible ? 'Accessible' : 'Restricted' }}
                  </span>
                </div>
              </div>


              <!-- Time Restrictions -->
              <div v-if="fileData.minAccessDateTime || fileData.maxAccessDateTime" class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <div class="flex items-center mb-2">
                  <Clock class="h-5 w-5 text-yellow-600 mr-2" />
                  <span class="text-sm font-medium text-yellow-800">Time Restrictions</span>
                </div>
                <div class="space-y-1 text-sm text-yellow-900">
                  <div v-if="fileData.minAccessDateTime">
                    <strong>Available from:</strong> {{ formatDate(fileData.minAccessDateTime) }}
                  </div>
                  <div v-if="fileData.maxAccessDateTime">
                    <strong>Available until:</strong> {{ formatDate(fileData.maxAccessDateTime) }}
                  </div>
                </div>
              </div>

              <!-- Role File Permissions -->
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div class="flex items-center mb-2">
                  <Users class="h-5 w-5 text-blue-600 mr-2" />
                  <span class="text-sm font-medium text-blue-800">Role File Permissions</span>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-blue-700">Allowed Roles:</span>
                    <div class="flex gap-1 flex-wrap">
                      <span v-for="role in getRoleFilePermissions.roles":key="role"
                        class="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full"
                      >
                        {{ role }}
                      </span>
                    </div>
                  </div>
                  <p class="text-xs text-blue-700 leading-relaxed">
                    {{ getRoleFilePermissions.description }}
                  </p>
                </div>
              </div>

              
            </div>
          </div>
        </div>

        <!-- User Account Status -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key class="w-5 h-5 mr-2 text-indigo-600" />
            Account Status
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span class="text-sm font-medium text-green-800">Account Status</span>
              </div>
              <span class="text-sm font-semibold text-green-900">Active</span>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div class="flex items-center">
                <Users class="w-4 h-4 text-blue-600 mr-3" />
                <span class="text-sm font-medium text-blue-800">Your Role</span>
              </div>
              <span class="text-sm font-semibold text-blue-900">{{ user?.role }}</span>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Your Role Description:</h4>
            <p class="text-sm text-blue-700 leading-relaxed">
              {{ user?.role === 'ADMIN' ? 'Full system access, user management, file management, and administrative functions.' :
                 user?.role === 'LECTURER' || 'ASSISTANT' ? 'Access to course materials, file uploads, student management, and teaching resources.' :
                 'Access to enrolled courses, file downloads, assignments, and basic profile management.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
