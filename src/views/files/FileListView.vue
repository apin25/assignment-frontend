<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FileText, Trash2, Plus, Edit, Search, Eye, Users, Clock, X } from 'lucide-vue-next'
import type { FileDTO } from '@/types'
import { useToast } from '@/stores/toast'
import { useRouter, useRoute } from 'vue-router'
import { useFileApi } from '@/composables/useFileApi'
import { useAuth } from '@/stores/auth'

const useToastStore = useToast()
const router = useRouter()
const route = useRoute()
const { fetchFiles, deleteFile } = useFileApi()
const { isAdmin, isStudent, user } = useAuth()

const allFiles = ref<FileDTO[]>([])
const files = ref<FileDTO[]>([])
const loading = ref(false)
const searchType = ref<'filename' | 'owner'>('filename')
const searchQuery = ref('')
const afterDate = ref('')
const beforeDate = ref('')
const showDeleted = ref(false)
const showAccessDeniedBanner = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

const visibleFiles = computed(() => {
  return allFiles.value.filter(file => {
    if (!showDeleted.value && file.deletedAt) {
      return false
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      if (searchType.value === 'filename' && !file.filename.toLowerCase().includes(query)) {
        return false
      }
      if (searchType.value === 'owner' && !file.owner.toLowerCase().includes(query)) {
        return false
      }
    }

    const createdAt = new Date(file.createdAt)
    if (beforeDate.value) {
      // Set ke akhir hari untuk inklusif
      const before = new Date(beforeDate.value)
      before.setHours(23, 59, 59, 999);
      if (createdAt > before) {
        return false
      }
    }
    if (afterDate.value) {
      // Set ke awal hari untuk inklusif
      const after = new Date(afterDate.value)
      after.setHours(0, 0, 0, 0);
      if (createdAt < after) {
        return false
      }
    }

    return true
  })
})

const fetchFilesList = async () => {
  loading.value = true
  try {
    const result = await fetchFiles() 
    if (result.success) {
      allFiles.value = result.data || []
    } else {
      useToastStore.showToast(result.message || 'Failed to fetch files', 'error')
    }
  } catch (error: any) {
    useToastStore.showToast(error.message || 'Error connecting to server', 'error')
  } finally {
    loading.value = false
  }
}

const handleShowDeletedChange = () => {
  if (!isAdmin.value && showDeleted.value) {
    showDeleted.value = false
    showAccessDeniedBanner.value = true
    setTimeout(() => {
      showAccessDeniedBanner.value = false
    }, 5000)
    return
  }
  
  updateURL()
  fetchFilesList()
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateURL()
    fetchFilesList()
  }, 500)
}

const clearFilters = () => {
  searchQuery.value = ''
  afterDate.value = ''
  beforeDate.value = ''
  showDeleted.value = false
  updateURL()
  fetchFilesList()
}

