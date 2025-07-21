<script setup lang="ts">
import { ref } from 'vue';
import { useAssignmentStore } from '@/stores/assignment';
import { useToast } from 'vue-toastification';

const assignmentStore = useAssignmentStore();
const toast = useToast();

const title = ref('');
const course = ref('');
const owner = ref('');
const dueDate = ref('');

async function submitForm() {
  try {
    const payload = {
      title: title.value,
      course: course.value,
      owner: owner.value,
      dueDate: new Date(dueDate.value),
    };

    await assignmentStore.addAssignment(payload);
  } catch (error) {
    console.error(`Gagal menambah assignment: ${error}`);
    toast.error('Terjadi kesalahan saat menambah assignment.');
  }
}
</script>

<template>
  <div class="mt-4 flex flex-col justify-center items-center font-poppins">
    <h1 class="text-title">New Assignments</h1>
    <div class="flex flex-row space-x-5">
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Title</h3>
        <input
          v-model="title"
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Title"
        />
      </div>
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Course</h3>
        <input
          v-model="course"
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Course"
        />
      </div>
    </div>

    <div class="flex flex-row space-x-5">
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Owner</h3>
        <input
          v-model="owner"
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Owner"
        />
      </div>
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Due Date</h3>
        <input
          v-model="dueDate"
          type="date"
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <button
        @click="submitForm"
        class="h-12 w-[1020px] mt-10 rounded-lg bg-secondary-900 text-primary-50 font-semibold"
      >
        Create
      </button>

      <router-link to="/assignments">
        <button class="h-12 w-[1020px] mt-3 rounded-lg bg-white text-primary-900 font-semibold border-primary-900 border-4">
          Cancel
        </button>
      </router-link>
    </div>
  </div>
</template>
