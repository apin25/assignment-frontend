<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Edit, Trash2, Plus, FileText, Users, Calendar, Building, Eye, X } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useResourceGroupApi } from '@/composables/useResourceGroupApi'
import { useFileApi } from '@/composables/useFileApi'
import { useCourseApi } from '@/composables/useCourseApi'
import { useAuth } from '@/stores/auth'
import type { ResourceGroupDTO, FileDTO } from '@/types'
import type { Course } from '@/composables/useCourseApi'
import ErrorBanner from '@/components/ErrorBanner.vue'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getGroupById, deleteGroup, getFilesInGroup, addFileToGroup, removeFileFromGroup } = useResourceGroupApi()
const { fetchFiles } = useFileApi()
const { getCourseById } = useCourseApi()
const { isAdmin, user } = useAuth()

const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const group = ref<ResourceGroupDTO | null>(null)
const groupFiles = ref<FileDTO[]>([])
const availableFiles = ref<FileDTO[]>([])
const courseInfo = ref<Course | null>(null)
const loadingGroup = ref(false)
const loadingFiles = ref(false)
const showAddFileModal = ref(false)
const selectedFileId = ref('')


const loadGroup = async () => {
  const groupId = route.params.id as string
  if (!groupId) {
    router.push('/resources/groups')
    return
  }

  loadingGroup.value = true
  try {
    const result = await getGroupById(groupId)
    if (result.success) {
      group.value = result.data
      
      if (result.data.courseId) {
        try {
          const courseResult = await getCourseById(result.data.courseId)
          if (courseResult.success) {
            courseInfo.value = courseResult.data
          }
        } catch (error) {
        }
      }

    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    errorTitle.value = 'Gagal Memuat Group'
    errorMessage.value = error.message || 'Gagal memuat data group.'
    showError.value = true
    showToast(error.message || 'Gagal memuat data group.', 'error')
  } finally {
    loadingGroup.value = false
  }
}

const loadGroupFiles = async () => {
  const groupId = route.params.id as string
  if (!groupId) return

  loadingFiles.value = true
  try {
    const result = await getFilesInGroup(groupId)
    if (result.success) {
      groupFiles.value = result.data || []
    } else {
      groupFiles.value = []
    }
  } catch (error: any) {
    groupFiles.value = []
  } finally {
    loadingFiles.value = false
  }
}

const loadAvailableFiles = async () => {
  try {
    const result = await fetchFiles()
    if (result.success) {
      const allFiles = result.data || []
      const groupFileIds = groupFiles.value.map(f => f.id)
      availableFiles.value = allFiles.filter(file => 
        !groupFileIds.includes(file.id) && !file.deletedAt
      )
    }
  } catch (error) {
  }
}

const handleDeleteGroup = async () => {
  if (!group.value) return
  
  if (!confirm(`Apakah Anda yakin ingin menghapus group "${group.value.name}"?`)) {
    return
  }

  try {
    const result = await deleteGroup(group.value.id)
    if (result.success) {
      showToast('Resource group berhasil dihapus!', 'success')
      router.push('/resources/groups')
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

const handleAddFile = async () => {
  if (!selectedFileId.value || !group.value) return

  try {
    const result = await addFileToGroup(group.value.id, selectedFileId.value)
    if (result.success) {
      showToast('File berhasil ditambahkan ke group!', 'success')
      showAddFileModal.value = false
      selectedFileId.value = ''
      await loadGroupFiles()
      await loadAvailableFiles()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    showToast(error.message || 'Gagal menambahkan file ke group.', 'error')
  }
}

const handleRemoveFile = async (fileId: string, filename: string) => {
  if (!group.value) return
  
  if (!confirm(`Apakah Anda yakin ingin menghapus "${filename}" dari group ini?`)) {
    return
  }

  try {
    const result = await removeFileFromGroup(group.value.id, fileId)
    if (result.success) {
      showToast('File berhasil dihapus dari group!', 'success')
      await loadGroupFiles()
      await loadAvailableFiles()
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    showToast(error.message || 'Gagal menghapus file dari group.', 'error')
  }
}

const openAddFileModal = async () => {
  await loadAvailableFiles()
  showAddFileModal.value = true
}

const goBack = () => {
  router.push('/resources/groups')
}

const closeError = () => {
  showError.value = false
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

const canEditGroup = (): boolean => {
  return isAdmin.value || (group.value && user.value?.username === group.value.owner)
}

onMounted(() => {
  loadGroup()
  loadGroupFiles()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft class="h-4 w-4 mr-2" />
              Kembali
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Detail Resource Group</h1>
              <p class="text-sm text-gray-600">Informasi dan files dalam group</p>
            </div>
          </div>
          <div v-if="group && canEditGroup()" class="flex gap-2">
            <button
              @click="router.push(`/resources/groups/${group.id}/edit`)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit class="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              @click="handleDeleteGroup"
              class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Error Banner -->
      <ErrorBanner
        :show="showError"
        :title="errorTitle"
        :message="errorMessage"
        @close="closeError"
      />

      <div v-if="loadingGroup" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading group data...</p>
      </div>

      <div v-else-if="group" class="space-y-6">
        <!-- Group Information -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users class="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div class="ml-4">
                <h2 class="text-xl font-bold text-gray-900">{{ group.name }}</h2>
                <p class="text-sm text-gray-600">{{ group.description }}</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-center">
                <Users class="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p class="text-sm font-medium text-gray-700">Owner</p>
                  <p class="text-sm text-gray-900">{{ group.owner }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <Calendar class="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p class="text-sm font-medium text-gray-700">Created</p>
                  <p class="text-sm text-gray-900">{{ formatDate(group.createdAt) }}</p>
                </div>
              </div>
              <div v-if="group.courseId" class="flex items-center">
                <Building class="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p class="text-sm font-medium text-gray-700">Course</p>
                  <p class="text-sm text-gray-900">
                    <span class="font-mono">{{ group.courseId }}</span>
                    <span v-if="courseInfo" class="ml-2">- {{ courseInfo.name }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group Files -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <FileText class="h-6 w-6 text-gray-400 mr-2" />
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Files dalam Group</h3>
                  <p class="text-sm text-gray-600">{{ groupFiles.length }} file(s) tersedia</p>
                </div>
              </div>
              <button
                v-if="canEditGroup()"
                @click="openAddFileModal"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus class="h-4 w-4 mr-2" />
                Add Files
              </button>
            </div>
          </div>

          <div class="p-6">
            <div v-if="loadingFiles" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p class="mt-2 text-gray-600">Loading files...</p>
            </div>

            <div v-else-if="groupFiles.length === 0" class="text-center py-8 text-gray-500">
              <FileText class="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p class="text-lg font-medium">Tidak ada file dalam group ini</p>
              <p class="text-sm text-gray-400 mt-2">Tambahkan file untuk mulai mengorganisir resources</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="file in groupFiles" :key="file.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ file.filename }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ file.owner }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(file.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <div class="flex justify-center gap-2">
                        <button
                          @click="router.push(`/resources/files/${file.id}`)"
                          class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye class="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          v-if="canEditGroup()"
                          @click="handleRemoveFile(file.id, file.filename)"
                          class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X class="h-3 w-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add File Modal -->
    <div v-if="showAddFileModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Tambah File ke Group</h3>
            <button
              @click="showAddFileModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Pilih File</label>
            <select
              v-model="selectedFileId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih file...</option>
              <option v-for="file in availableFiles" :key="file.id" :value="file.id">
                {{ file.filename }} ({{ file.owner }})
              </option>
            </select>
          </div>

          <div class="flex items-center justify-end space-x-4">
            <button
              @click="showAddFileModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              @click="handleAddFile"
              :disabled="!selectedFileId"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah File
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
