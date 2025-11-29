<script setup lang="ts">
import { useAssignmentStore } from "@/stores/assignment";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/stores/toast';
import { Edit, Trash2, ArrowLeftCircleIcon, File, ChevronDown, Save, Plus, UserPlus } from 'lucide-vue-next'
import { onMounted, ref, reactive, computed } from "vue";
import { useFileApi } from "@/composables/useFileApi";

const assignmentStore = useAssignmentStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { getFileContent, fetchFiles } = useFileApi();
const loading = ref(false)
const showError = ref(false)
const errorTitle = ref('Terjadi Kesalahan')
const errorMessage = ref('Silakan coba lagi nanti.')
const files = ref([]);
const groupForm = reactive({
  selectedFile: ''
});

// New reactive data for partner management
const partnerSearch = ref('');
const selectedPartners = ref([]);

const groupFormSubmit = ref({
  answerText:"",
  answerFile:"",
  users:[]
})

async function openFileInNewTab(fileId: string) {
  try {
    const response = await getFileContent(fileId);
    const base64String = response.data;

    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (error) {
    console.error("Gagal membuka file:", error);
  }
}

// Function to add partner
const addPartner = async () => {
  if (!partnerSearch.value.trim()) {
    toast.showToast('Masukkan nama rekan terlebih dahulu', 'warning');
    return;
  }

  try {
    // Call the getUsersSubmit function (you'll need to import the store that has this method)
    // Assuming you have a user store with this method
    const user = await assignmentStore.getUsersSubmit(partnerSearch.value);
    
    if (user && !selectedPartners.value.find(p => p.id === user.id)) {
      selectedPartners.value.push(user);
      partnerSearch.value = ''; // Reset search field
      toast.showToast('Rekan berhasil ditambahkan', 'success');
    } else if (selectedPartners.value.find(p => p.id === user.id)) {
      toast.showToast('Rekan sudah ditambahkan sebelumnya', 'warning');
    }
  } catch (error) {
    console.error('Error adding partner:', error);
    toast.showToast('Gagal menambahkan rekan', 'error');
  }
};

// Function to remove partner
const removePartner = (index: number) => {
  selectedPartners.value.splice(index, 1);
  toast.showToast('Rekan berhasil dihapus', 'success');
};

onMounted(async () => {
  try {
    const id = route.params.id as string;
    await assignmentStore.getAssignmentDetail(id);
  } catch (error) {
    toast.showToast("Failed to load assignment details.");
  }

  try {
    const fileRes = await fetchFiles();
    files.value = fileRes.data;
  } catch (err) {
    console.error('Gagal memuat data:', err);
  }
});

const deleteAssignment = async () => {
  const confirmed = confirm("Are you sure you want to delete this assignment?");
  if (!confirmed) return;

  try {
    const id = route.params.id as string;
    await assignmentStore.deleteAssignment(id);
    toast.showToast("Assignment deleted successfully.", "success");
    router.push("/assignments");
  } catch (error) {
    toast.showToast("Failed to delete assignment.", "error");
  }
};

const isLate = computed(() => {
  const due = assignmentStore.assignment?.dueDate
  return due ? new Date(due) < new Date() : false
})

const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString();

const handleSubmit = async () => {
  showError.value = false
  const id = route.params.id as string;

  loading.value = true
  try {
    // Prepare assignment data with selected partners
    const assignmentData = {
      answerText: groupFormSubmit.value.answerText || null,
      answerFile: groupFormSubmit.value.answerFile || null,
      users: selectedPartners.value.map(partner => partner.id) // Map to user IDs
    }

    await assignmentStore.answerAssignment(id, assignmentData);
    // Show success message or redirect
    router.push({
      path: '/assignments'
    })
  } catch (err) {
    console.error('Error creating assignment:', err)
    showError.value = true
    errorTitle.value = 'Gagal Menyimpan'
    errorMessage.value = err.message || 'Gagal mensubmit assignment. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center w-screen min-h-screen rounded-lg bg-yellow-50">
    <div class=" my-20 rounded-lg w-[800px] min-h-[580px] bg-white shadow-md overflow-y-auto">
      <!-- Header -->
      <div class="rounded-t-lg w-full h-20 bg-purple-500 flex flex-row items-center justify-between">
        <h1 class="text-2xl font-semibold text-white ml-4">Detail Assignments</h1>
        <div class="space-x-2 mr-6">
          <router-link to="/assignments">
            <button class="rounded-full p-3 bg-green-500 hover:bg-green-600 text-white">
              <ArrowLeftCircleIcon class="w-4 h-4" />
            </button>
          </router-link>
          <router-link :to="`/assignments/${assignmentStore.assignment?.id}/update`">
            <button class="rounded-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white">
              <Edit class="w-4 h-4" />
            </button>
          </router-link>
          <button @click="deleteAssignment" class="rounded-full p-3 bg-red-500 hover:bg-red-600 text-white">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <!-- Assignment Details Grid -->
        <div class="grid grid-cols-2 gap-8 mb-8">
          <!-- Left Column -->
          <div class="space-y-6">
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">ID:</h2>
              <p class="font-poppins font-normal text-lg">{{ assignmentStore.assignment?.id }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Title:</h2>
              <p class="font-poppins font-normal text-lg">{{ assignmentStore.assignment?.title }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Course:</h2>
              <p class="font-poppins font-normal text-lg">{{ assignmentStore.assignment?.course?.name }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Owner:</h2>
              <p class="font-poppins font-normal text-lg">{{ assignmentStore.assignment?.owner }}</p>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Due:</h2>
              <p class="font-poppins font-normal text-lg">{{ formatDateTime(assignmentStore.assignment?.dueDate) }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Created At:</h2>
              <p class="font-poppins font-normal text-lg">{{ formatDateTime(assignmentStore.assignment?.createdAt) }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Modified At:</h2>
              <p class="font-poppins font-normal text-lg">{{ formatDateTime(assignmentStore.assignment?.modifiedAt) }}</p>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <h2 class="font-poppins font-semibold text-lg">Paper:</h2>
              <File 
                class="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600" 
                @click="openFileInNewTab(assignmentStore.assignment?.resource.id)"
              />
            </div>
          </div>
        </div>

        <!-- File Selection -->
        <div class="mb-6">
          <label for="selectedFile" class="block text-sm font-medium text-gray-700 mb-2">
            Pilih File Jawaban <span class="text-gray-500">(Opsional)</span>
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

        <!-- File Information -->
        <div class="flex items-center mb-4">
          <p class="mr-2 text-sm text-gray-700">File Anda:</p>
          <File 
            class="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600" 
            @click="openFileInNewTab(assignmentStore.assignment?.resource.id)" 
          />
        </div>

        <!-- Answer Text Area -->
        <div class="mb-4">
          <label for="answer" class="block text-sm font-medium text-gray-700 mb-2">
            Jawaban
          </label>
          <textarea
            id="answer"
            v-model="groupFormSubmit.answerText"
            class="bg-gray-100 min-h-40 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            placeholder="Tulis jawaban atau catatan di sini..."
          ></textarea>
        </div>

        <!-- Partner Selection Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Pilih Rekan
          </label>
          
          <!-- Partner Search Input with Add Button -->
          <div class="flex items-center mb-4">
            <div class="relative flex-1 mr-3">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserPlus class="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                v-model="partnerSearch"
                placeholder="Masukkan nama rekan"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                @keyup.enter="addPartner"
              />
            </div>
            <button
              @click="addPartner"
              class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus class="h-5 w-5" />
            </button>
          </div>

          <!-- Selected Partners List -->
          <div v-if="selectedPartners.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Rekan yang Dipilih:</h4>
            <div
              v-for="(partner, index) in selectedPartners"
              :key="partner.id"
              class="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border"
            >
              <div class="flex items-center">
                <UserPlus class="h-5 w-5 text-gray-500 mr-3" />
                <span class="text-sm font-medium text-gray-900">{{ partner.name }}</span>
                <span class="text-sm text-gray-500 ml-2">({{ partner.email || partner.username }})</span>
              </div>
              <button
                @click="removePartner(index)"
                class="p-1 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          v-if="!isLate"
          type="submit"
          @click="handleSubmit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save class="h-4 w-4 mr-2" />
          <span v-if="loading">Menyimpan...</span>
          <span v-else>Simpan Assignment</span>
        </button>
      </div>
    </div>
  </div>
</template>