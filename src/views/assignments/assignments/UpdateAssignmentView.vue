<script setup lang="ts">
import { ArrowLeft, Users, FileText, Building, ChevronDown, Save, Calendar, File } from 'lucide-vue-next'
import ErrorBanner from '@/components/ErrorBanner.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseApi } from '@/composables/useCourseApi'
import { useAssignmentStore } from '@/stores/assignment'
import { useFileApi } from '@/composables/useFileApi'
import type { FileDTO } from '@/types/index'

const route = useRoute()
// Form state
const groupForm = ref({
  name: '',
  courseId: '',
  owner: '',
  description: '',
  dueDate: '',
  selectedFile: ''
})

const files = ref<FileDTO[]>([])
const { fetchFiles } = useFileApi()

onMounted(async () => {
  try {
    const res = await fetchCourses()
    courses.value = res.data

    const fileRes = await fetchFiles() // tanpa param
    files.value = fileRes.data
  } catch (err) {
    console.error('Gagal memuat data:', err)
  }
})

const assignmentStore = useAssignmentStore()
const { fetchCourses, loading: courseLoading, error: courseError } = useCourseApi()

const courses = ref([])

onMounted(async () => {
  try {
    const res = await fetchCourses()
    courses.value = res.data 
  } catch (err) {
    console.error('Gagal memuat course:', err)
  }
})

// State
const loading = ref(false)
const showError = ref(false)
const errorTitle = ref('Terjadi Kesalahan')
const errorMessage = ref('Silakan coba lagi nanti.')

// Router
const router = useRouter()

// Functions
const goBack = () => {
  router.back()
}

const closeError = () => {
  showError.value = false
}
onMounted(async () => {
  const id = route.params.id as string;
  await assignmentStore.getAssignmentDetail(id);
  
  const assignment = assignmentStore.assignment;
    if (assignment) {
      groupForm.value.name = assignment.title
      groupForm.value.courseId = assignment.course?.id
      groupForm.value.owner = assignment.owner
      groupForm.value.selectedFile = assignment.resource?.id || ''
      groupForm.value.description = assignment.text || ''
      groupForm.value.dueDate = assignment.dueDate?.slice(0, 16) || ''
    }
});

const handleSubmit = async () => {
  showError.value = false
  const id = route.params.id as string;
  // Validation
  if (!groupForm.value.name || !groupForm.value.courseId || !groupForm.value.owner || !groupForm.value.dueDate) {
    showError.value = true
    errorTitle.value = 'Data Tidak Lengkap'
    errorMessage.value = 'Title, Course, Owner, dan Due Date wajib diisi.'
    return
  }

  const selectedDate = new Date(groupForm.value.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < now) {
  showError.value = true
  errorTitle.value = 'Tanggal Tidak Valid'
  errorMessage.value = 'Due date tidak boleh di masa lalu.'
  return
}

  loading.value = true
  try {
    // Prepare assignment data
    const assignmentData = {
      title: groupForm.value.name,
      course: groupForm.value.courseId,
      resource: groupForm.value.selectedFile || null,
      text: groupForm.value.description || null,
      owner: groupForm.value.owner,
      dueDate: new Date(groupForm.value.dueDate)
    }

    await assignmentStore.updateAssignment(id, assignmentData);
    // Show success message or redirect
    router.push({
      path: '/assignments'
    })
  } catch (err) {
    console.error('Error creating assignment:', err)
    showError.value = true
    errorTitle.value = 'Gagal Menyimpan'
    errorMessage.value = err.message || 'Gagal menyimpan assignment. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
const now = new Date()
now.setSeconds(0, 0) 

const minDate = now.toISOString().slice(0, 16) 


</script>

<template>
<div class="min-h-screen bg-gray-50">
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
              <h1 class="text-2xl font-bold text-gray-900">Ubah Assignment Baru</h1>
              <p class="text-sm text-gray-600">Ubah assignment</p>
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
              <h2 class="text-lg font-medium text-gray-900">Informasi Assignment</h2>
              <p class="text-sm text-gray-500">Isi detail untuk ubah assignment</p>
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
            <!-- Assignment Title -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Title <span class="text-red-500">*</span>
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
                  placeholder="Masukkan title"
                />
              </div>
            </div>

            <!-- Course Selection -->
            <div>
              <label for="courseId" class="block text-sm font-medium text-gray-700 mb-2">
                Course <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building class="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="courseId"
                  v-model="groupForm.courseId"
                  required
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
                >
                  <option value="">Pilih course</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.code }} - {{ course.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Owner -->
            <div>
              <label for="owner" class="block text-sm font-medium text-gray-700 mb-2">
                Owner <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="owner"
                  v-model="groupForm.owner"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan owner"
                />
              </div>
            </div>

            <!-- Due Date -->
            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dueDate"
                  v-model="groupForm.dueDate"
                  type="datetime-local"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  :min="minDate"
                />
              </div>
            </div>

            <!-- File Selection -->
            <div>
              <label for="selectedFile" class="block text-sm font-medium text-gray-700 mb-2">
                Pilih File <span class="text-gray-500">(Opsional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <File class="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="selectedFile"
                  v-model="groupForm.selectedFile"
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
                >
                  <option value="">Pilih file</option>
                  <option v-for="file in files" :key="file.id" :value="file.id">
                    {{ file.filename }} - {{ file.owner }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Tugas Text <span class="text-gray-500">(Opsional)</span>
              </label>
              <textarea
                id="description"
                v-model="groupForm.description"
                rows="4"
                class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Masukkan tugas text"
              />
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
                :disabled="loading"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save class="h-4 w-4 mr-2" />
                <span v-if="loading">Menyimpan...</span>
                <span v-else>Simpan Assignment</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>