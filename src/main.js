/**
 * Main application entry point
 * Initializes Vue application with router and global styles
 */

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
