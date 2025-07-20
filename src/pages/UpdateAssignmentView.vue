<script setup lang="ts">
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
                    />
            </div>
        <div class="flex flex-col">
                <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Course</h3>
                    <input
                        class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
                        placeholder="Course"
                    />
            </div>
        </div>
        <div class="flex flex-row space-x-5">
            <div class="flex flex-col">
                <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Owner</h3>
                    <input
                        class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg pl-4"
                        placeholder="Owner"
                    />
            </div>
        <div class="flex flex-col">
                <h3 class="font-poppins text-primary-500 mt-5 text-subtitle font-semibold">Due Date</h3>
                    <input
                        class="h-12 w-[500px] bg-primary-100 mt-2 rounded-lg p-4"
                        type="date"
                        min="today"
                    />
            </div>
        </div>
        <div class="flex flex-col">
            <router-link to="/assignments">
                <button class="h-12 w-[1020px] mt-12 rounded-lg bg-white text-primary-900 font-semibold border-primary-900 border-4">Cancel</button>
            </router-link>
            <button class="h-12 w-[1020px] mt-3 rounded-lg bg-secondary-900 text-primary-50 font-semibold">Update</button>
        </div>
    </div>
</template>

