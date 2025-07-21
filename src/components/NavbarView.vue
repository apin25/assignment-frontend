<script setup lang="ts">
import Cookies from 'js-cookie'
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const hideNavbarOn = ['/', '/register']
const shouldHideNavbar = computed(() => hideNavbarOn.includes(route.path))

const username = ref('')

const fetchUser = async () => {
  const token = Cookies.get('token')
  if (!token) return

  try {
    console.log('Fetching user...')
    const res = await axios.get('http://localhost:8080/api/auth/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    username.value = res.data.body.username || ""
  } catch (err) {
    console.error('Failed to fetch user:', err)
    Cookies.remove('token')
    router.push('/')
  }
}

watch(() => route.path, (newPath) => {
  if (!hideNavbarOn.includes(newPath)) {
    fetchUser()
  }
}, { immediate: true })

const logout = () => {
  Cookies.remove('token')
  router.push('/')
}
</script>

<template>
  <nav
    v-if="!shouldHideNavbar"
    class="flex justify-between items-center px-4 py-3 bg-primary-500 text-white shadow-md"
  >
  <router-link to="/assignments">
    <div class="text-title font-bold">
      SceleNG
    </div>
  </router-link>

    <div class="flex items-center gap-4">
      <span class="font-medium">{{ username }}</span>
      <button
        class="rounded-lg bg-secondary-900 text-primary-50 font-semibold px-3 py-2 transition"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
