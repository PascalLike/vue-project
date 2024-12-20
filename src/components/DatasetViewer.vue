<template>
  <div class="dataset-viewer">
    <div v-if="loading" class="loading">Loading dataset...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="dataset-container">
      <div class="dataset-header">
        <h2>{{ dataset.properties.title }}</h2>
        <p class="description">{{ dataset.properties.description }}</p>
      </div>

      <div class="metadata-grid">
        <div class="metadata-section">
          <h3>Temporal Coverage</h3>
          <div v-if="dataset.properties.temporal?.interval" class="time-info">
            <div>From: {{ formatDate(dataset.properties.temporal.interval[0]) }}</div>
            <div>To: {{ formatDate(dataset.properties.temporal.interval[1]) }}</div>
            <div v-if="dataset.properties.temporal.resolution">Resolution: {{ dataset.properties.temporal.resolution }}</div>
          </div>
        </div>

        <div class="metadata-section">
          <h3>Keywords</h3>
          <div class="keywords">
            <span v-for="keyword in dataset.properties.keywords" 
                  :key="keyword" 
                  class="keyword-tag">
              {{ keyword }}
            </span>
          </div>
        </div>

        <div class="metadata-section">
          <h3>Themes</h3>
          <div v-for="theme in dataset.properties.themes" :key="theme.scheme" class="theme">
            <div v-for="concept in theme.concepts" :key="concept.id">
              {{ concept.id }}
            </div>
          </div>
        </div>
      </div>

      <div class="map-section">
        <h3>Geographic Coverage</h3>
        <div class="map-container">
          <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>
            <l-geo-json
              :geojson="dataset"
              :options="geoJsonOptions"
            ></l-geo-json>
          </l-map>
        </div>
      </div>

      <div class="services-section">
        <h3>Available Services</h3>
        <div class="services-grid">
          <!-- Direct Downloads -->
          <div class="service-group">
            <h4>Direct Downloads</h4>
            <div class="service-links">
              <a v-for="link in downloadLinks" 
                 :key="link.href"
                 :href="link.href"
                 target="_blank"
                 class="service-link">
                {{ link.title }}
              </a>
            </div>
          </div>

          <!-- OGC Services -->
          <div class="service-group">
            <h4>OGC Services</h4>
            <div class="service-links">
              <a v-for="link in ogcLinks" 
                 :key="link.href"
                 :href="link.href"
                 @click.prevent="handleOgcLink(link)"
                 class="service-link">
                {{ link.title }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import "leaflet/dist/leaflet.css"
import { fetchJson, isEmotionalUrl } from '../services/api'

export default {
  name: 'DatasetViewer',
  components: {
    LMap,
    LTileLayer,
    LGeoJson
  },
  props: {
    dataset: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const loading = ref(false)
    const error = ref(null)
    const zoom = ref(11)
    const center = computed(() => {
      if (props.dataset?.geometry?.coordinates?.[0]?.length >= 4) {
        const coords = props.dataset.geometry.coordinates[0]
        const lats = coords.map(c => c[1])
        const lngs = coords.map(c => c[0])
        return [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2
        ]
      }
      return [51.5074, -0.1278] // Default to London center
    })

    const geoJsonOptions = {
      style: {
        color: '#2c3e50',
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3
      }
    }

    const downloadLinks = computed(() => {
      return props.dataset.links.filter(link => 
        !link.templated && 
        !isEmotionalUrl(link.href) &&
        ['application/geo+json', 'application/vnd.apache.parquet', 'application/x-sqlite3'].includes(link.type)
      )
    })

    const ogcLinks = computed(() => {
      return props.dataset.links.filter(link => 
        isEmotionalUrl(link.href) || 
        link.href.includes('geoserver/ows')
      )
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const handleOgcLink = async (link) => {
      if (link.templated) {
        // Handle WMS link
        emit('wms-selected', link)
      } else {
        emit('navigate', link.href)
      }
    }

    return {
      loading,
      error,
      zoom,
      center,
      geoJsonOptions,
      downloadLinks,
      ogcLinks,
      formatDate,
      handleOgcLink
    }
  }
}
</script>

<style scoped>
.dataset-viewer {
  padding: 20px;
}

.dataset-header {
  margin-bottom: 30px;
}

.description {
  color: #666;
  margin-top: 10px;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metadata-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.map-section {
  margin: 30px 0;
}

.map-container {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.services-section {
  margin-top: 30px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.service-group {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.service-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-link {
  color: #007bff;
  text-decoration: none;
  padding: 8px;
  background: white;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.service-link:hover {
  background: #e9ecef;
}

.time-info {
  display: grid;
  gap: 8px;
}

.theme {
  margin: 8px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: #dc3545;
}
</style>
