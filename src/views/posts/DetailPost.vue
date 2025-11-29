<template>
  <div class="post-detail-container" v-if="post">
    <router-link to="/posts" class="back-button">← Kembali ke Forum</router-link>

    <h1>{{ post.title }}</h1>
    <p class="content">{{ post.content }}</p>
    <div class="meta">
      <strong>{{ post.author }}</strong>
      <small>{{ formatDate(post.createdAt) }}</small>
    </div>

    <div class="action-buttons">
      <router-link :to="`/posts/${post.id}/edit`" class="edit-button"  v-if="user?.username === post.author">Edit Forum</router-link>

      <button @click="showMainReply = !showMainReply" class="reply-toggle">
        {{ showMainReply ? 'Close Thread' : 'Create Thread' }}
      </button>

      <button @click="deletePost" class="delete-button"  v-if="user?.username === post.author">Delete Forum</button>
    </div>

    <CreateReply v-if="showMainReply" :parent-id="post.id" @reply-created="handleReplyCreated" />

    <h2>Thread</h2>
    <div v-if="post.replies && post.replies.length > 0">
      <ReplyItem
        v-for="reply in post.replies"
        :key="reply.id"
        :reply="reply"
        @refresh="fetchPost"
      />
    </div>
    <div v-else class="no-replies">Belum ada Thread.</div>
  </div>

  <div v-else class="loading">Memuat post...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import CreateReply from '@/components/posts/CreateReply.vue'
import ReplyItem from '@/components/posts/ReplyItem.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const { user } = useAuth()
if(user === null) {
  window.location.href = '/'
}

const route = useRoute()
const postId = route.params.id as string

const post = ref<any>(null)
const showMainReply = ref(false)

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
    if( !token) return
    const response = await axios.get(`/forum/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    post.value = response.data.data
  } catch (err) {
    console.error('Gagal mengambil post:', err)
    router.push('/404')
  }
}

const handleReplyCreated = () => {
  fetchPost()
  showMainReply.value = false
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const deletePost = async () => {
  if (!confirm('Yakin hapus post ini?')) return
  try {
    const token = getAccessToken()
    if( !token) return
    await axios.delete(`/forum/posts/${post.value.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    alert('Post berhasil dihapus.')
    window.location.href = '/posts'
  } catch (err) {
    console.error(err)
    alert('Gagal menghapus post.')
  }
}

onMounted(fetchPost)
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.action-buttons button,
.action-buttons a {
  display: inline-block;
  text-decoration: none;
  border: none;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.2;
}

.edit-button {
  background: #003366;
  color: #fff;
  transition: background 0.2s;
}

.edit-button:hover {
  background: #001f4d;
}

.reply-toggle {
  background: #003366;
  color: #fff;
}

.reply-toggle:hover {
  background: #001f4d;
}

.delete-button {
  background: #cc0000;
  color: #fff;
}

.delete-button:hover {
  background: #a30000;
}

.back-button {
  display: inline-block;
  margin-bottom: 1rem;
  background: #cc0000;
  color: #ffffff;
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.back-button:hover {
  background: #a30000;
}

.post-detail-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  color: #003366;
  margin-bottom: 0.5rem;
}

.content {
  margin-bottom: 1rem;
  color: #333;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 2rem;
  color: #003366;
}

.no-replies {
  color: #666;
  font-style: italic;
}

.loading {
  text-align: center;
  color: #003366;
  margin-top: 2rem;
}
</style>
