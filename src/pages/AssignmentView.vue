<script setup lang="ts">
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { useAssignmentStore } from '@/stores/assignment'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { useRoute } from 'vue-router'

const route = useRoute()
const toast = useToast()

const dropdowns = ref({
  owner: false,
  course: false,
  status: false,
})

const assignmentStore = useAssignmentStore() // <--- Pindah sini dulu

const uniqueOwners = computed(() =>
  [...new Set(assignmentStore.assignments.map((a) => a.owner))].filter(Boolean)
)

const uniqueCourses = computed(() =>
  [...new Set(assignmentStore.assignments.map((a) => a.course))].filter(Boolean)
)

const loading = ref(true)

function toggleDropdown(type: 'owner' | 'course' | 'status') {
  const current = dropdowns.value[type]
  for (const key in dropdowns.value) {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  }
  dropdowns.value[type] = !current
}

async function deleteAssignment(id: string) {
  const confirmed = confirm("Are you sure you want to delete this assignment?")
  if (!confirmed) return

  try {
    await assignmentStore.deleteAssignment(id)
    toast.success("Assignment deleted successfully.")
    router.push("/assignments")
  } catch (error) {
    toast.error("Failed to delete appointment.")
  }
}

function handleClickOutside(event: MouseEvent) {
  const dropdownElements = document.querySelectorAll('.dropdown-button, .dropdown-menu')
  let clickedInside = false

  dropdownElements.forEach((el) => {
    if (el.contains(event.target as Node)) {
      clickedInside = true
    }
  })

  if (!clickedInside) {
    for (const key in dropdowns.value) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  }
}

onMounted(async () => {
  loading.value = true
  await assignmentStore.getAssignments()
  console.log('Assignment di template:', assignmentStore.assignments)
  loading.value = false

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
const selected = ref({
  owner: '' as string,
  course: '' as string,
  status: '' as string,
})
function selectDropdown(type: 'owner' | 'course' | 'status', value: string) {
  if (
    value === 'Pilih Owner' ||
    value === 'Pilih Course' ||
    value === 'Pilih Status'
  ) {
    selected.value[type] = ''
  } else {
    selected.value[type] = value
  }
  dropdowns.value[type] = false
}


const formatDate = (date: string) => new Date(date).toLocaleDateString()
const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString()
const searchQuery = ref('');

function applyFilter() {
  assignmentStore.getAssignments(
    selected.value.course,
    selected.value.owner,
    selected.value.status,
    searchQuery.value
  );
}

</script>

<template>
  <div class="flex flex-col justify-center items-center mt-4">
    <h1 class="text-title">Assignments</h1>
    <div class="flex-row mb-4 mt-4">
<input
  v-model="searchQuery"
  class="h-12 w-[800px] bg-secondary-100 mt-2 rounded-lg pl-4"
  placeholder="Search by Title"
/>

        <button
          class="ml-6 rounded-lg bg-secondary-500 px-4 py-3 font-poppins text-white font-semibold"
          @click="applyFilter"
        >
          Search
        </button>

    </div>

    <div class="flex flex-row space-x-6">
      <!-- Dropdown Owner -->
      <div class="relative">
  <button @click="toggleDropdown('owner')" class="dropdown-button">
    {{ selected.owner || 'Select Owner' }} ▼
  </button>
  <div v-if="dropdowns.owner" class="dropdown-menu">
    <ul>
      <li
  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
  @click="selectDropdown('owner', null)"
>
  All Owners
</li>
      <li
        v-for="owner in uniqueOwners"
        :key="owner"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        @click="selectDropdown('owner', owner)"
      >
        {{ owner }}
      </li>
    </ul>
  </div>
</div>

      <div class="relative">
  <button @click="toggleDropdown('course')" class="dropdown-button">
    {{ selected.course || 'Select Course' }} ▼
  </button>
  <div v-if="dropdowns.course" class="dropdown-menu">
    <ul>
      <li
  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
  @click="selectDropdown('course', null)"
>
  All Courses
</li>

      <li
        v-for="course in uniqueCourses"
        :key="course"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        @click="selectDropdown('course', course)"
      >
        {{ course }}
      </li>
    </ul>
  </div>
</div>

      <div class="relative">
  <button @click="toggleDropdown('status')" class="dropdown-button">
    {{ selected.status || 'Select Status' }} ▼
  </button>
  <div v-if="dropdowns.status" class="dropdown-menu">
    <ul>
      <ul>
  <li
  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
  @click="selectDropdown('status', null)"
>
  All Status
</li>
<li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="selectDropdown('status', 'Overdue')">
  Overdue
</li>
<li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="selectDropdown('status', 'On Time')">
  On Time
</li>

</ul>
    </ul>
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

<table class="min-w-[90%] divide-y divide-mint-200 mt-4 rounded-lg shadow overflow-hidden text-center mb-6">
  <thead class="bg-mint-500">
    <tr>
      <th class="px-6 py-3 text-plain font-semibold text-white">No</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">ID</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Title</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Course</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Owner</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Due Date</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Created At</th>
      <th class="px-6 py-3 text-plain font-semibold text-white">Action</th>
    </tr>
  </thead>
  <tbody class="bg-white divide-y divide-gray-200">
<tr
  v-for="(assignment, index) in assignmentStore.assignments"
  :key="assignment.id"
  :class="{ 'bg-primary-200': new Date(assignment.dueDate) < new Date() }"
>
    <td class="py-4 text-sm text-gray-900">{{ index + 1 }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ assignment.id }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ assignment.title }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ assignment.course }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ assignment.owner }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(assignment.dueDate) }}</td>
    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDateTime(assignment.createdAt) }}</td>
    <td class="px-6 py-4 text-sm text-gray-900 space-x-1">
    <router-link :to="`/assignments/${assignment.id}`">
      <button class="text-white text-plain bg-secondary-500 px-3 py-3 rounded-md">Detail</button>
    </router-link>
    <router-link :to="`/assignments/${assignment.id}/edit`">
      <button class="text-white text-plain bg-accent-500 px-3 py-3 rounded-md">Edit</button>
    </router-link>
      <button class="text-white text-plain bg-primary-700 px-3 py-3 rounded-md" @click="deleteAssignment(assignment.id)">Delete</button>
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
