<template>
  <div class="feedback-container">
    <h1>Feedback Saya</h1>

    <RouterLink to="/feedback/create" class="btn primary create-button">
      Buat Feedback Baru
    </RouterLink>

    <div v-if="loading" class="loading">Memuat feedback...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="feedbacks.length > 0" class="feedback-list">
      <RouterLink
        v-for="feedback in feedbacks"
        :key="feedback.id"
        :to="`/feedback/${feedback.id}`"
        class="feedback-card"
      >
        <h2>{{ feedback.courseId }} - {{ lecturerUsernames[feedback.lecturer] || '...' }}</h2>
        <p class="content">
          {{ feedback.data.length > 100 ? feedback.data.slice(0, 100) + '...' : feedback.data }}
        </p>
        <div class="meta">
          <span>Status: <strong>{{ getStatus(feedback) }}</strong></span>
          <span>Dibuat: {{ formatDate(feedback.createdAt) }}</span>
        </div>
      </RouterLink>
    </div>

    <div v-else-if="!loading" class="empty">Belum ada feedback.</div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import type { Feedback } from '@/types'
import { useAuth } from '@/stores/auth'

const { user } = useAuth()
if (user === null || user.value === null) {
  window.location.href = '/login'
} else if (user.value.role === 'LECTURER') {
  window.location.href = '/feedback/inbox'
} else if (user.value.role !== 'STUDENT') {
  window.location.href = '/'
}

const feedbacks = ref<Feedback[]>([])
const lecturerUsernames = ref<Record<string, string>>({})
const loading = ref(false)
const error = ref('')

const authClient = axios.create({
  baseURL: import.meta.env.VITE_BE_AUTH_URL,
})

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/login'
    return null
  }
  return token
}

const fetchFeedbacks = async () => {
  const token = getAccessToken()
  if (!token) return

  if (user === null || user.value === null) {
    window.location.href = '/login'
  } else if (user.value.role === 'LECTURER') {
    window.location.href = '/feedback/inbox'
  } else if (user.value.role !== 'STUDENT') {
    window.location.href = '/'
  }

  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('/feedback/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
    feedbacks.value = response.data.data

    const lecturerIds = Array.from(new Set(feedbacks.value.map(f => f.lecturer)))
    await Promise.all(
      lecturerIds.map(async (id) => {
        try {
          const res = await authClient.get(`/api/users/${id}/username`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          lecturerUsernames.value[id] = res.data.data.username
        } catch (err) {
          console.error('Gagal ambil username untuk:', id)
          lecturerUsernames.value[id] = 'Unknown'
        }
      })
    )
  } catch {
    error.value = 'Gagal mengambil data feedback.'
  } finally {
    loading.value = false
  }
}

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const getStatus = (feedback: Feedback) => {
  if (feedback.hiddenAt) return 'Dihapus'
  if (feedback.repliedAt) return 'Sudah Dibalas'
  if (!feedback.readAt) return 'Belum Dibaca'
  return 'Sudah Dibaca'
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.feedback-container {
  max-width: 1000px;
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

.create-button {
  display: inline-block;
  margin-bottom: 1.5rem;
  text-decoration: none;
  padding: 0.7rem 1.2rem;
  background: #007bff;
  color: #fff;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.create-button:hover {
  background: #0056b3;
}

.feedback-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feedback-card {
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

.feedback-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feedback-card h2 {
  margin: 0 0 0.5rem;
  color: #003366;
  font-size: 1.2rem;
}

.feedback-card .content {
  color: #444;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.feedback-card .meta {
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
