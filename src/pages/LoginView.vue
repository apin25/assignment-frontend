<script setup lang="ts">
import { ref } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication'

const authStore = useAuthenticationStore()

const username = ref('')
const password = ref('')

function handleLogin() {
  authStore.login({
    username: username.value,
    password: password.value,
  })
}
</script>

<template>
  <header></header>

  <main>
    <div class="flex flex-row">
        <div class="w-1/2 h-screen bg-background-tertiary">
        </div>
        <div class="w-1/2 h-screen  bg-primary-500">
            <h1 class="font-poppins text-white text-hero text-center mt-32">Sign In</h1>
            <div class="w-88 ml-28">
                <h3 class="font-poppins text-primary-50 mt-8 text-subtitle">Username</h3>
                <input
                    v-model="username"
                    class="h-12 w-[540px] bg-primary-100 mt-2 rounded-lg pl-4"
                    placeholder="Username"
                    />
<h3 class="font-poppins text-primary-50 mt-3 text-subtitle">Password</h3>
                    <input
                    v-model="password"
                    class="h-12 w-[540px] bg-primary-100 mt-2 rounded-lg pl-4"
                    placeholder="Password"
                    type="password"
                    />
                <button
                    @click="handleLogin"
                    class="h-12 w-[540px] mt-12 rounded-lg bg-secondary-900 text-primary-50 font-semibold"
                    >
                    Sign In
                    </button>
                <p class="ml-16 mt-2 text-primary-900">If you have don't have an account, please <router-link to="/register"><span class="font-semibold underline">Sign Up</span></router-link></p>
            </div>
        </div>
    </div>
  </main>
</template>