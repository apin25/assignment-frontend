<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  ClipboardList, 
  GraduationCap,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  Award,
  Activity
} from 'lucide-vue-next'
import { useFileApi } from '@/composables/useFileApi'
import { useAuth } from '@/stores/auth'

const { fetchFiles } = useFileApi()
const { user } = useAuth()

// Dashboard stats - connect resources to real backend
const stats = ref({
  totalCourses: 8,
  totalAssignments: 15,
  totalResources: 0,
  totalForumPosts: 28,
  averageGrade: 87.5
})

const recentActivities = ref([
  {
    id: 1,
    type: 'resource',
    title: 'Slide Kuliah Bab 5 - Database Design',
    course: 'CSIM603026 - APAP',
    time: '2 jam yang lalu',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Tugas Individu - SCELE-NG Stage 1',
    course: 'CSIM603026 - APAP',
    time: '5 jam yang lalu',
    icon: ClipboardList,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 3,
    type: 'forum',
    title: 'Diskusi: Integrasi Antar Modul',
    course: 'CSIM603026 - APAP',
    time: '1 hari yang lalu',
    icon: MessageSquare,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 4,
    type: 'grade',
    title: 'Nilai Quiz 3 telah diumumkan',
    course: 'CSIM603026 - APAP',
    time: '2 hari yang lalu',
    icon: Award,
    color: 'bg-green-100 text-green-600'
  }
])

const upcomingDeadlines = ref([
  {
    id: 1,
    title: 'Tugas Individu - SCELE-NG Stage 1',
    course: 'CSIM603026 - APAP',
    dueDate: '2025-07-22T23:59:00Z',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Quiz 4 - Spring Boot Advanced',
    course: 'CSIM603026 - APAP',
    dueDate: '2025-07-25T14:00:00Z',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Presentasi Proyek Kelompok',
    course: 'CSIM603026 - APAP',
    dueDate: '2025-07-30T10:00:00Z',
    priority: 'low'
  }
])

