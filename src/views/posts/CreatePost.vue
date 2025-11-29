<template>
  <div class="create-container">
    <h1>Buat Post Baru</h1>
    <form @submit.prevent="createPost" class="create-form">
      <input v-model="newPost.title" type="text" placeholder="Judul Post" />
      <textarea v-model="newPost.content" placeholder="Isi Post"></textarea>
      <div class="form-actions">
        <button type="submit">Kirim</button>
        <router-link to="/posts" class="cancel">Batal</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const newPost = ref({
  title: '',
  content: '',
})

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/'
    return null
  }
  return token
}

const createPost = async () => {
  if (!newPost.value.title || !newPost.value.content) {
    alert('Semua field wajib diisi.')
    return
  }

  try {
    const token = getAccessToken()
    if (!token) return
    await axios.post('/forum/posts', newPost.value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    router.push('/posts')
  } catch (err) {
    console.error(err)
    alert('Gagal membuat post.')
  }
}
</script>

<style scoped>
.create-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  margin-bottom: 1.5rem;
  color: #003366;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-form input,
.create-form textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #003366;
  border-radius: 4px;
  font-size: 1rem;
}

.create-form textarea {
  min-height: 150px;
  resize: vertical;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.create-form button {
  background: #cc0000;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.create-form button:hover {
  background: #a30000;
}

.cancel {
  color: #003366;
  text-decoration: underline;
  cursor: pointer;
}
</style>