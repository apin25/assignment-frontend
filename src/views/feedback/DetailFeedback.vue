<template>
  <div class="feedback-detail-container" v-if="feedback">
    <h1>Detail Feedback</h1>

    <div class="feedback-info">
      <div class="info-group">
        <p><strong>Course:</strong> {{ feedback.courseId }}</p>
        <p><strong>Dosen:</strong> {{ lecturerName || feedback.lecturer }}</p>
        <p><strong>Mahasiswa:</strong> {{ feedback.anonymous ? "Anonymous" : (studentName || feedback.createdBy) }}</p>
      </div>

      <div class="score-group">
        <p><strong>Clarity:</strong> {{ feedback.clarityScore }}</p>
        <p><strong>Engagement:</strong> {{ feedback.engagementScore }}</p>
        <p><strong>Overall:</strong> {{ feedback.overallScore }}</p>
      </div>

      <div class="comment-group">
        <p><strong>Komentar:</strong></p>
        <div class="comment-box">{{ feedback.data }}</div>
      </div>

      <div class="reply-group">
        <p><strong>Reply:</strong> {{ feedback.reply || 'Belum ada' }}</p>
      </div>

      <div class="time-group">
        <p><strong>Dibuat:</strong> {{ formatDate(feedback.createdAt) }}</p>
        <p><strong>Read At:</strong> {{ feedback.readAt ? formatDate(feedback.readAt) : 'Belum dibaca' }}</p>
        <p><strong>Replied At:</strong> {{ feedback.repliedAt ? formatDate(feedback.repliedAt) : 'Belum dibalas' }}</p>
      </div>
    </div>

    <div class="actions">
      <div v-if="isStudent" class="student-actions">
        <button @click="goEdit" class="btn" v-if="!feedback.readAt">Edit</button>
        <button @click="deleteFeedback" class="btn danger">Hapus</button>
      </div>

      <div v-if="isLecturer" class="lecturer-actions">
        <textarea
          v-model="replyContent"
          placeholder="Tulis balasan di sini"
          class="reply-textarea"
        ></textarea>
        <button @click="submitReply" class="btn primary">Kirim Balasan</button>
        <button @click="downloadCsv" class="btn secondary">Unduh Semua Feedback CSV</button>
      </div>

      <div class="back-action">
        <button @click="goBack" class="btn">⬅ Kembali ke Daftar Feedback</button>
      </div>
    </div>
  </div>

  <div v-else-if="loading">Memuat detail feedback...</div>
  <div v-else-if="error">{{ error }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '@/stores/auth'
import type { Feedback } from '@/types'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const id = route.params.id as string

const feedback = ref<Feedback | null>(null)
const lecturerName = ref('')
const studentName = ref('')
const loading = ref(false)
const error = ref('')
const replyContent = ref('')

const isStudent = user.value?.role === 'STUDENT'
const isLecturer = user.value?.role === 'LECTURER'

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/login'
    return null
  }
  return token
}

const fetchLecturerName = async (lecturerId: string) => {
  const token = getAccessToken()
  if (!token) return

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BE_AUTH_URL}/api/users/${lecturerId}/username`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    lecturerName.value = response.data.data.username || '-'
  } catch (e: any) {
    console.error('Gagal ambil nama dosen:', lecturerId)
    lecturerName.value = '-'
  }
}

const fetchStudentName = async (createdBy: string) => {
  const token = getAccessToken()
  if (!token) return

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BE_AUTH_URL}/api/users/${createdBy}/username`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    studentName.value = response.data.data.username || '-'
  } catch (e: any) {
    console.error('Gagal ambil nama mahasiswa:', createdBy)
    studentName.value = '-'
  }
}

const fetchFeedback = async () => {
  const token = getAccessToken()
  if (!token) return

  loading.value = true
  error.value = ''
  try {
    const fetching = await axios.get(`/feedback/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    feedback.value = fetching.data.data

    if (isStudent && user.value?.id !== feedback.value?.createdBy) {
      alert('Anda tidak memiliki akses ke feedback ini.')
      router.push('/feedback')
    } else if (isLecturer && user.value?.id !== feedback.value?.lecturer) {
      alert('Anda tidak memiliki akses ke feedback ini.')
      router.push('/feedback/inbox')
    } else if (feedback.value) {
      await fetchLecturerName(feedback.value.lecturer)
      await fetchStudentName(feedback.value.createdBy)
    }

    if (feedback.value?.readAt === null && isLecturer) {
      await axios.put(`/feedback/read/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
    }

  } catch (e: any) {
    error.value = e.response?.data.message || 'Gagal mengambil detail feedback.'
    alert(error.value)
    setTimeout(() => {
        if(isStudent) {
          router.push('/feedback')
        } else {
          router.push('/feedback/inbox')
        }
    }, 500)
  } finally {
    loading.value = false
  }
}

const submitReply = async () => {
  const token = getAccessToken()
  if (!token || !replyContent.value) return

  try {
    await axios.put(`/feedback/reply/${id}`, null, {
      params: { content: replyContent.value },
      headers: { Authorization: `Bearer ${token}` },
    })
    alert('Berhasil membalas.')
    await fetchFeedback()
  } catch {
    alert('Gagal membalas.')
  }
}

const deleteFeedback = async () => {
  const token = getAccessToken()
  if (!token) return

  if (!confirm('Yakin mau hapus feedback ini?')) return

  try {
    await axios.delete(`/feedback/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    alert('Berhasil dihapus.')
    router.push('/feedback')
  } catch {
    alert('Gagal hapus feedback.')
  }
}

const downloadCsv = async () => {
  const token = getAccessToken()
  if (!token || !feedback.value) return

  const lecturerId = feedback.value.lecturer

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

const goEdit = () => {
  router.push(`/feedback/${id}/edit`)
}

const goBack = () => {
    if(user.value?.role === 'STUDENT') {
      router.push('/feedback')
    } else {
      router.push('/feedback/inbox')
    }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
.feedback-detail-container {
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.feedback-detail-container h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.feedback-info {
  display: grid;
  gap: 1rem;
}

.info-group,
.score-group,
.comment-group,
.reply-group,
.time-group {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.comment-box {
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 6px;
  white-space: pre-wrap;
}

textarea.reply-textarea {
  width: 100%;
  min-height: 120px;
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.actions {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #ccc;
  transition: 0.2s ease;
}

.btn:hover {
  opacity: 0.9;
}

.btn.primary {
  background: #007bff;
  color: #fff;
}

.btn.secondary {
  background: #28a745;
  color: #fff;
}

.btn.danger {
  background: #dc3545;
  color: #fff;
}

.student-actions,
.lecturer-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back-action {
  margin-top: 1rem;
}
</style>
