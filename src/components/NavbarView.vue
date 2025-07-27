<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication'

const authStore = useAuthenticationStore()
const route = useRoute()

const hideNavbarOn = ['/', '/register']
const shouldHideNavbar = computed(() => hideNavbarOn.includes(route.path))

// Cek route dan panggil store.fetchUser()
watch(
  () => route.path,
  (newPath) => {
    if (!hideNavbarOn.includes(newPath)) {
      authStore.fetchUser()
    }
  },
  { immediate: true }
)

const logout = () => {
  authStore.logout()
}

</script>


<template>
  <nav
    v-if="!shouldHideNavbar"
    class="flex justify-between items-center px-4 py-3 bg-primary-500 text-white shadow-md font-poppins"
  >
    <div class="flex flex-row items-center gap-x-10">
        <p class="text-title font-bold">SceleNG</p>
      <router-link to="/assignments">
        <p class="font-semibold text-lg text-center">Assignments</p>
      </router-link>
      <router-link to="/wiki">
         <p class="font-semibold text-lg text-center">Wiki</p>
      </router-link>
    </div>

    <div class="flex items-center gap-4">
      <span class="font-medium">{{ authStore.user?.username }}</span>
      <button
        class="rounded-lg bg-secondary-900 text-primary-50 font-semibold px-3 py-2 transition"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
