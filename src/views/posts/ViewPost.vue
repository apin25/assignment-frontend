<template>
  <div class="forum-container">
    <h1>Forum Diskusi</h1>

    <div class="filter-header">
      <form @submit.prevent="fetchPosts" class="filter-form">
        <select v-model="filters.author">
          <option value="">Semua Author</option>
          <option v-for="author in authors" :key="author" :value="author">
            {{ author }}
          </option>
        </select>

        <input v-model="filters.q" type="text" placeholder="Cari judul atau isi..." />

        <label class="checkbox">
          <input v-model="filters.showDeleted" type="checkbox" />
          Tampilkan Terhapus
        </label>

        <label class="checkbox">
          <input v-model="filters.childAlso" type="checkbox" />
          Tampilkan Balasan Juga
        </label>

        <button type="submit">Filter</button>
      </form>

      <router-link to="/posts/create" class="create-button"> + Buat Post Baru </router-link>
    </div>

    <div v-if="loading" class="loading">Memuat postingan...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="post-list" v-if="posts.length > 0">
      <RouterLink v-for="post in posts" :key="post.id" :to="`/posts/${post.id}`" class="post-card">
        <h2>{{ post.title }}</h2>
        <p class="content">{{ post.content }}</p>
        <div class="meta">
          <span
            ><strong>{{ post.author }}</strong></span
          >
          <span>{{ formatDate(post.createdAt) }}</span>
        </div>
      </RouterLink>
    </div>

    <div v-else-if="!loading" class="empty">Tidak ada postingan ditemukan.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'

const posts = ref<any[]>([])
const authors = ref<string[]>([])
const filters = ref({
  author: '',
  q: '',
  showDeleted: false,
  childAlso: false,
})
const loading = ref(false)
const error = ref('')

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/'
    return null
  }
  return token
}

const fetchPosts = async () => {
  const token = getAccessToken()
  if (!token) return

  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('/forum/posts', {
      params: filters.value,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    posts.value = response.data.data
  } catch {
    error.value = 'Gagal mengambil data forum.'
  } finally {
    loading.value = false
  }
}

const fetchAuthors = async () => {
  const token = getAccessToken()
  if (!token) return

  try {
    const response = await axios.get('/forum/authors', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    authors.value = response.data.data
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

onMounted(() => {
  fetchAuthors()
  fetchPosts()
})
</script>

<style scoped>
.forum-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fdfdfd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  margin-bottom: 1rem;
  color: #003366;
  font-size: 2rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.filter-form select,
.filter-form input[type='text'] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #003366;
  border-radius: 4px;
  min-width: 180px;
}

.filter-form .checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.filter-form button {
  background: #003366;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.create-button {
  background: #cc0000;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  transition: background 0.2s;
}

.create-button:hover {
  background: #a30000;
}

.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.1s,
    box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card h2 {
  margin: 0 0 0.5rem;
  color: #003366;
  font-size: 1.2rem;
}

.post-card .content {
  color: #444;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.post-card .meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.loading {
  color: #003366;
}

.error {
  color: red;
}

.empty {
  color: #666;
  font-style: italic;
}
</style>
