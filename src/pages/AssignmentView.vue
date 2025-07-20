<script setup lang="ts">
import { ref } from 'vue'

const dropdowns = ref({
  owner: false,
  course: false,
  status: false,
})

function toggleDropdown(type: 'owner' | 'course' | 'status') {
  for (const key in dropdowns.value) {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  }
  dropdowns.value[type] = true
}
</script>

<template>
  <div class="flex flex-col justify-center items-center mt-4">
    <h1 class="text-title">Assignments</h1>
    <div class="flex-row mb-4 mt-4">
      <input
        class="h-12 w-[800px] bg-secondary-100 mt-2 rounded-lg pl-4"
        placeholder="Search"
      />
      <button class="ml-6 rounded-lg bg-secondary-500 px-4 py-3 font-poppins text-white font-semibold">
        Search
      </button>
    </div>

    <div class="flex flex-row space-x-6">
      <!-- Dropdown Owner -->
      <div class="relative">
        <button @click="toggleDropdown('owner')" class="dropdown-button">
          Pilih Owner ▼
        </button>
        <div v-if="dropdowns.owner" class="dropdown-menu">
          <!-- Isi dropdown di sini -->
        </div>
      </div>

      <!-- Dropdown Course -->
      <div class="relative">
        <button @click="toggleDropdown('course')" class="dropdown-button">
          Pilih Course ▼
        </button>
        <div v-if="dropdowns.course" class="dropdown-menu">
          <!-- Isi dropdown di sini -->
        </div>
      </div>

      <!-- Dropdown Status -->
      <div class="relative">
        <button @click="toggleDropdown('status')" class="dropdown-button">
          Pilih Status ▼
        </button>
        <div v-if="dropdowns.status" class="dropdown-menu">
          <!-- Isi dropdown di sini -->
        </div>
      </div>
    </div>
    <div class="min-w-[90%] flex justify-end">
        <router-link to="/assignments/new">
        <button class="bg-purple-500 text-white py-4 px-4 rounded-lg font-semibold text-plain">
            Add Assignment
        </button>
    </router-link>
    </div>

<table class="min-w-[90%] divide-y divide-mint-200 mt-4 rounded-lg shadow overflow-hidden text-center">
  <thead class="bg-mint-500">
    <tr>
      <th class="px-6 py-3 text-plain font-semibold text-white">ID</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Title</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Course</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Owner</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Created</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Due</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Action</th>
    </tr>
  </thead>
  <tbody class="bg-white divide-y divide-gray-200">
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 text-sm text-gray-900">1</td>
      <td class="px-6 py-4 text-sm text-gray-900">Belajar Vue</td>
      <td class="px-6 py-4 text-sm text-gray-900">Vue.js</td>
      <td class="px-6 py-4 text-sm text-gray-900">Alvin</td>
      <td class="px-6 py-4 text-sm text-gray-900">2025-07-20</td>
      <td class="px-6 py-4 text-sm text-gray-900">2025-07-31</td>
      <td class="px-6 py-4 text-sm text-gray-900 space-x-1">
        <button class="text-white text-plain bg-secondary-500 px-3 py-3 rounded-md">Detail</button>
        <button class="text-white text-plain bg-accent-500 px-3 py-3 rounded-md">Edit</button>
        <button class="text-white text-plain bg-primary-700 px-3 py-3 rounded-md">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
  </div>
</template>

<style scoped>
.dropdown-button {
  @apply px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-100;
}
.dropdown-menu {
  @apply absolute mt-2 w-40 bg-white border rounded shadow-md z-10;
}
</style>
