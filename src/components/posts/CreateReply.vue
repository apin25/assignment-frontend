<template>
  <div class="reply-form">
    <h4 v-if="!hideHeading">Buat Balasan</h4>
    <form @submit.prevent="submitReply">
      <input v-model="reply.title" type="text" placeholder="Judul Balasan" />
      <textarea v-model="reply.content" placeholder="Isi Balasan"></textarea>
      <button type="submit">Kirim Balasan</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import axios from 'axios'

const props = defineProps({
  parentId: { type: String, required: true },
  hideHeading: { type: Boolean, default: false },
})
const emit = defineEmits(['reply-created'])

const reply = ref({
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

const submitReply = async () => {
  if (!reply.value.title || !reply.value.content) {
    alert('Semua field wajib diisi.')
    return
  }

  try {
    const token = getAccessToken()
    if (!token) return
    await axios.post('/forum/posts', {
      ...reply.value,
      postParent: props.parentId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    reply.value = { title: '', content: '' }
    emit('reply-created')
  } catch (err) {
    console.error(err)
    alert('Gagal mengirim balasan.')
  }
}
</script>

<style scoped>
.reply-form {
  margin-top: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #ddd;
}

.reply-form input,
.reply-form textarea {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #003366;
  border-radius: 4px;
}

.reply-form button {
  background: #003366;
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.reply-form button:hover {
  background: #001f4d;
}
</style>
