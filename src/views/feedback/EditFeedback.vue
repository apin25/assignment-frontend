<template>
  <div class="form-container" v-if="loaded">
    <h1>Edit Feedback</h1>

    <form @submit.prevent="updateFeedback">
      <div class="form-group">
        <label>Course ID</label>
        <input type="text" v-model="courseId" readonly />
      </div>

      <div class="form-group">
        <label>Lecturer Username</label>
        <input type="text" v-model="lecturerUsername" readonly />
      </div>

      <div class="form-group">
        <label>Clarity Score</label>
        <div class="radio-group">
          <label v-for="n in 5" :key="'clarity-'+n">
            <input type="radio" :value="n" v-model="clarityScore" required />
            {{ n }}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Engagement Score</label>
        <div class="radio-group">
          <label v-for="n in 5" :key="'engagement-'+n">
            <input type="radio" :value="n" v-model="engagementScore" required />
            {{ n }}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Overall Score</label>
        <div class="radio-group">
          <label v-for="n in 5" :key="'overall-'+n">
            <input type="radio" :value="n" v-model="overallScore" required />
            {{ n }}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Isi Feedback</label>
        <textarea v-model="data" required></textarea>
      </div>

      <div class="form-group checkbox-group">
        <label><input type="checkbox" v-model="isAnonymous" /> Kirim Sebagai Anonim</label>
      </div>

      <button class="btn primary" type="submit">💾 Simpan Perubahan</button>
    </form>
  </div>

  <div v-else>Memuat...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

if (user.value === null) {
  window.location.href = '/'
} else if (user.value.role !== 'STUDENT') {
  window.location.href = '/feedback/inbox'
}

const id = route.params.id as string

const clarityScore = ref(1)
const engagementScore = ref(1)
const overallScore = ref(1)
const data = ref('')
const isAnonymous = ref(false)
const courseId = ref('')
const lecturerId = ref('')
const lecturerUsername = ref('')

const loaded = ref(false)

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/login'
    return null
  }
  return token
}

const authClient = axios.create({
  baseURL: import.meta.env.VITE_BE_AUTH_URL,
})

const fetchFeedback = async () => {
  const token = getAccessToken()
  if (!token) return

    if (user.value?.role === 'LECTURER') {
        window.location.href = '/feedback/inbox'
        return
    } else if (user.value?.role !== 'STUDENT') {
        window.location.href = '/'
        return
    }

  try {
    const response = await axios.get(`/feedback/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const fb = response.data.data

    if (!fb) {
      alert('Feedback tidak ditemukan.')
      router.push('/feedback')
      return
    } else if (user.value?.role !== 'STUDENT' || user.value?.id !== fb.createdBy || fb.readAt !== null) {
      alert('Akses ditolak.')
      router.push('/feedback')
      return
    }

    clarityScore.value = fb.clarityScore
    engagementScore.value = fb.engagementScore
    overallScore.value = fb.overallScore
    data.value = fb.data
    isAnonymous.value = fb.anonymous
    courseId.value = fb.courseId
    lecturerId.value = fb.lecturer

    const res = await authClient.get(`/api/users/${fb.lecturer}/username`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    lecturerUsername.value = res.data.data.username

    loaded.value = true
  } catch (e) {
    alert('Gagal memuat feedback.')
    router.push('/feedback')
  }
}

const updateFeedback = async () => {
  const token = getAccessToken()
  if (!token) return

  try {
    await axios.put(
      `/feedback/${id}`,
      {
        clarityScore: clarityScore.value,
        engagementScore: engagementScore.value,
        overallScore: overallScore.value,
        data: data.value,
        anonymous: isAnonymous.value,
        lecturer: lecturerId.value,
        courseId: courseId.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    alert('Feedback berhasil diperbarui.')
    router.push('/feedback')
  } catch (e: any) {
    alert(e.response?.data?.message || 'Gagal memperbarui feedback.')
  }
}

onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-group input[type="radio"] {
  margin-right: 0.3rem;
}

.checkbox-group {
  margin-top: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

input[readonly] {
  background: #f8f8f8;
  color: #666;
}

textarea {
  min-height: 120px;
}

.btn.primary {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
