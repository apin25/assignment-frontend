<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useAssignmentStore } from "@/stores/assignment";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const assignmentStore = useAssignmentStore();

const title = ref('');
const course = ref('');
const owner = ref('');
const dueDate = ref('');

onMounted(async () => {
  const id = route.params.id as string;
  await assignmentStore.getAssignmentDetail(id);
  
  const assignment = assignmentStore.assignment;
  if (assignment) {
    title.value = assignment.title;
    course.value = assignment.course;
    owner.value = assignment.owner;
    dueDate.value = assignment.dueDate?.slice(0, 10); 
  }
});

async function submitForm() {
  const id = route.params.id as string;

  try {
    const payload = {
      title: title.value,
      course: course.value,
      owner: owner.value,
      dueDate: new Date(dueDate.value),
    };
    await assignmentStore.updateAssignment(id, payload);
    toast.success("Assignment updated successfully!");
    router.push("/assignments");
  } catch (error) {
    console.error("Failed to update assignment:", error);
    toast.error("Failed to update assignment.");
  }
}
</script>

<template>
  <div class="mt-4 flex flex-col justify-center items-center">
    <h1 class="text-title">Update Assignments</h1>

    <div class="flex flex-row space-x-5">
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Title</h3>
        <input
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Title"
          v-model="title"
        />
      </div>
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Course</h3>
        <input
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Course"
          v-model="course"
        />
      </div>
    </div>

    <div class="flex flex-row space-x-5">
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Owner</h3>
        <input
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          placeholder="Owner"
          v-model="owner"
        />
      </div>
      <div class="flex flex-col">
        <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Due Date</h3>
        <input
          class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
          type="date"
          v-model="dueDate"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <button
        @click="submitForm"
        class="h-12 w-[1020px] mt-10 rounded-lg bg-secondary-900 text-primary-50 font-semibold"
      >
        Update
      </button>

      <router-link to="/assignments">
        <button
          class="h-12 w-[1020px] mt-3 rounded-lg bg-white text-primary-900 font-semibold border-primary-900 border-4"
        >
          Cancel
        </button>
      </router-link>
    </div>
  </div>
</template>
