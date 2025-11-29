<template>
  <div class="inbox-lecturer-container">
    <h1>Inbox Feedback Dosen</h1>

    <div class="lecturer-actions">
      <button @click="downloadCsv" class="btn secondary">Unduh Semua Feedback (CSV)</button>
    </div>

    <div v-if="loading" class="status">Memuat feedback...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else>
      <div v-if="feedbacks.length === 0" class="status empty">Tidak ada feedback untuk Anda.</div>

      <div v-else class="feedback-list">
        <div
          v-for="feedback in feedbacks"
          :key="feedback.id"
          class="feedback-card"
        >
          <div class="feedback-header">
            <h3>{{ feedback.courseId }}</h3>
            <span class="created-at">{{ formatDate(feedback.createdAt) }}</span>
          </div>

          <div class="scores">
            <div><strong>Clarity:</strong> {{ feedback.clarityScore }}</div>
            <div><strong>Engagement:</strong> {{ feedback.engagementScore }}</div>
            <div><strong>Overall:</strong> {{ feedback.overallScore }}</div>
          </div>

          <div class="feedback-body">
            <p><strong>Komentar:</strong> {{ feedback.data }}</p>
            <p><strong>Balasan:</strong> {{ feedback.reply || 'Belum dibalas' }}</p>
          </div>

          <div class="card-actions">
            <button @click="goDetail(feedback.id)" class="btn primary">
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useAuth } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Feedback } from '@/types'

const { user } = useAuth()
const router = useRouter()

const feedbacks = ref<Feedback[]>([])
const loading = ref(false)
const error = ref('')

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
  if (!token || !user.value) return

  if(user.value.role === 'STUDENT') {
    window.location.href = '/feedback'
    return
  } else if (user.value.role !== 'LECTURER') {
    window.location.href = '/'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`/feedback/lecturer/${user.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    feedbacks.value = response.data.data
  } catch (e: any) {
    console.error(e)
    error.value = e.response?.data.message || 'Gagal memuat feedback.'
  } finally {
    loading.value = false
  }
}

const goDetail = (id: string) => {
  router.push(`/feedback/${id}`)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const downloadCsv = async () => {
  const token = getAccessToken()
  const lecturerId = user.value?.id
  if (!token || !lecturerId) return

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BE_POST_URL}/feedback/export/csv?lecturerId=${lecturerId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'feedbacks.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    alert('Gagal mengunduh CSV.')
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.inbox-lecturer-container {
  max-width: 960px;
  margin: 3rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.inbox-lecturer-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #003366;
}

.lecturer-actions {
  text-align: right;
  margin-bottom: 1.5rem;
}

.feedback-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.feedback-card {
  border: 1px solid #e0e0e0;
  border-left: 6px solid #007bff;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9f9f9;
  transition: 0.2s ease;
}

.feedback-card:hover {
  background: #f5faff;
  border-left-color: #0056b3;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.feedback-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #003366;
}

.feedback-header .created-at {
  font-size: 0.85rem;
  color: #666;
}

.scores {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.feedback-body p {
  margin: 0.3rem 0;
  line-height: 1.4;
  color: #333;
}

.card-actions {
  margin-top: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.btn.primary {
  background: #007bff;
  color: #fff;
}

.btn.primary:hover {
  background: #0056b3;
}

.btn.secondary {
  background: #e0e0e0;
  color: #333;
}

.btn.secondary:hover {
  background: #d0d0d0;
}

.status {
  text-align: center;
  margin: 2rem 0;
  color: #555;
}

.status.error {
  color: red;
}

.status.empty {
  color: #777;
  font-style: italic;
}
</style>
