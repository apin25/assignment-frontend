<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, Users, FileText, Building, ChevronDown } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useResourceGroupApi } from '@/composables/useResourceGroupApi'
import { useCourseApi } from '@/composables/useCourseApi'
import type { CreateResourceGroupDTO, CourseDTO } from '@/types'
import ErrorBanner from '@/components/ErrorBanner.vue'

const router = useRouter()
const { showToast } = useToast()
const { createGroup, loading } = useResourceGroupApi()
const { fetchCourses, loading: coursesLoading } = useCourseApi()

const showError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const courses = ref<CourseDTO[]>([])

const groupForm = ref<CreateResourceGroupDTO>({
  name: '',
  description: '',
  courseId: '',
  owner: '' // Will be set by backend
})

const loadCourses = async () => {
  try {
    const result = await fetchCourses()
    if (result.success) {
      courses.value = result.data || []
    } else {
    }
  } catch (error) {
  }
}

const handleSubmit = async () => {
  showError.value = false
  
  try {
    const groupData = { ...groupForm.value }
    
    // Kalo courseId ada tapi pake dummy data, skip courseId
    if (groupData.courseId && isDummyCourseId(groupData.courseId)) {
      console.warn('Using dummy course ID, removing from submission')
      delete groupData.courseId
    } else if (!groupData.courseId) {
      delete groupData.courseId
    }
    
    const result = await createGroup(groupData)
    if (result.success) {
      showToast('Resource group berhasil dibuat!', 'success')
      router.push('/resources/groups')
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    // Handle specific course ID error
    if (error.message?.includes('Course ID tidak valid')) {
      // Retry without courseId
      try {
        const groupDataWithoutCourse = { 
          name: groupForm.value.name,
          description: groupForm.value.description,
          owner: groupForm.value.owner
        }
        const retryResult = await createGroup(groupDataWithoutCourse)
        if (retryResult.success) {
          showToast('Resource group berhasil dibuat (tanpa course)!', 'success')
          router.push('/resources/groups')
          return
        }
      } catch (retryError) {
      }
    }
    
    errorTitle.value = 'Pembuatan Group Gagal'
    errorMessage.value = error.message || 'Gagal membuat resource group. Silakan coba lagi.'
    showError.value = true
    showToast(error.message || 'Gagal membuat resource group.', 'error')
  }
}

const isDummyCourseId = (id: string): boolean => {
  const dummyIds = ['1', '2', '3', '4']
  return dummyIds.includes(id)
}


const goBack = () => {
  router.push('/resources/groups')
}

const closeError = () => {
  showError.value = false
}

onMounted(() => {
  loadCourses()
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
              <h1 class="text-2xl font-bold text-gray-900">Buat Resource Group Baru</h1>
              <p class="text-sm text-gray-600">Buat grup untuk mengorganisir resource files</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <h2 class="text-lg font-medium text-gray-900">Informasi Group</h2>
              <p class="text-sm text-gray-500">Isi detail untuk resource group baru</p>
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

            <!-- Course Dropdown -->
            <div>
              <label for="courseId" class="block text-sm font-medium text-gray-700 mb-2">
                Course <span class="text-gray-400">(Opsional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building class="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="courseId"
                  v-model="groupForm.courseId"
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
                  :disabled="coursesLoading"
                >
                  <option value="">Pilih course (opsional)</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.code }} - {{ course.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown class="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                Kosongkan jika group tidak terkait dengan course tertentu
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="goBack"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="loading || !groupForm.name || !groupForm.description"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save class="h-4 w-4 mr-2" />
                <span v-if="loading">Menyimpan...</span>
                <span v-else>Simpan Group</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
