<template>
  <div class="catalog-browser">
    <div class="navigation-bar">
      <button v-if="!showingCatalog" 
              @click="goBack" 
              class="back-button">
        ← Back to Catalog
      </button>
      <div v-if="showingCatalog && paginationLinks.length > 0" class="pagination-links">
        <button 
          v-for="link in paginationLinks" 
          :key="link.rel"
          @click="loadPage(link.href)"
          class="pagination-button">
          {{ formatLinkRel(link.rel) }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Catalog Overview -->
      <div v-if="showingCatalog" class="catalog-overview">
        <div class="catalog-header">
          <h1>{{ catalog.title }}</h1>
          <p class="description">{{ catalog.description }}</p>
          
          <div class="keywords">
            <h3>Keywords</h3>
            <div class="keyword-list">
              <span v-for="keyword in catalog.keywords" 
                    :key="keyword" 
                    class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>

        <div class="datasets-grid">
          <div v-for="dataset in datasets" 
               :key="dataset.id" 
               class="dataset-card"
               @click="viewDataset(dataset)">
            <h3>{{ dataset.properties.title }}</h3>
            <p class="dataset-description">{{ dataset.properties.description }}</p>
            <div class="dataset-meta">
              <div class="time-range" v-if="dataset.properties.temporal?.interval">
                {{ formatDate(dataset.properties.temporal.interval[0]) }} - {{ formatDate(dataset.properties.temporal.interval[1]) }}
              </div>
              <div class="dataset-type">{{ dataset.type || 'Dataset' }}</div>
            </div>
          </div>
        </div>
        <div class="pagination-info">
          Showing {{ numberReturned }} of {{ numberMatched }} datasets
        </div>
      </div>

      <!-- Dataset View -->
      <dataset-viewer
        v-else
        :dataset="selectedDataset"
        @navigate="handleNavigate"
        @wms-selected="handleWmsSelected"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import DatasetViewer from '../components/DatasetViewer.vue'
import { fetchCollection, fetchItems, fetchJson, isEmotionalUrl } from '../services/api'

export default {
  name: 'CatalogBrowser',
  components: {
    DatasetViewer
  },
  setup() {
    const loading = ref(true)
    const error = ref(null)
    const catalog = ref(null)
    const datasets = ref([])
    const selectedDataset = ref(null)
    const numberMatched = ref(0)
    const numberReturned = ref(0)
    const paginationLinks = ref([])

    const showingCatalog = computed(() => selectedDataset.value === null)

    const loadCatalog = async () => {
      loading.value = true
      error.value = null
      try {
        // Load catalog metadata
        catalog.value = await fetchCollection()
        
        // Load first page of datasets
        await loadPage()
      } catch (e) {
        error.value = `Error loading catalog: ${e.message}`
      } finally {
        loading.value = false
      }
    }

    const loadPage = async (url = null) => {
      loading.value = true
      error.value = null
      try {
        const response = await fetchItems(url)
        datasets.value = response.features
        paginationLinks.value = response.links.filter(link => 
          ['next', 'prev', 'first', 'last'].includes(link.rel)
        )
        numberMatched.value = response.numberMatched
        numberReturned.value = response.numberReturned
      } catch (e) {
        error.value = `Error loading datasets: ${e.message}`
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }

    const formatLinkRel = (rel) => {
      const relMap = {
        'next': 'Next →',
        'prev': '← Previous',
        'first': '« First',
        'last': 'Last »',
        'self': 'Current'
      }
      return relMap[rel] || rel
    }

    const viewDataset = (dataset) => {
      selectedDataset.value = dataset
    }

    const handleNavigate = async (url) => {
      if (!isEmotionalUrl(url)) return
      
      loading.value = true
      try {
        const data = await fetchJson(url)
        if (data.type === 'Feature') {
          selectedDataset.value = data
        }
      } catch (e) {
        error.value = `Error navigating to ${url}: ${e.message}`
      } finally {
        loading.value = false
      }
    }

    const handleWmsSelected = (wmsLink) => {
      // Handle WMS layer visualization
      console.log('WMS selected:', wmsLink)
      // TODO: Implement WMS layer handling
    }

    const goBack = () => {
      selectedDataset.value = null
    }

    // Initialize
    loadCatalog()

    return {
      loading,
      error,
      catalog,
      datasets,
      selectedDataset,
      showingCatalog,
      formatDate,
      viewDataset,
      handleNavigate,
      handleWmsSelected,
      goBack,
      paginationLinks,
      numberMatched,
      numberReturned,
      formatLinkRel,
      loadPage
    }
  }
}
</script>

<style scoped>
.catalog-browser {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.navigation-bar {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  min-width: 120px;
  text-align: center;
}

.back-button:hover {
  background-color: #1e3c6a;
}

.pagination-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.catalog-header {
  margin-bottom: 2rem;
  text-align: center;
}

.catalog-header h1 {
  color: var(--primary-color);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.description {
  color: var(--text-color);
  max-width: 800px;
  margin: 0 auto;
}

.keywords {
  margin-top: 1.5rem;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.keyword-tag {
  background-color: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.datasets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.dataset-card {
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--secondary-color);
}

.dataset-card h3 {
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.dataset-description {
  color: var(--text-color);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dataset-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-color);
  border-top: 1px solid var(--border-color);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.time-range {
  color: var(--secondary-color);
  font-weight: 500;
}

.dataset-type {
  background-color: var(--accent-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  color: var(--text-color);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #dc3545;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .catalog-browser {
    padding: 1rem;
  }

  .navigation-bar {
    flex-wrap: wrap;
  }

  .datasets-grid {
    grid-template-columns: 1fr;
  }

  .catalog-header h1 {
    font-size: 1.5rem;
  }
}
</style>
