import { createApp } from 'vue'
import { createStore } from 'vuex'
import router from './router'
import App from './App.vue'
import './styles/main.css'

// Fix Leaflet icon issue
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
})

// Create Vuex store
const store = createStore({
  state() {
    return {
      // Initial state
    }
  },
  mutations: {
    // Mutations
  },
  actions: {
    // Actions
  }
})

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
