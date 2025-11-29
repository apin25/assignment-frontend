<template>
  <div class="edit-container" v-if="post">
    <h1>Edit Post</h1>
    <form @submit.prevent="updatePost" class="edit-form">
      <input v-model="post.title" type="text" placeholder="Judul Post" />
      <textarea v-model="post.content" placeholder="Isi Post"></textarea>

      <button type="submit">Simpan Perubahan</button>
      <router-link to="/posts" class="cancel">Batal</router-link>
    </form>
  </div>

  <div v-else class="loading">Memuat data post...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const postId = route.params.id as string
const post = ref<any>(null)

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/'
    return null
  }
  return token
}

const fetchPost = async () => {
  try {
    const token = getAccessToken()
    if (!token) return
    const response = await axios.get(`/forum/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    post.value = response.data.data
  } catch (err) {
    console.error(err)
    alert('Gagal memuat data post/post tidak ditemukan.')
    router.push('/404')
  }
}

const updatePost = async () => {
  try {
    const token = getAccessToken()
    if (!token) return
    await axios.put(`/forum/posts/${postId}`, {
      title: post.value.title,
      content: post.value.content,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    router.push('/posts')
  } catch (err) {
    console.error(err)
    alert('Gagal mengupdate post.')
  }
}

onMounted(fetchPost)
</script>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  margin-bottom: 1rem;
  color: #003366;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-form input,
.edit-form textarea {
  padding: 0.5rem;
  border: 1px solid #003366;
  border-radius: 4px;
}

.edit-form button {
  background: #cc0000;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel {
  display: inline-block;
  margin-top: 0.5rem;
  color: #003366;
  text-decoration: underline;
  cursor: pointer;
}

.loading {
  text-align: center;
  margin-top: 2rem;
  color: #003366;
}
</style>
