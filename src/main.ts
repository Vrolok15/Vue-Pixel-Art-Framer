import './assets/main.css'

import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import App from './App.vue'

const app: VueApp = createApp(App)
app.mount('#app')
