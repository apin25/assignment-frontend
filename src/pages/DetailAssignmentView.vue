<script setup lang="ts">
</script>

<template>
    <div class=" flex flex-col justify-center items-center w-screen h-screen rounded-lg bg-accent-50">
        <div class="rounded-lg w-[800px] h-[400px] bg-white shadow-md">
            <div class="rounded-t-lg w-[800px] h-20 bg-purple-500 flex flex-row items-center justify-between">
                <h1 class="text-subtitle font-semibold text-white ml-4">Detail Assignments</h1>
                <div class="space-x-2 mr-6">
                    <button class="text-white text-plain bg-secondary-500 px-3 py-3 rounded-md">Back</button>
                    <button class="text-white text-plain bg-accent-500 px-3 py-3 rounded-md">Edit</button>
                    <button class="text-white text-plain bg-primary-700 px-3 py-3 rounded-md">Delete</button>
                </div>
            </div>
            <div class="flex flex-row justify-start items-start ml-4">
                <div class="mt-12 flex flex-col space-y-16">
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">ID</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">Title</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">Course</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
            </div>
            <div class="mt-12 flex flex-col space-y-16 ml-[32%]">
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">Owner</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">Created</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
                <div class="space-x-2 flex flex-row">
                    <h2 class="font-poppins font-semibold text-xl">Due</h2>
                    <p class="font-poppins font-normal text-xl">Apa</p>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

