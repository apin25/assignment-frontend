<script setup lang="ts">
import { useWikiStore } from "@/stores/wiki";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/stores/toast';
import { Edit, Trash2, ArrowLeftCircleIcon, File } from 'lucide-vue-next'
import { computed, onMounted, ref } from "vue";
import { useAuth } from '@/stores/auth'
import { useFileApi } from "@/composables/useFileApi";

const wikiStore = useWikiStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const currentUser = ref(null);
const { getFileContent } = useFileApi();
const groupForm = ref({ author: "", authorName: "" });

async function openFileInNewTab(fileId: string) {
  try {
    const response = await getFileContent(fileId)
    const base64String = response.data

    // Decode base64 ke binary
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)

    // Tentukan MIME type. Misal PDF:
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    // Buat object URL
    const blobUrl = URL.createObjectURL(blob)

    // Buka tab baru
    window.open(blobUrl, '_blank')

    // Optional: revoke object URL setelah beberapa detik
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
  } catch (error) {
    console.error("Gagal membuka file:", error)
  }
}

onMounted(async () => {
  try {
    const id = route.params.id as string;
    await wikiStore.getWikiDetail(id);
  } catch (error) {
    toast.showToast("Failed to load wiki details.");
  }

  try {
    const { getCurrentUser } = useAuth()
    currentUser.value = await getCurrentUser()
    groupForm.value.author = currentUser.value?.id
    groupForm.value.authorName = currentUser.value?.name
  } catch (err) {
    console.error('Gagal ambil user:', err)
  }
});

const deleteWiki = async () => {
  const confirmed = confirm("Are you sure you want to delete this wiki?");
  if (!confirmed) return;

  try {
    const id = route.params.id as string;
    await wikiStore.deleteWiki(id);
    toast.showToast("Wiki deleted successfully.", "success");
    router.push("/wikis")
  } catch (error) {
    toast.showToast("Failed to delete wiki.", "error");
  }
};

const editAndDeleteAllow = computed(() => {
  return wikiStore.wiki?.author?.id === currentUser.value?.id;
});

const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString();
</script>

<template>
  <div class="flex flex-col justify-center items-center w-screen h-screen rounded-lg bg-yellow-50">
    <div class="rounded-lg w-[800px] max-h-[90vh] overflow-y-auto bg-white shadow-md">
      <!-- Header -->
      <div class="sticky top-0 rounded-t-lg w-full h-20 bg-purple-500 flex flex-row items-center justify-between z-10">
        <h1 class="text-2xl font-semibold text-white ml-4">Detail Wikis</h1>
        <div class="space-x-2 mr-6">
          <router-link to="/wikis">
            <button class="rounded-full p-3 bg-green-500 hover:bg-green-600 text-white">
              <ArrowLeftCircleIcon class="w-4 h-4" />
            </button>
          </router-link>
          <template v-if="editAndDeleteAllow">
            <router-link :to="`/wikis/${wikiStore.wiki?.id}/update`">
              <button class="rounded-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white">
                <Edit class="w-4 h-4" />
              </button>
            </router-link>
            <button @click="deleteWiki" class="rounded-full p-3 bg-red-500 hover:bg-red-600 text-white">
              <Trash2 class="w-4 h-4" />
            </button>
          </template>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Wiki Details Grid -->
        <div class="grid grid-cols-2 gap-8 mb-8">
          <!-- Left Column -->
          <div class="space-y-6">
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">ID:</h2>
              <p class="font-poppins font-normal text-lg">{{ wikiStore.wiki?.id }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Title:</h2>
              <p class="font-poppins font-normal text-lg">{{ wikiStore.wiki?.title }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Course:</h2>
              <p class="font-poppins font-normal text-lg">{{ wikiStore.wiki?.course?.name }}</p>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <h2 class="font-poppins font-semibold text-lg">Paper:</h2>
              <File 
                class="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600" 
                @click="openFileInNewTab(wikiStore.wiki?.resource.id)"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Author:</h2>
              <p class="font-poppins font-normal text-lg">{{ wikiStore.wiki?.author.name }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Created At:</h2>
              <p class="font-poppins font-normal text-lg">{{ formatDateTime(wikiStore.wiki?.createdAt) }}</p>
            </div>
            <div class="flex flex-row gap-2">
              <h2 class="font-poppins font-semibold text-lg">Modified At:</h2>
              <p class="font-poppins font-normal text-lg">{{ formatDateTime(wikiStore.wiki?.modifiedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Content</h3>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="whitespace-pre-wrap text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
              {{ wikiStore.wiki?.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>