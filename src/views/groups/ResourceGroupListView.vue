<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Users, Calendar, Building, Eye, Edit, Trash2, Search, X } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useResourceGroupApi } from '@/composables/useResourceGroupApi'
import { useCourseApi } from '@/composables/useCourseApi'
import { useAuth } from '@/stores/auth'
import type { ResourceGroupDTO, CourseDTO } from '@/types'
import ErrorBanner from '@/components/ErrorBanner.vue'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getGroups, deleteGroup } = useResourceGroupApi()
const { fetchCourses } = useCourseApi()
const { isAdmin, user } = useAuth()

const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const groups = ref<ResourceGroupDTO[]>([])
const courses = ref<CourseDTO[]>([])
const loading = ref(false)
const searchQuery = ref('')
const showDeleted = ref(false)
const showAccessDeniedBanner = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

const loadCourses = async () => {
  try {
    const result = await fetchCourses()
    if (result.success) {
      courses.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

const getCourseNameById = (courseId: string): string => {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.name : ''
}

const loadGroups = async () => {
  loading.value = true
  try {
    const result = await getGroups()
    if (result.success) {
      let filteredGroups = result.data || []
      
      filteredGroups = filteredGroups.map(group => ({
        ...group,
        courseName: group.courseName || (group.courseId ? getCourseNameById(group.courseId) : undefined)
      }))
      
      // Apply search filter
      if (searchQuery.value) {
        filteredGroups = filteredGroups.filter(group =>
          group.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          group.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      // Apply deleted filter (admin only)
      if (!showDeleted.value) {
        filteredGroups = filteredGroups.filter(group => !group.deletedAt)
      }
      
      groups.value = filteredGroups
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    errorTitle.value = 'Gagal Memuat Groups'
    errorMessage.value = error.message || 'Gagal memuat data resource groups.'
    showError.value = true
    showToast(error.message || 'Gagal memuat data resource groups.', 'error')
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
  loadGroups()
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateURL()
    loadGroups()
  }, 500)
}

const clearFilters = () => {
  searchQuery.value = ''
  showDeleted.value = false
  updateURL()
  loadGroups()
}

const handleDeleteGroup = async (group: ResourceGroupDTO) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus group "${group.name}"?`)) {
    return
  }

  try {
    const result = await deleteGroup(group.id)
    if (result.success) {
      showToast('Resource group berhasil dihapus!', 'success')
      loadGroups()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    errorTitle.value = 'Hapus Group Gagal'
    errorMessage.value = error.message || 'Gagal menghapus resource group.'
    showError.value = true
    showToast(error.message || 'Gagal menghapus resource group.', 'error')
  }
}

const canEditGroup = (group: ResourceGroupDTO): boolean => {
  return isAdmin.value || group.owner === user.value?.username
}

const canViewGroup = (group: ResourceGroupDTO): boolean => {
  return !group.deletedAt
}

const handleViewGroup = (group: ResourceGroupDTO) => {
  if (!canViewGroup(group)) {
    showToast('Tidak dapat mengakses resource group yang sudah dihapus', 'error')
    return
  }
  router.push(`/resources/groups/${group.id}`)
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

const closeError = () => {
  showError.value = false
}

const updateURL = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (showDeleted.value) query.showDeleted = 'true'
  
  router.replace({ query })
}

const initializeFromURL = () => {
  const params = route.query
  if (params.search) searchQuery.value = params.search as string
  if (params.showDeleted) showDeleted.value = params.showDeleted === 'true'
}

watch(() => route.query, () => {
  initializeFromURL()
  loadGroups()
})

onMounted(async () => {
  initializeFromURL()
  await loadCourses()
  loadGroups()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Resource Groups</h1>
            <p class="text-sm text-gray-600">Kelola dan organisir resource files dalam groups</p>
          </div>
          <button
            @click="router.push('/resources/groups/create')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus class="h-4 w-4 mr-2" />
            Buat Group Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              <p class="text-sm text-red-700 mt-1">Hanya admin yang bisa melihat resource group yang sudah dihapus</p>
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

      <!-- Error Banner -->
      <ErrorBanner
        :show="showError"
        :title="errorTitle"
        :message="errorMessage"
        @close="closeError"
      />

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Cari Resource Group</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan nama atau deskripsi..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          
          <!-- Filters -->
          <div class="flex items-end gap-4">
            <label class="flex items-center">
              <input
                v-model="showDeleted"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="handleShowDeletedChange"
              />
              <span class="ml-2 text-sm text-gray-700">Tampilkan yang Dihapus</span>
            </label>
            
            <button
              @click="clearFilters"
              class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Search class="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading groups...</p>
      </div>

      <div v-else-if="groups.length === 0" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Users class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'Tidak ada group yang ditemukan' : 'Belum ada Resource Group' }}
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Mulai dengan membuat group pertama untuk mengorganisir resource files' }}
        </p>
        <button
          v-if="!searchQuery"
          @click="router.push('/resources/groups/create')"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus class="h-4 w-4 mr-2" />
          Buat Group Pertama
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in groups"
          :key="group.id"
          :class="[
            'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow',
            group.deletedAt ? 'bg-red-50 border-red-200' : ''
          ]"
        >
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  group.deletedAt ? 'bg-red-100' : 'bg-blue-100'
                ]">
                  <Users :class="[
                    'h-6 w-6',
                    group.deletedAt ? 'text-red-600' : 'text-blue-600'
                  ]" />
                </div>
              </div>
              <div class="ml-4 flex-1 min-w-0">
                <h3 :class="[
                  'text-lg font-medium truncate',
                  group.deletedAt ? 'text-red-400 line-through' : 'text-gray-900'
                ]">
                  {{ group.name }}
                </h3>
                <p :class="[
                  'text-sm truncate',
                  group.deletedAt ? 'text-red-400 line-through' : 'text-gray-500'
                ]">
                  {{ group.description }}
                </p>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm" :class="group.deletedAt ? 'text-red-400' : 'text-gray-600'">
                <Users class="h-4 w-4 mr-2" />
                <span>{{ group.owner }}</span>
              </div>
              <div class="flex items-center text-sm" :class="group.deletedAt ? 'text-red-400' : 'text-gray-600'">
                <Calendar class="h-4 w-4 mr-2" />
                <span>{{ formatDate(group.createdAt) }}</span>
              </div>
              <div v-if="group.courseId" class="flex items-center text-sm" :class="group.deletedAt ? 'text-red-400' : 'text-gray-600'">
                <Building class="h-4 w-4 mr-2" />
                <span>
                  <span v-if="group.courseName" class="ml-2">{{ group.courseName }}</span>
                </span>
              </div>
              <div v-if="group.deletedAt" class="flex items-center text-sm text-red-500">
                <Trash2 class="h-4 w-4 mr-2" />
                <span>Deleted: {{ formatDate(group.deletedAt) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                @click="handleViewGroup(group)"
                :disabled="!canViewGroup(group)"
                :class="[
                  'inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all',
                  group.deletedAt 
                    ? 'text-red-400 bg-red-50 cursor-not-allowed opacity-50' 
                    : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500 cursor-pointer'
                ]"
              >
                <Eye class="h-3 w-3 mr-1" />
                View
              </button>
              
              <div v-if="canEditGroup(group) && !group.deletedAt" class="flex gap-2">
                <button
                  @click="router.push(`/resources/groups/${group.id}/edit`)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Edit class="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  @click="handleDeleteGroup(group)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 class="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>