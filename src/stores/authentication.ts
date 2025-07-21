import { defineStore } from 'pinia'
import type {
  LoginRequestInterface,
  LoginResponseInterface,
} from '@/interfaces/login.interface'
import type { Register } from '@/interfaces/register.interface'
import Cookies from 'js-cookie'
import { useToast } from 'vue-toastification'
import router from '@/router'

export const useAuthenticationStore = defineStore('auth', {
  state: () => ({
    user: null as LoginResponseInterface['user'] | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async login(body: LoginRequestInterface) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data: LoginResponseInterface = await response.json()
        this.user = data.user
        this.token = data.token

        Cookies.set('token', data.token)

        useToast().success('Login berhasil!')
        router.push('/assignments')
      } catch (err) {
        this.error = `Login gagal: ${(err as Error).message}`
        useToast().error(this.error)
      } finally {
        this.loading = false
      }
    },

    async register(body: Register) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        useToast().success('Register berhasil! Silakan login.')
        router.push('/') 
      } catch (err) {
        this.error = `Register gagal: ${(err as Error).message}`
        useToast().error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchUser() {
      const token = Cookies.get('token')
      if (!token) return

      this.loading = true
      this.error = null

      try {
        const response = await fetch('http://localhost:8080/api/auth/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        this.user = data.body 
      } catch (err) {
        this.error = `Gagal mengambil user: ${(err as Error).message}`
        Cookies.remove('token')
        this.user = null
        this.token = null
        router.push('/')
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.token = null
      Cookies.remove('token')
      router.push('/')
    },
  },
})
