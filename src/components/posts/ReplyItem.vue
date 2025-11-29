<template>
  <div class="reply-item">
    <h3>{{ reply.title }}</h3>
    <p>{{ reply.content }}</p>
    <p><strong>Author:</strong> {{ reply.author }}</p>
    <p>
      <small>Created: {{ formatDate(reply.createdAt) }}</small>
    </p>

    <div class="reply-actions">
      <router-link :to="`/posts/${reply.id}/edit`" class="edit-button" v-if="user?.username === reply.author">Edit Reply</router-link>
      <button @click="showReplyForm = !showReplyForm" class="reply-toggle">
        {{ showReplyForm ? 'Close Reply' : 'Reply' }}
      </button>
      <button @click="deleteReply" class="delete-button" v-if="user?.username === reply.author">Delete Reply</button>
    </div>

    <CreateReply v-if="showReplyForm" :parent-id="reply.id" @reply-created="handleReplyCreated" />

    <div class="nested-replies" v-if="reply.replies && reply.replies.length > 0">
      <ReplyItem
        v-for="nested in reply.replies"
        :key="nested.id"
        :reply="nested"
        @refresh="emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import CreateReply from './CreateReply.vue'
import { useAuth } from '@/stores/auth'

const { user } = useAuth()
if(user === null) {
  window.location.href = '/'
}

interface Reply {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  replies?: Reply[]
}

const props = defineProps<{ reply: Reply }>()
const emit = defineEmits(['refresh'])

const showReplyForm = ref(false)

const handleReplyCreated = () => {
  emit('refresh')
  showReplyForm.value = false
}

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/'
    return null
  }
  return token
}

const deleteReply = async () => {
  if (!confirm('Yakin hapus reply ini?')) return
  try {
    const token = getAccessToken()
    if (!token) return
    await axios.delete(`/forum/posts/${props.reply.id}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    alert('Reply berhasil dihapus.')
    emit('refresh')
  } catch (err) {
    console.error(err)
    alert('Gagal menghapus reply.')
  }
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<style scoped>
.reply-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  background: #fefefe;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reply-item h3 {
  margin: 0 0 0.5rem;
  color: #003366;
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-button {
  background: #003366;
  color: #fff;
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.edit-button:hover {
  background: #001f4d;
}

.reply-toggle {
  background: #003366;
  color: #fff;
  border: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.reply-toggle:hover {
  background: #001f4d;
}

.delete-button {
  background: #cc0000;
  color: #fff;
  border: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.delete-button:hover {
  background: #a30000;
}

.nested-replies {
  margin-left: 2rem;
  margin-top: 1rem;
  border-left: 2px solid #00336633;
  padding-left: 1rem;
}
</style>