<template>
  <div class="record-viewer">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="record-container">
      <div class="record-header">
        <h2>{{ record.title || 'No Title' }}</h2>
        <p v-if="record.description" class="description">{{ record.description }}</p>
      </div>

      <div v-if="hasGeometry" class="map-container">
        <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false">
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
          <l-geo-json
            v-if="geoJsonData"
            :geojson="geoJsonData"
            :options="geoJsonOptions"
          ></l-geo-json>
        </l-map>
      </div>

      <div class="metadata-section">
        <h3>Metadata</h3>
        <div v-for="(value, key) in displayableMetadata" :key="key" class="metadata-item">
          <strong>{{ formatKey(key) }}:</strong>
          <span v-if="isLink(value)">
            <a @click.prevent="handleLink(value)" href="#" class="link">{{ value }}</a>
          </span>
          <span v-else>{{ formatValue(value) }}</span>
        </div>
      </div>

      <div v-if="record.links && record.links.length" class="links-section">
        <h3>Links</h3>
        <div v-for="link in record.links" :key="link.href" class="link-item">
          <a @click.prevent="handleLink(link.href)" href="#" class="link">
            {{ link.title || link.href }}
          </a>
          <span v-if="link.type" class="link-type">({{ link.type }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import "leaflet/dist/leaflet.css"
import axios from 'axios'

export default {
  name: 'RecordViewer',
  components: {
    LMap,
    LTileLayer,
    LGeoJson
  },
  props: {
    recordUrl: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const record = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const zoom = ref(2)
    const center = ref([0, 0])
    const geoJsonData = ref(null)

    const geoJsonOptions = {
      style: {
        color: '#2c3e50',
        weight: 2,
        opacity: 0.7
      }
    }

    const hasGeometry = computed(() => {
      return geoJsonData.value !== null
    })

    const displayableMetadata = computed(() => {
      if (!record.value) return {}
      const metadata = { ...record.value }
      // Remove fields that are displayed separately or should be hidden
      delete metadata.links
      delete metadata.geometry
      delete metadata.title
      delete metadata.description
      return metadata
    })

    const formatKey = (key) => {
      return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const formatValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2)
      }
      return value
    }

    const isLink = (value) => {
      if (typeof value !== 'string') return false
      return value.startsWith('http://') || value.startsWith('https://')
    }

    const ensureJsonFormat = (url) => {
      const urlObj = new URL(url)
      urlObj.searchParams.set('f', 'json')
      return urlObj.toString()
    }

    const handleLink = (url) => {
      emit('navigate', ensureJsonFormat(url))
    }

    const loadRecord = async (url) => {
      loading.value = true
      error.value = null
      try {
        const jsonUrl = ensureJsonFormat(url)
        const response = await axios.get(jsonUrl)
        record.value = response.data
        
        // Handle geometry if present
        if (record.value.geometry) {
          geoJsonData.value = {
            type: 'Feature',
            geometry: record.value.geometry,
            properties: {}
          }
          
          // Center map on geometry
          if (record.value.geometry.type === 'Point') {
            center.value = [
              record.value.geometry.coordinates[1],
              record.value.geometry.coordinates[0]
            ]
            zoom.value = 8
          }
        }

        // Transform links to ensure they use JSON format
        if (record.value.links) {
          record.value.links = record.value.links.map(link => ({
            ...link,
            href: ensureJsonFormat(link.href)
          }))
        }
      } catch (e) {
        error.value = `Error loading record: ${e.message}`
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadRecord(props.recordUrl)
    })

    return {
      record,
      loading,
      error,
      zoom,
      center,
      geoJsonData,
      geoJsonOptions,
      hasGeometry,
      displayableMetadata,
      formatKey,
      formatValue,
      isLink,
      handleLink
    }
  }
}
</script>

<style scoped>
.record-viewer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: #dc3545;
}

.record-header {
  margin-bottom: 20px;
}

.description {
  color: #666;
  margin-top: 10px;
}

.map-container {
  height: 400px;
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metadata-section, .links-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.metadata-item {
  margin: 10px 0;
  line-height: 1.5;
}

.link-item {
  margin: 5px 0;
}

.link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.link-type {
  color: #666;
  font-size: 0.9em;
  margin-left: 5px;
}
</style>
