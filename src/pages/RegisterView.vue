<script setup lang="ts">
import { ref } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication'
import type { Register } from '@/interfaces/register.interface'

const authStore = useAuthenticationStore()

const name = ref('')
const username = ref('')
const password = ref('')

const onRegister = async () => {
  const payload: Register = {
    name: name.value,
    username: username.value,
    password: password.value,
  }

  await authStore.register(payload)
}
</script>

<template>
  <header></header>

  <main>
    <div class="flex flex-row">
        <div class="w-1/2 h-screen bg-background-tertiary">
        </div>
        <div class="w-1/2 h-screen  bg-primary-500">
            <h1 class="font-poppins text-white text-hero text-center mt-20">Sign Up</h1>
            <div class="w-88 ml-28">
                <h3 class="font-poppins text-primary-50 mt-8 text-subtitle">Name</h3>
                <input
                    class="h-12 w-[540px] bg-primary-100 mt-2 rounded-lg pl-4"
                    placeholder="Name"
                    v-model="name"
                />
                <h3 class="font-poppins text-primary-50 mt-5 text-subtitle">Username</h3>
                <input
                    class="h-12 w-[540px] bg-primary-100 mt-2 rounded-lg pl-4"
                    placeholder="Username"
                    v-model="username"
                />
                <h3 class="font-poppins text-primary-50 mt-5 text-subtitle">Password</h3>
                <input
                    class="h-12 w-[540px] bg-primary-100 mt-2 rounded-lg pl-4"
                    placeholder="Password"
                    type="password"
                    v-model="password"
                />
                    <button @click="onRegister" class="h-12 w-[540px] mt-12 rounded-lg bg-secondary-900 text-primary-50 font-semibold">Sign Up</button>
                <p class="ml-16 mt-2 text-primary-900">If you have don't have an account, please <router-link to="/"><span class="font-semibold underline">Sign In</span></router-link></p>
            </div>
        </div>
    </div>
  </main>
</template>