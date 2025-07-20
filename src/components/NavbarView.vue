<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// Path di mana navbar disembunyikan
const hideNavbarOn = ['/', '/register']

// Cek apakah path sekarang ada di daftar yang disembunyikan
const shouldHideNavbar = hideNavbarOn.includes(route.path)
</script>

<template>
  <nav
    v-if="!shouldHideNavbar"
    class="flex justify-between items-center px-6 py-4 bg-primary-500 text-white shadow-md"
  >
    <div class="text-xl font-bold">
      SceleNG
    </div>

    <div class="flex items-center gap-4">
      <span class="font-medium">Ayam</span>
      <button
        class="rounded-lg bg-secondary-900 text-primary-50 font-semibold px-3 py-2 transition"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
