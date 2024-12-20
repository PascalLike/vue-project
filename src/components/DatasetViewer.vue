<template>
  <div class="dataset-viewer">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else class="dataset-content">
      <!-- Dataset Header -->
      <div class="dataset-header">
        <h2>{{ dataset.properties.title }}</h2>
        <p class="description">{{ dataset.properties.description }}</p>
      </div>

      <!-- Map Section -->
      <div class="map-section" v-if="dataset.geometry">
        <h3>Geographic Coverage</h3>
        <div class="map-container">
          <l-map ref="map" v-model:zoom="zoom" :center="center" style="height: 100%">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
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

      <!-- Dataset Metadata -->
      <div class="metadata-section">
        <h3>Metadata</h3>
        <div class="metadata-grid">
          <!-- Time Range -->
          <div class="metadata-item" v-if="dataset.properties.temporal?.interval">
            <h4>Time Range</h4>
            <p>{{ formatDate(dataset.properties.temporal.interval[0]) }} - {{ formatDate(dataset.properties.temporal.interval[1]) }}</p>
          </div>

          <!-- Keywords -->
          <div class="metadata-item" v-if="keywords.length">
            <h4>Keywords</h4>
            <div class="keywords-list">
              <span v-for="keyword in keywords" 
                    :key="keyword" 
                    class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>

          <!-- Themes -->
          <div class="metadata-item" v-if="themes.length">
            <h4>Themes</h4>
            <div class="themes-list">
              <span v-for="theme in themes" 
                    :key="theme" 
                    class="theme-tag">
                {{ theme }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Services -->
      <div class="services-section">
        <h3>Available Services</h3>
        <div class="services-grid">
          <!-- Direct Downloads -->
          <div class="service-group" v-if="downloadLinks.length">
            <h4>Direct Downloads</h4>
            <div class="service-links">
              <a v-for="link in downloadLinks" 
                 :key="link.href"
                 :href="link.href"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="service-link">
                {{ link.title || link.rel }}
              </a>
            </div>
          </div>

          <!-- OGC Services -->
          <div class="service-group" v-if="ogcLinks.length">
            <h4>OGC Services</h4>
            <div class="service-links">
              <a v-for="link in ogcLinks" 
                 :key="link.href"
                 :href="link.href"
                 @click.prevent="handleOgcLink(link)"
                 class="service-link">
                {{ link.title || link.rel }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Links -->
      <div class="links-section" v-if="otherLinks.length">
        <h3>Additional Links</h3>
        <div class="links-list">
          <div v-for="link in otherLinks" :key="link.href" class="link-item">
            <a :href="link.href" 
               @click.prevent="$emit('navigate', link.href)"
               class="link">
              {{ link.title || link.rel }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Dataset Viewer Component
 * Displays detailed information about a selected dataset including
 * geographic visualization, metadata, and available services
 */
import { ref, computed, onMounted } from 'vue'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import "leaflet/dist/leaflet.css"
import { isEmotionalUrl } from '../services/api'

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

  emits: ['navigate', 'wms-selected'],

  setup(props, { emit }) {
    const error = ref(null)
    const zoom = ref(11)
    const map = ref(null)

    // Fix Leaflet icon issue
    onMounted(() => {
      import('leaflet').then(L => {
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        })
      })
    })

    // Compute map center from dataset geometry
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

    // GeoJSON styling options
    const geoJsonOptions = {
      style: {
        color: 'var(--primary-color)',
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3
      }
    }

    // Process keywords and themes
    const keywords = computed(() => {
      const keywordList = props.dataset.properties?.keywords || []
      return keywordList.filter(keyword => keyword && typeof keyword === 'string')
    })

    const themes = computed(() => {
      const themeList = props.dataset.properties?.themes || []
      return themeList
        .flatMap(theme => {
          if (theme.concepts) {
            return theme.concepts.map(concept => concept.label || concept.id)
          } else if (theme.concept) {
            return [theme.concept]
          }
          return []
        })
        .filter(Boolean)
    })

    // Filter links by type
    const downloadLinks = computed(() => {
      return props.dataset.links?.filter(link => 
        !link.templated && 
        !isEmotionalUrl(link.href) &&
        ['application/geo+json', 'application/vnd.apache.parquet', 'application/x-sqlite3'].includes(link.type)
      ) || []
    })

    const ogcLinks = computed(() => {
      return props.dataset.links?.filter(link => 
        isEmotionalUrl(link.href) || 
        link.href.includes('geoserver/ows') ||
        (link.title && link.title.startsWith('OGC API Features for'))
      ) || []
    })

    const otherLinks = computed(() => {
      return props.dataset.links?.filter(link => 
        !downloadLinks.value.includes(link) && 
        !ogcLinks.value.includes(link)
      ) || []
    })

    /**
     * Formats a date string to a localized format
     */
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    /**
     * Handles OGC service link clicks
     */
    const handleOgcLink = (link) => {
      if (link.templated) {
        emit('wms-selected', link)
      } else if (link.title?.startsWith('OGC API Features for')) {
        window.open(link.href, '_blank', 'noopener,noreferrer')
      } else {
        emit('navigate', link.href)
      }
    }

    return {
      error,
      zoom,
      map,
      center,
      geoJsonOptions,
      downloadLinks,
      ogcLinks,
      otherLinks,
      keywords,
      themes,
      formatDate,
      handleOgcLink
    }
  }
}
</script>

<style scoped>
.dataset-viewer {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dataset-header {
  margin-bottom: 2rem;
}

.dataset-header h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.description {
  color: var(--text-color);
  line-height: 1.6;
}

.map-section {
  margin: 2rem 0;
}

.map-container {
  height: 400px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.metadata-section {
  margin-top: 2rem;
}

.metadata-section h3,
.services-section h3,
.links-section h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.metadata-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.metadata-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: var(--border-radius-md);
}

.metadata-item h4 {
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.keywords-list,
.themes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag,
.theme-tag {
  background: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.9rem;
}

.services-section {
  margin-top: 2rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
}

.service-group h4 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.service-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-link {
  display: block;
  color: var(--primary-color);
  text-decoration: none;
  padding: 0.75rem;
  background: white;
  border-radius: var(--border-radius-md);
  transition: all 0.2s;
}

.service-link:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.links-section {
  margin-top: 2rem;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-item {
  background: #f8f9fa;
  border-radius: var(--border-radius-md);
  transition: background-color 0.2s;
}

.link-item:hover {
  background: #e9ecef;
}

.link {
  display: block;
  color: var(--primary-color);
  text-decoration: none;
  padding: 1rem;
}

.error {
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .dataset-viewer {
    padding: 1rem;
  }

  .metadata-grid,
  .services-grid {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 300px;
  }
}
</style>