const handleDeleteFile = async (file: FileDTO) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${file.filename}"?`)) {
    return
  }

  try {
    const result = await deleteFile(file.id)
    if (result.success) {
      useToastStore.showToast('File berhasil dihapus!', 'success')
      fetchFilesList()
    } else {
      useToastStore.showToast(result.message || 'Hapus gagal', 'error')
    }
  } catch (error: any) {
    useToastStore.showToast(error.message || 'Error saat hapus file', 'error')
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Check if file is deleted
const isFileDeleted = (file: FileDTO): boolean => {
  return !!file.deletedAt
}

const isFileAccessible = (file: FileDTO): boolean => {
  if (!!file.deletedAt) {
    return false;
  }

  if (isAdmin.value) {
    return true;
  }

  if (file.owner === user.value?.username) {
    return true;
  }

  const now = new Date();
  if (file.minAccessDateTime && now < new Date(file.minAccessDateTime)) {
    return false; 
  }
  if (file.maxAccessDateTime && now > new Date(file.maxAccessDateTime)) {
    return false;
  }

  const hasVisibilityRoles = file.visibilityRole && file.visibilityRole.length > 0;
  if (hasVisibilityRoles && !file.visibilityRole.includes(user.value?.role)) {
    return false;
  }
  
  return true;
};

const getAccessStatus = (file: FileDTO): { status: string, color: string } => {
  if (file.deletedAt) {
    return { status: 'Deleted', color: 'bg-red-100 text-red-800' };
  }
  
  const now = new Date();
  if (file.maxAccessDateTime && now > new Date(file.maxAccessDateTime)) {
    return { status: 'Expired', color: 'bg-gray-100 text-gray-800' };
  }
  if (file.minAccessDateTime && now < new Date(file.minAccessDateTime)) {
    return { status: 'Not Yet Available', color: 'bg-yellow-100 text-yellow-800' };
  }
  
  const userRole = user.value?.role;
  const username = user.value?.username;

  if (isAdmin.value) {
    return { status: 'Available', color: 'bg-green-100 text-green-800' };
  }
  
  if (file.owner === username) {
    return { status: 'Available', color: 'bg-green-100 text-green-800' };
  }

  const hasVisibilityRoles = file.visibilityRole && file.visibilityRole.length > 0;
  
  if (hasVisibilityRoles && !file.visibilityRole.includes(userRole)) {
    return { status: 'Role Restricted', color: 'bg-orange-100 text-orange-800' };
  }
  
  return { status: 'Available', color: 'bg-green-100 text-green-800' };
}


const canEditFile = (file: FileDTO): boolean => {
  if (!user.value) return false
  // Aksi diizinkan jika user adalah Admin ATAU pemilik file
  return isAdmin.value || file.owner === user.value.username
}

// Watch for URL changes
const updateURL = () => {
  const query: Record<string, string> = {}
  if (searchType.value) query.searchType = searchType.value
  if (searchQuery.value) query.query = searchQuery.value
  if (beforeDate.value) query.beforeDate = beforeDate.value
  if (afterDate.value) query.afterDate = afterDate.value
  if (showDeleted.value) query.showDeleted = 'true'
  
  router.replace({ query })
}

const initializeFromURL = () => {
  const params = route.query
  if (params.searchType) searchType.value = params.searchType as 'filename' | 'owner'
  if (params.query) searchQuery.value = params.query as string
  if (params.beforeDate) beforeDate.value = params.beforeDate as string
  if (params.afterDate) afterDate.value = params.afterDate as string
  if (params.showDeleted) showDeleted.value = params.showDeleted === 'true'
}

watch(() => route.query, () => {
  initializeFromURL()
  fetchFilesList()
})

onMounted(() => {
  initializeFromURL()
  fetchFilesList()
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Access Denied Banner -->
    <div v-if="showAccessDeniedBanner" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Akses Ditolak</h3>
            <p class="text-sm text-red-700 mt-1">Hanya admin yang bisa melihat file yang sudah dihapus</p>
          </div>
        </div>
        <button
          @click="showAccessDeniedBanner = false"
          class="text-red-400 hover:text-red-600"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Header with Upload Button and Role Info -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen File Resources</h1>
        <p class="text-sm text-gray-600">
          {{ isAdmin ? 'Admin View - Semua file tersedia' : 'Student View - File sesuai pembatasan waktu' }}
        </p>
        <div class="flex items-center mt-2 space-x-4">
          <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            Role: {{ user?.role }}
          </span>
          <RouterLink
            to="/resources/groups"
            class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
          >
            <Users class="w-3 h-3 inline mr-1" />
            Resource Groups
          </RouterLink>
        </div>
      </div>
      <div class="flex gap-3">
        <RouterLink
          to="/resources/groups"
          class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Users class="w-5 h-5" />
          Manage Groups
        </RouterLink>
        <!-- Upload button visible to ALL authenticated users -->
        <RouterLink
          to="/resources/files/upload"
          class="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus class="w-5 h-5" />
          Upload File Baru
        </RouterLink>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cari Berdasarkan</label>
          <select
            v-model="searchType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="debouncedSearch"
          >
            <option value="filename">Filename</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ketik pencarian..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <!-- Date Filters -->
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Sebelum</label>
          <input
            v-model="beforeDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="updateURL(); fetchFilesList()"
          />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Sesudah</label>
          <input
            v-model="afterDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="updateURL(); fetchFilesList()"
          />
        </div>
      </div>

      <div class="flex justify-between items-center mt-4">
        <!-- Show deleted checkbox -->
        <label class="flex items-center">
          <input
            v-model="showDeleted"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="handleShowDeletedChange"
          />
          <span class="ml-2 text-sm text-gray-700">Tampilkan yang Dihapus</span>
          <span v-if="!isAdmin" class="ml-2 text-xs text-gray-500">(Admin only)</span>
        </label>
        
        <button
          @click="clearFilters"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Search class="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Files Table -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading files...</p>
      </div>

      <div v-else-if="visibleFiles.length === 0" class="p-8 text-center text-gray-500">
        <FileText class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p class="text-lg font-medium">Tidak ada file yang ditemukan</p>
        <p class="text-sm text-gray-400 mt-2">
          {{ searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : 'Tidak ada file yang dapat diakses saat ini.' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gradient-to-r from-blue-700 to-red-600 text-white">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Filename
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Owner
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Created At
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Access Period
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(file, index) in visibleFiles"
              :key="file.id"
              :class="[
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                isFileDeleted(file) ? 'bg-red-50 text-red-400' : 'hover:bg-blue-50',
                'transition-colors'
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="isFileDeleted(file) ? 'text-red-400 line-through' : 'text-gray-900'">
                <RouterLink 
                  v-if="!isFileDeleted(file) && (isAdmin || isFileAccessible(file))"
                  :to="`/resources/files/${file.id}`" 
                  class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold"
                >
                  {{ file.filename }}
                </RouterLink>
                <span v-else class="text-red-400" :class="{ 'line-through': isFileDeleted(file) }">
                  {{ file.filename }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isFileDeleted(file) ? 'text-red-400 line-through' : 'text-gray-900'">
                {{ file.owner }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isFileDeleted(file) ? 'text-red-400 line-through' : 'text-gray-900'">
                {{ formatDate(file.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="file.minAccessDateTime || file.maxAccessDateTime" class="flex items-center text-gray-600">
                  <Clock class="w-4 h-4 mr-1" />
                  <div class="text-xs">
                    <div v-if="file.minAccessDateTime">
                      From: {{ formatDate(file.minAccessDateTime) }}
                    </div>
                    <div v-if="file.maxAccessDateTime">
                      Until: {{ formatDate(file.maxAccessDateTime) }}
                    </div>
                  </div>
                </div>
                <span v-else class="text-gray-400 text-xs">No restrictions</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getAccessStatus(file).color]">
                  {{ getAccessStatus(file).status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <template v-if="isFileDeleted(file)">
                  <span class="bg-red-400 text-white px-4 py-2 rounded text-sm font-medium cursor-not-allowed">
                    Deleted
                  </span>
                </template>
                <template v-else-if="!isAdmin && !isFileAccessible(file)">
                  <span class="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium cursor-not-allowed">
                    Not Available
                  </span>
                </template>
                <template v-else>
                  <div class="flex justify-center gap-2">
                    <button
                      v-if="!isFileDeleted(file)"
                      @click="router.push(`/resources/files/${file.id}`)"
                      class="rounded-full p-2 bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <template v-if="canEditFile(file) && getAccessStatus(file).status === 'Available'">
                      <button
                        @click="router.push(`/resources/files/${file.id}/edit`)"
                        class="rounded-full p-2 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                        title="Edit filename"
                      >
                        <Edit class="w-4 h-4" />
                      </button>
                      <button
                        @click="handleDeleteFile(file)"
                        class="rounded-full p-2 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </template>
                    <span v-if="isFileDeleted(file)" class="text-sm text-red-500 font-semibold">
                      Deleted
                    </span>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>