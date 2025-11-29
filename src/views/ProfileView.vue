<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Hash, Edit, Save, X, Eye, EyeOff } from 'lucide-vue-next'
import { useToast } from '@/stores/toast'
import { useAuth } from '@/stores/auth'
import type { UserUpdateDto } from '@/types/auth'

const router = useRouter()
const { showToast } = useToast()
const { user, updateProfile, getCurrentUser } = useAuth()

const isEditing = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const editForm = ref<UserUpdateDto>({
  name: '',
  email: '',
  password: ''
})

const startEditing = () => {
  if (user.value) {
    editForm.value = {
      name: user.value.name,
      email: user.value.email,
      password: ''
    }
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  showPassword.value = false
  editForm.value = {
    name: '',
    email: '',
    password: ''
  }
}

const saveProfile = async () => {
  if (editForm.value.password && editForm.value.password.trim() && editForm.value.password.length < 8) {
    showToast('Password baru harus terdiri dari minimal 8 karakter.', 'error')
    return
  }

  loading.value = true
  
  try {
    const updateData: UserUpdateDto = {}
    if (editForm.value.name && editForm.value.name !== user.value?.name) {
      updateData.name = editForm.value.name
    }
    if (editForm.value.email && editForm.value.email !== user.value?.email) {
      updateData.email = editForm.value.email
    }
    if (editForm.value.password && editForm.value.password.trim()) {
      updateData.password = editForm.value.password
    }

    if (Object.keys(updateData).length === 0) {
      showToast('Tidak ada perubahan untuk disimpan.', 'info')
      isEditing.value = false
      return
    }

    await updateProfile(updateData)
    loading.value = false
    isEditing.value = false
    showToast('Profile berhasil diperbarui!', 'success')
  } catch (error: any) {
    loading.value = false
    showToast(error.message || 'Gagal memperbarui profile.', 'error')
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

onMounted(async () => {
  if (!user.value) {
    await getCurrentUser()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p class="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border p-6 text-center">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span class="text-white text-3xl font-bold">
                {{ user.name.split(' ').map(n => n[0]).join('') }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ user.name }}</h2>
            <p class="text-gray-600 mb-2">@{{ user.username }}</p>
            <span :class="['inline-flex px-3 py-1 rounded-full text-sm font-medium', getRoleBadgeColor(user.role)]">
              {{ user.role }}
            </span>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="text-xs text-gray-500 space-y-1">
                <p>Joined: {{ formatDate(user.createdAt) }}</p>
                <p class="font-mono break-all">ID: {{ user.id }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Personal Information</h3>
              <button
                v-if="!isEditing"
                @click="startEditing"
                class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Edit class="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>

            <form v-if="isEditing" @submit.prevent="saveProfile" class="space-y-6">
              <!-- Full Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    v-model="editForm.name"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <!-- Username (Read-only) -->
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    :value="user.username"
                    type="text"
                    readonly
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    v-model="editForm.email"
                    type="email"
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  New Password (Optional)
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="editForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    minlength="8"
                    title="Jika diisi, password baru harus minimal 8 karakter"
                    class="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl"
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <Eye v-if="!showPassword" class="h-5 w-5" />
                    <EyeOff v-else class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  @click="cancelEditing"
                  class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X class="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save class="h-4 w-4 mr-2" />
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

            <!-- Read-only View -->
            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div class="p-3 bg-gray-50 rounded-xl text-gray-900">
                    {{ user.name }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div class="p-3 bg-gray-50 rounded-xl text-gray-900">
                    {{ user.username }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div class="p-3 bg-gray-50 rounded-xl text-gray-900">
                    {{ user.email }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div class="p-3 bg-gray-50 rounded-xl">
                    <span :class="['inline-flex px-3 py-1 rounded-full text-sm font-medium', getRoleBadgeColor(user.role)]">
                      {{ user.role }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>