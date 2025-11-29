<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Users, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { User, ApiResponseDto } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { getAuthHeaders, isAdmin } = useAuth()

const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const showDeleted = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

const initializeFromURL = () => {
  const params = route.query
  if (params.q) searchQuery.value = params.q as string
  if (params.role) roleFilter.value = params.role as string
  if (params.showDeleted) showDeleted.value = params.showDeleted === 'true'
}

const updateURL = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (roleFilter.value) query.role = roleFilter.value
  if (showDeleted.value) query.showDeleted = 'true'
  
  router.replace({ query })
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (searchQuery.value) params.append('q', searchQuery.value)
    if (roleFilter.value) params.append('role', roleFilter.value)
    if (showDeleted.value) params.append('showDeleted', 'true')

    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/users?${params}`, {
      headers: getAuthHeaders()
    })
    
    const result: ApiResponseDto<User[]> = await response.json()
    
    if (result.success) {
      users.value = result.data
    } else {
      showToast(result.message || 'Failed to fetch users', 'error')
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    showToast('Error connecting to server', 'error')
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateURL()
    fetchUsers()
  }, 500)
}

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  showDeleted.value = false
  updateURL()
  fetchUsers()
}

const deleteUser = async (user: User) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_BE_AUTH_URL + `/api/users/${user.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    const result: ApiResponseDto<null> = await response.json()
    
    if (result.success) {
      showToast('User berhasil dihapus!', 'success')
      fetchUsers()
    } else {
      showToast(result.message || 'Hapus gagal', 'error')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast('Error saat hapus user', 'error')
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

const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800'
    case 'LECTURER': return 'bg-blue-100 text-blue-800'
    case 'STUDENT': return 'bg-green-100 text-green-800'
    case 'ASSISTANT': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const isUserDeleted = (user: User): boolean => {
  return !!user.deletedAt
}

watch(() => route.query, () => {
  initializeFromURL()
  fetchUsers()
})

onMounted(() => {
  if (!isAdmin.value) {
    router.push('/dashboard')
  } else {
    initializeFromURL()
    fetchUsers()
  }
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-sm text-gray-600">Manage all system users and their permissions.</p>
      </div>
      <RouterLink
        to="/users/create"
        class="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Plus class="w-5 h-5" />
        Add New User
      </RouterLink>
    </div>

    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or username..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            v-model="roleFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="updateURL(); fetchUsers()"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ASSISTANT">Assistant</option>
          </select>
        </div>

        <div class="flex items-end">
          <label class="flex items-center">
            <input
              v-model="showDeleted"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              @change="updateURL(); fetchUsers()"
            />
            <span class="ml-2 text-sm text-gray-700">Show Deleted Users</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button
          @click="clearFilters"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Search class="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center text-gray-500">
        <Users class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p class="text-lg font-medium">No users found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gradient-to-r from-blue-700 to-red-600 text-white">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">User</th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Role</th>
              <th class="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Created At</th>
              <th class="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(user, index) in users"
              :key="user.id"
              :class="[
                isUserDeleted(user) 
                  ? 'bg-red-50 text-gray-400' 
                  : [
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                      'hover:bg-blue-50'
                    ],
                'transition-colors'
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-sm font-bold">
                      {{ user.name.split(' ').map(n => n[0]).join('') }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium" :class="isUserDeleted(user) ? 'text-gray-400 line-through' : 'text-gray-900'">
                      {{ user.name }}
                    </div>
                    <div class="text-sm" :class="isUserDeleted(user) ? 'text-gray-400 line-through' : 'text-gray-500'">
                      @{{ user.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isUserDeleted(user) ? 'text-gray-400 line-through' : 'text-gray-900'">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getRoleBadgeColor(user.role), isUserDeleted(user) ? 'opacity-50' : '']">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isUserDeleted(user) ? 'text-gray-400 line-through' : 'text-gray-900'">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <template v-if="isUserDeleted(user)">
                  <span class="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium cursor-not-allowed">
                    Deleted
                  </span>
                </template>
                <template v-else>
                  <div class="flex justify-center gap-2">
                    <button
                      @click="router.push(`/users/${user.id}`)"
                      class="rounded-full p-2 bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button
                      @click="router.push(`/users/${user.id}/edit`)"
                      class="rounded-full p-2 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                      title="Edit User"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="rounded-full p-2 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                      title="Delete User"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
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
