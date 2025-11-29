<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Trash2, Search, Eye, File, FileBadge } from 'lucide-vue-next'
import { useToast } from '@/stores/toast';
import { useAuth } from '@/stores/auth'
import type { User } from '@/types/auth'
import { useAssignmentStore } from '@/stores/assignment'
import { useFileApi } from '@/composables/useFileApi' 
import { useCourseApi } from '@/composables/useCourseApi'

const { getFileContent } = useFileApi()
const { fetchCourses, loading: courseLoading, error: courseError } = useCourseApi()

const router = useRouter()
const assignmentStore = useAssignmentStore()
const currentUser = ref(null)
const loading = ref(false)
const courses = ref([])

// Filter states
const searchQuery = ref('')
const selectedCourse = ref('')
const selectedOwner = ref('')
const selectedStatus = ref('')

async function openFileInNewTab(fileId: string) {
  try {
    const response = await getFileContent(fileId)
    const base64String = response.data
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
  } catch (error) {
    console.error("Gagal membuka file:", error)
  }
}

const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString()

const uniqueOwners = computed(() =>
  [...new Set(assignmentStore.assignments.map((a) => a.owner))].filter(Boolean)
)

const statusOptions = [
  { value: 'overDue', label: 'Overdue' },
  { value: 'onTime', label: 'On Time' }
]

async function deleteAssignment(id: string) {
  const toast = useToast();
  const confirmed = confirm("Are you sure you want to delete this assignment?")
  if (!confirmed) return

  try {
    await assignmentStore.deleteAssignment(id)
    toast.showToast("Assignment deleted successfully.", "success")
    // Refresh the list after deletion
    await applyFilter()
  } catch (error) {
    toast.showToast(error, "error")
  }
}

function applyFilter() {
  const query = {
    course: selectedCourse.value || undefined,
    status: selectedStatus.value || undefined,
    owner: selectedOwner.value || undefined,
    search: searchQuery.value || undefined,
  };

  router.replace({ query }); 

  assignmentStore.getAssignments(
    query.course,
    query.owner,
    query.status,
    query.search
  );
}

function clearFilters() {
  selectedCourse.value = '';
  selectedStatus.value = '';
  selectedOwner.value = '';
  searchQuery.value = '';

  router.replace({ query: {} });
  applyFilter();
}

onMounted(async () => {
  try {
    const { getCurrentUser } = useAuth()
    currentUser.value = await getCurrentUser()
  } catch (err) {
    console.error('Gagal ambil user:', err)
  }

  loading.value = true
  await assignmentStore.getAssignments()
  loading.value = false

  // Load courses for filter
  try {
    const res = await fetchCourses()
    courses.value = res.data
  } catch (err) {
    console.error('Gagal memuat data:', err)
  }
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Assignment Management</h1>
        <p class="text-sm text-gray-600">Manage all system assignments.</p>
      </div>
      <div class="flex flex-row gap-3">
        <RouterLink
          to="/wikis"
          class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FileBadge class="w-5 h-5" />
          Manage Wiki
        </RouterLink>
        <RouterLink
          v-if="currentUser?.role === 'ASSISTANT' || currentUser?.role === 'LECTURER'"
          to="/assignments/create"
          class="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus class="w-5 h-5" />
          Add Assignment
        </RouterLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Course Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Courses</label>
          <select
            v-model="selectedCourse"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.code }} - {{ course.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Owner Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Owner</label>
          <select
            v-model="selectedOwner"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Owners</option>
            <option v-for="owner in uniqueOwners" :key="owner" :value="owner">
              {{ owner }}
            </option>
          </select>
        </div>
      </div>

      <!-- Search Input -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="applyFilter"
        />
      </div>

      <!-- Filter Buttons -->
      <div class="flex justify-end gap-3 mt-4">
        <button
          @click="clearFilters"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          Clear Filters
        </button>
        <button
          @click="applyFilter"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Search class="w-4 h-4" />
          Search
        </button>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading assignments...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="assignmentStore.assignments.length === 0" class="p-8 text-center text-gray-500">
        <File class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p class="text-lg font-medium">No assignments found</p>
        <p class="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gradient-to-r from-blue-700 to-red-600 text-white">
            <tr>
              <th class="px-2 py-4 text-left text-sm font-medium uppercase tracking-wider">No</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">ID</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Title</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Course</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Owner</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Due Date</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Paper</th>
              <th class="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider">Created At</th>
              <th class="px-4 py-4 text-center text-sm font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(assignment, index) in assignmentStore.assignments"
              :key="assignment.id"
              :class="{ 'bg-red-50': new Date(assignment.dueDate) < new Date() }"
            >
              <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ assignment.id }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ assignment.title }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ assignment.course?.name || 'Unknown Course' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ assignment.owner }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span :class="{ 'text-red-600 font-semibold': new Date(assignment.dueDate) < new Date() }">
                  {{ formatDateTime(assignment.dueDate) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <File 
                  class="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600" 
                  @click="openFileInNewTab(assignment.resource.id)"
                  title="Open file"
                />
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDateTime(assignment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex justify-center gap-2">
                  <button
                    @click="router.push(`/assignments/${assignment.id}`)"
                    class="rounded-full p-2 bg-green-500 hover:bg-green-600 text-white transition-colors"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    v-if="currentUser?.role === 'ASSISTANT' || currentUser?.role === 'LECTURER'"
                    @click="router.push(`/assignments/${assignment.id}/update`)"
                    class="rounded-full p-2 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                    title="Edit Assignment"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    v-if="currentUser?.role === 'ASSISTANT' || currentUser?.role === 'LECTURER'"
                    @click="deleteAssignment(assignment.id)"
                    class="rounded-full p-2 bg-red-500 hover:bg-red-600 text-white transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="!loading && assignmentStore.assignments.length > 0" class="mt-4 text-sm text-gray-600 text-center">
      Showing {{ assignmentStore.assignments.length }} assignment(s)
    </div>
  </main>
</template>