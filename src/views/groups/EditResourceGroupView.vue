<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Save, Users, FileText, Building } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useResourceGroupApi } from '@/composables/useResourceGroupApi'
import type { ResourceGroupDTO, UpdateResourceGroupDTO } from '@/types'
import ErrorBanner from '@/components/ErrorBanner.vue'
import { useCourseApi } from '@/composables/useCourseApi'
import type { Course } from '@/composables/useCourseApi'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getGroupById, updateGroup, loading } = useResourceGroupApi()
const { getCourseById } = useCourseApi()

const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const group = ref<ResourceGroupDTO | null>(null)
const loadingGroup = ref(false)
const courseInfo = ref<Course | null>(null)

const groupForm = ref<UpdateResourceGroupDTO>({
  name: '',
  description: ''
})

// Original data untuk comparison
const originalData = ref<UpdateResourceGroupDTO>({
  name: '',
  description: ''
})

// Computed untuk cek apakah ada perubahan
const hasChanges = computed(() => {
  if (!originalData.value) return false
  
  return (
    groupForm.value.name.trim() !== originalData.value.name.trim() ||
    groupForm.value.description.trim() !== originalData.value.description.trim()
  )
})

// Computed untuk validasi form
const isFormValid = computed(() => {
  return (
    groupForm.value.name.trim().length > 0 &&
    groupForm.value.description.trim().length > 0 &&
    hasChanges.value
  )
})

const loadGroup = async () => {
  const groupId = route.params.id as string
  if (!groupId) {
    router.push('/resources/groups')
    return
  }

  loadingGroup.value = true
  try {
    showToast('📄 Memuat data group...', 'info', 2000)
    
    const result = await getGroupById(groupId)
    if (result.success && result.data) {
      group.value = result.data

      // Auto-fill form dengan data existing
      groupForm.value = {
        name: result.data.name,
        description: result.data.description
      }
      
      // Simpan data original untuk comparison
      originalData.value = {
        name: result.data.name,
        description: result.data.description
      }

      // Load course info if exists
      if (result.data.courseId) {
        try {
          const courseResult = await getCourseById(result.data.courseId)
          if (courseResult.success) {
            courseInfo.value = courseResult.data
          }
        } catch (error) {
          console.error('Error loading course info:', error)
        }
      }

      showToast('✅ Data group berhasil dimuat', 'success', 3000)
    } else {
      throw new Error(result.message || 'Data group tidak ditemukan')
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

const handleSubmit = async () => {
  if (!group.value || !isFormValid.value) return
  
  showError.value = false
  
  try {
    showToast('💾 Menyimpan perubahan...', 'info', 2000)
    
    const result = await updateGroup(group.value.id, groupForm.value)
    if (result.success) {
      showToast('✅ Resource group berhasil diperbarui!', 'success')
      
      // Update original data setelah berhasil save
      originalData.value = {
        name: groupForm.value.name,
        description: groupForm.value.description
      }
      
      setTimeout(() => {
        router.push(`/resources/groups/${group.value!.id}`)
      }, 1500)
    } else {
      throw new Error(result.message || 'Gagal memperbarui group')
    }
  } catch (error: any) {
    errorTitle.value = 'Update Group Gagal'
    errorMessage.value = error.message || 'Gagal memperbarui resource group. Silakan coba lagi.'
    showError.value = true
    showToast(error.message || 'Gagal memperbarui resource group.', 'error')
  }
}

// Function untuk reset form ke data original
const resetForm = () => {
  if (originalData.value) {
    groupForm.value = {
      name: originalData.value.name,
      description: originalData.value.description
    }
    showToast('🔄 Form direset ke data awal', 'info', 2000)
  }
}

const goBack = () => {
  if (hasChanges.value) {
    if (confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
      navigateBack()
    }
  } else {
    navigateBack()
  }
}

const navigateBack = () => {
  if (group.value) {
    router.push(`/resources/groups/${group.value.id}`)
  } else {
    router.push('/resources/groups')
  }
}

const closeError = () => {
  showError.value = false
}

onMounted(() => {
  loadGroup()
})

// Watch untuk memberikan feedback perubahan
watch(hasChanges, (newValue) => {
  if (newValue) {
    // User mulai mengubah data
  }
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
              <h1 class="text-2xl font-bold text-gray-900">Edit Resource Group</h1>
              <p class="text-sm text-gray-600">Perbarui informasi resource group</p>
            </div>
          </div>
          
          <!-- TAMBAH: Status indicator -->
          <div v-if="group && !loadingGroup" class="flex items-center space-x-2">
            <span v-if="hasChanges" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Ada perubahan
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Tidak ada perubahan
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div v-if="loadingGroup" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading group data...</p>
      </div>

      <div v-else-if="group" class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <h2 class="text-lg font-medium text-gray-900">Edit Group Information</h2>
              <p class="text-sm text-gray-500">Perbarui nama dan deskripsi group</p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- Error Banner -->
          <ErrorBanner
            :show="showError"
            :title="errorTitle"
            :message="errorMessage"
            @close="closeError"
          />
          
          <!-- Group Info Display -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Owner:</span>
                <span class="ml-2 text-gray-900">{{ group.owner }}</span>
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

              <div>
                <span class="font-medium text-gray-700">Dibuat:</span>
                <span class="ml-2 text-gray-900">{{ new Date(group.createdAt).toLocaleDateString('id-ID') }}</span>
              </div>

              <div>
                <span class="font-medium text-gray-700">Diperbarui:</span>
                <span v-if="group.modifiedAt" class="ml-2 text-gray-900">
                  {{ new Date(group.modifiedAt).toLocaleDateString('id-ID') }}
                </span>
                <span v-else class="ml-2 text-gray-500">Belum pernah diupdate</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Group Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nama Group <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  v-model="groupForm.name"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan nama group"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="groupForm.description"
                required
                rows="4"
                class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Masukkan deskripsi group"
              />
            </div>
            
            <!-- Note about non-editable fields -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                <strong>Catatan:</strong> Owner dan Course ID tidak dapat diubah setelah group dibuat.
              </p>
            </div>

            <!-- TAMBAH: Change indicator -->
            <div v-if="hasChanges" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    Ada perubahan yang belum disimpan. Klik "Simpan Perubahan" untuk menyimpan atau "Reset" untuk membatalkan.
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="flex space-x-3">
                <button
                  type="button"
                  @click="goBack"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Batal
                </button>
                
                <!-- TAMBAH: Reset button -->
                <button
                  v-if="hasChanges"
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Reset
                </button>
              </div>
              
              <button
                type="submit"
                :disabled="loading || !isFormValid"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors"
                :class="isFormValid 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-gray-400 cursor-not-allowed'"
              >
                <Save class="h-4 w-4 mr-2" />
                <span v-if="loading">Menyimpan...</span>
                <span v-else-if="!hasChanges">Tidak Ada Perubahan</span>
                <span v-else>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>