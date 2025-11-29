<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Home,
  FileText, 
  MessageSquare, 
  ClipboardList, 
  BookOpen,
  GraduationCap,
  Users,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChartBar
} from 'lucide-vue-next'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, isAdmin, isStudent, isLecturer, logout, initAuth } = useAuth()

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

// Navigation items
const navigation = computed(() => [
  { name: 'Dashboard', href: '/dashboard', icon: Home, current: false, active: true },
  { name: 'Resources', href: '/resources/files', icon: FileText, current: false, active: true },
  { name: 'Forum', href: '/posts', icon: MessageSquare, current: false, active: true },
  // Student-specific navigation
  ...(isStudent.value ? [{ name: 'Feedback', href: '/feedback', icon: ChartBar, current: false, active: true }] : []),
  // Lecturer-specific navigation
  ...(isLecturer.value ? [{ name: 'Inbox Feedback', href: '/feedback/inbox', icon: ChartBar, current: false, active: true }] : []),
  { name: 'Assignments', href: '/assignments', icon: ClipboardList, current: false, active: true },
  { name: 'Wiki', href: '/wikis', icon: ClipboardList, current: false, active: true },
  { name: 'Courses', href: '/courses', icon: BookOpen, current: false, active: false },
  { name: 'Grades', href: '/grades', icon: GraduationCap, current: false, active: false },
  // Admin-specific navigation
  ...(isAdmin.value ? [{ name: 'User Management', href: '/users', icon: Users, current: false, active: true }] : [])
])

// Check if current route is auth page
const isAuthPage = computed(() => {
  return ['/login', '/register'].includes(route.path)
})

// Update current navigation based on route
const updateCurrentNavigation = () => {
  navigation.value.forEach(item => {
    item.current = item.href === route.path || (item.href !== '/' && route.path.startsWith(item.href))
  })
}

const handleLogout = () => {
  userMenuOpen.value = false
  logout()
  toast.showToast('Berhasil logout. Sampai jumpa!', 'success')
}

onMounted(async () => {
  await initAuth()
  updateCurrentNavigation()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <!-- Navigation Header - Hide on auth pages -->
    <nav v-if="!isAuthPage && isAuthenticated" class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and primary nav -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <RouterLink to="/dashboard" class="flex items-center">
                <img src="/images/ui-logo.png" alt="UI Logo" class="h-8 w-8 mr-3" />
                <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                  SCELE-NG
                </span>
              </RouterLink>
            </div>
            
            <!-- Desktop navigation -->
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <RouterLink
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                :class="[
                  item.current
                    ? 'border-blue-500 text-gray-900'
                    : item.active
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                ]"
                :disabled="!item.active"
              >
                <component :is="item.icon" class="h-4 w-4 mr-2" />
                {{ item.name }}
                <span v-if="!item.active" class="ml-1 text-xs text-gray-400">(Soon)</span>
              </RouterLink>
            </div>
          </div>

          <!-- Right side -->
          <div class="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <!-- User menu -->
            <div class="relative" v-if="user">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors bg-white rounded-full p-2 hover:bg-gray-50"
              >
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mr-2">
                  <span class="text-white text-sm font-bold">
                    {{ user.name.split(' ').map(n => n[0]).join('') }}
                  </span>
                </div>
                <span class="font-medium">{{ user.name }}</span>
                <ChevronDown class="h-4 w-4 ml-1" />
              </button>

              <!-- User dropdown -->
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50"
                @click.away="userMenuOpen = false"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
                <RouterLink
                  to="/profile"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="userMenuOpen = false"
                >
                  <User class="h-4 w-4 mr-3" />
                  Profile Settings
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut class="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
              <X v-else class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              item.current
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : item.active
                ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                : 'border-transparent text-gray-300 cursor-not-allowed',
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors'
            ]"
            :disabled="!item.active"
            @click="mobileMenuOpen = false"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="h-5 w-5 mr-3" />
              {{ item.name }}
              <span v-if="!item.active" class="ml-2 text-xs text-gray-400">(Soon)</span>
            </div>
          </RouterLink>
        </div>
        
        <!-- Mobile user menu -->
        <div v-if="user" class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">
                {{ user.name.split(' ').map(n => n[0]).join('') }}
              </span>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ user.name }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <RouterLink
              to="/profile"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              @click="mobileMenuOpen = false"
            >
              Profile Settings
            </RouterLink>
            <button
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <RouterView />
    </main>

    <!-- Toast Notifications - Ganti dengan ToastContainer yang baru -->
    <ToastContainer />
  </div>
</template>

<style scoped>
.router-link-active {
  @apply border-blue-500 text-gray-900;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>