// Fetch resources count from backend
const fetchResourcesCount = async () => {
  try {
    const result = await fetchFiles()
    if (result.success) {
      stats.value.totalResources = result.data?.length || 0
    }
  } catch (error) {
    console.error('Error fetching resources count:', error)
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDaysUntilDeadline = (dateString: string): number => {
  const deadline = new Date(dateString)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'border-l-red-400 bg-red-50'
    case 'medium': return 'border-l-yellow-400 bg-yellow-50'
    case 'low': return 'border-l-blue-400 bg-blue-50'
    default: return 'border-l-gray-400 bg-gray-50'
  }
}

onMounted(() => {
  fetchResourcesCount()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              Selamat Datang, {{ user?.name || 'User' }}! 👋
            </h1>
            <!-- <p class="text-blue-100 text-lg">
              {{ user?.npm || 'NPM' }} • {{ user?.program || 'Program Studi' }}
            </p> -->
            <p class="text-blue-100 text-sm">
              APAP - Semester Pendek 2024/2025
            </p>
          </div>
          <div class="hidden md:block">
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Clock class="h-8 w-8 mx-auto mb-2" />
              <p class="text-sm font-medium">{{ new Date().toLocaleTimeString('id-ID') }}</p>
              <p class="text-xs opacity-80">{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-xl">
              <BookOpen class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Courses</p>
              <p class="text-2xl font-bold text-blue-600">{{ stats.totalCourses }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-red-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-xl">
              <ClipboardList class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Assignments</p>
              <p class="text-2xl font-bold text-red-600">{{ stats.totalAssignments }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-xl">
              <FileText class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Resources</p>
              <p class="text-2xl font-bold text-yellow-600">{{ stats.totalResources }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-xl">
              <MessageSquare class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Forum Posts</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.totalForumPosts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-xl">
              <GraduationCap class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg Grade</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.averageGrade }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Recent Activities -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Recent Activities -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 flex items-center">
                <Activity class="h-6 w-6 mr-2 text-blue-600" />
                Recent Activities
              </h2>
              <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
            </div>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div :class="['p-3 rounded-xl', activity.color]">
                  <component :is="activity.icon" class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 mb-1">
                    {{ activity.title }}
                  </p>
                  <p class="text-sm text-blue-600 mb-1">{{ activity.course }}</p>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <RouterLink
                to="/resources/files"
                class="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group border border-blue-200"
              >
                <FileText class="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-semibold text-blue-900">Resources</span>
                <span class="text-xs text-blue-600 mt-1">Manage Files</span>
              </RouterLink>

              <div class="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-60 cursor-not-allowed border border-gray-200">
                <MessageSquare class="h-8 w-8 text-gray-400 mb-3" />
                <span class="text-sm font-semibold text-gray-500">Forum</span>
                <span class="text-xs text-gray-400 mt-1">Coming Soon</span>
              </div>

              <div class="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-60 cursor-not-allowed border border-gray-200">
                <ClipboardList class="h-8 w-8 text-gray-400 mb-3" />
                <span class="text-sm font-semibold text-gray-500">Assignments</span>
                <span class="text-xs text-gray-400 mt-1">Coming Soon</span>
              </div>

              <div class="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-60 cursor-not-allowed border border-gray-200">
                <BookOpen class="h-8 w-8 text-gray-400 mb-3" />
                <span class="text-sm font-semibold text-gray-500">Courses</span>
                <span class="text-xs text-gray-400 mt-1">Coming Soon</span>
              </div>

              <div class="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl opacity-60 cursor-not-allowed border border-gray-200">
                <GraduationCap class="h-8 w-8 text-gray-400 mb-3" />
                <span class="text-sm font-semibold text-gray-500">Grades</span>
                <span class="text-xs text-gray-400 mt-1">Coming Soon</span>
              </div>

              <RouterLink
                to="/resources/groups"
                class="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all group border border-green-200"
              >
                <Users class="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <span class="text-sm font-semibold text-green-900">Resource Groups</span>
                <span class="text-xs text-green-600 mt-1">Manage Groups</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Right Column - Upcoming Deadlines & Profile -->
        <div class="space-y-8">
          <!-- Profile Card -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span class="text-white text-2xl font-bold">{{ (user?.name || 'U').split(' ').map(n => n[0]).join('') }}</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900">{{ user?.name || 'User Name' }}</h3>
              <!-- <p class="text-sm text-gray-600">{{ user?.npm || 'NPM' }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ user?.faculty || 'Faculty' }}</p> -->
              <RouterLink
                to="/profile"
                class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Profile
              </RouterLink>
            </div>
          </div>

          <!-- Upcoming Deadlines -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900 flex items-center">
                <Bell class="h-5 w-5 mr-2 text-red-600" />
                Upcoming Deadlines
              </h2>
            </div>
            <div class="space-y-4">
              <div
                v-for="deadline in upcomingDeadlines"
                :key="deadline.id"
                :class="['p-4 rounded-xl border-l-4', getPriorityColor(deadline.priority)]"
              >
                <h3 class="text-sm font-semibold text-gray-900 mb-1">
                  {{ deadline.title }}
                </h3>
                <p class="text-xs text-gray-600 mb-2">{{ deadline.course }}</p>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-500">
                    {{ formatDate(deadline.dueDate) }}
                  </p>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-medium',
                      getDaysUntilDeadline(deadline.dueDate) <= 1 
                        ? 'bg-red-100 text-red-800' 
                        : getDaysUntilDeadline(deadline.dueDate) <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ getDaysUntilDeadline(deadline.dueDate) }} hari lagi
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">System Status</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Resources Module</span>
                <span class="flex items-center text-sm text-green-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Forum Module</span>
                <span class="flex items-center text-sm text-yellow-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Assignment Module</span>
                <span class="flex items-center text-sm text-yellow-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Courses Module</span>
                <span class="flex items-center text-sm text-yellow-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Grades Module</span>
                <span class="flex items-center text-sm text-yellow-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
</style>
