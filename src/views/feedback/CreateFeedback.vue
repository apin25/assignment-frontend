<template>
  <div class="form-container">
    <h1>Buat Feedback Baru</h1>

    <form @submit.prevent="createFeedback">
      <div class="form-group">
        <label>Course ID</label>
        <input v-model="courseId" placeholder="course-001" required />
      </div>

      <div class="form-group">
        <label>Lecturer</label>
        <select v-model="lecturerId" required>
          <option disabled value="">Pilih Dosen</option>
          <option v-for="lecturer in lecturers" :key="lecturer.id" :value="lecturer.id">
            {{ lecturer.username }} - {{ lecturer.name }}
          </option>
        </select>
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
        <textarea v-model="data" placeholder="Tulis feedback Anda..." required></textarea>
      </div>

      <div class="form-group checkbox-group">
        <label><input type="checkbox" v-model="isAnonymous" /> Kirim Sebagai Anonim</label>
      </div>

      <button class="btn primary" type="submit">Kirim Feedback</button>
    </form>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const { user } = useAuth()

if (user.value === null || user.value.role !== 'STUDENT') {
  window.location.href = '/'
}

const courseId = ref('')
const lecturerId = ref('')
const lecturers = ref<{ id: string; username: string; name: string }[]>([])
const clarityScore = ref(1)
const engagementScore = ref(1)
const overallScore = ref(1)
const data = ref('')
const isAnonymous = ref(false)

const getAccessToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    window.location.href = '/login'
    return null
  }
  return token
}

const fetchLecturers = async () => {
  const token = getAccessToken()
  if (!token) return

  try {
    const response = await axios.get(`${import.meta.env.VITE_BE_AUTH_URL}/api/users/lecturers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    lecturers.value = response.data.data || []
  } catch (e) {
    console.error('Gagal fetch lecturer list:', e)
    lecturers.value = []
  }
}

onMounted(() => {
  fetchLecturers()
})

const createFeedback = async () => {
  const token = getAccessToken()
  if (!token) return

  try {
    await axios.post(
      `/feedback/create`,
      {
        courseId: courseId.value,
        lecturer: lecturerId.value,
        clarityScore: clarityScore.value,
        engagementScore: engagementScore.value,
        overallScore: overallScore.value,
        data: data.value,
        anonymous: isAnonymous.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    alert('Feedback berhasil dibuat.')
    router.push('/feedback')
  } catch (e: any) {
    console.error(e)
    alert(e.response?.data?.message || 'Gagal membuat feedback.')
  }
}
</script>


<style scoped>
.form-container {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fefefe;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.4rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #333;
}


input[type="text"],
textarea {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

textarea {
  min-height: 120px;
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

.btn.primary {
  display: block;
  width: 100%;
  padding: 0.8rem 1.5rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s ease;
}

.btn.primary:hover {
  background: #0056b3;
}
</style>
