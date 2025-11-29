import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"

import "./style.css"
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BE_POST_URL

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount("#app")
