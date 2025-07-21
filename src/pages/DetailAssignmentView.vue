<script setup lang="ts">
import { useAssignmentStore } from "@/stores/assignment";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import router from '@/router'
import { onMounted } from "vue";
const assignmentStore = useAssignmentStore();
const toast = useToast();
const route = useRoute();

onMounted(async () => {
  try {
    const id = route.params.id as string;
    await assignmentStore.getAssignmentDetail(id);
  } catch (error) {
    toast.error("Failed to load appointment details.");
  }
});

const deleteAssignment = async () => {
  const confirmed = confirm("Are you sure you want to delete this assignment?");
  if (!confirmed) return;

  try {
    const id = route.params.id as string;
    await assignmentStore.deleteAssignment(id);
    toast.success("Assignment deleted successfully.");
    router.push("/assignments")
  } catch (error) {
    toast.error("Failed to delete appointment.");
  }
};
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString();
</script>

<template>
    <div class=" flex flex-col justify-center items-center w-screen h-screen rounded-lg bg-accent-50">
        <div class="rounded-lg w-[800px] h-[400px] bg-white shadow-md">
            <div class="rounded-t-lg w-[800px] h-20 bg-purple-500 flex flex-row items-center justify-between">
                <h1 class="text-subtitle font-semibold text-white ml-4">Detail Assignments</h1>
                <div class="space-x-2 mr-6">
                    <router-link to="/assignments">
                        <button class="text-white text-plain bg-secondary-500 px-3 py-3 rounded-md">Back</button>
                    </router-link>
                    <router-link :to="`/assignments/${assignmentStore.assignment?.id}/edit`">
                        <button class="text-white text-plain bg-accent-500 px-3 py-3 rounded-md">Edit</button>
                    </router-link>
                    <button @click="deleteAssignment" class="text-white text-plain bg-primary-700 px-3 py-3 rounded-md">Delete</button>
                </div>
            </div>
            <div class="flex flex-row justify-start items-start ml-4">
                <div class="mt-12 flex flex-col space-y-10">
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">ID</h2>
                    <p class="font-poppins font-normal text-l">{{ assignmentStore.assignment?.id }}</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Title</h2>
                    <p class="font-poppins font-normal text-l">{{ assignmentStore.assignment?.title }}</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Course</h2>
                    <p class="font-poppins font-normal text-l">{{ assignmentStore.assignment?.course }}</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Owner</h2>
                    <p class="font-poppins font-normal text-l">{{ assignmentStore.assignment?.owner }}</p>
                </div>
            </div>
            <div class="mt-12 flex flex-col space-y-10 ml-[8%]">
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Due</h2>
                    <p class="font-poppins font-normal text-l">{{ formatDate(assignmentStore.assignment?.dueDate) }}</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Created At</h2>
                    <p class="font-poppins font-normal text-l">{{ formatDateTime(assignmentStore.assignment?.createdAt) }}</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-l">Modified At</h2>
                    <p class="font-poppins font-normal text-l">{{ formatDateTime(assignmentStore.assignment?.modifiedAt) }}</p>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

