import axios from 'axios'

const BASE_URL = 'https://emotional.byteroad.net'

export const ensureJsonFormat = (url) => {
  const urlObj = new URL(url)
  urlObj.searchParams.set('f', 'json')
  return urlObj.toString()
}

export const isEmotionalUrl = (url) => {
  return url.startsWith(`${BASE_URL}/collections`)
}

export const fetchJson = async (url) => {
  try {
    const jsonUrl = ensureJsonFormat(url)
    const response = await axios.get(jsonUrl)
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export const fetchCollection = async () => {
  try {
    const response = await fetchJson(`${BASE_URL}/collections/ec_catalog`)
    return response
  } catch (error) {
    console.error('Error fetching collection:', error)
    throw error
  }
}

export const fetchItems = async (url = null, limit = 10, offset = 0) => {
  try {
    const baseUrl = url || `${BASE_URL}/collections/ec_catalog/items`
    const urlObj = new URL(baseUrl)
    if (!url) {
      // Only set limit and offset if we're using the base URL
      urlObj.searchParams.set('limit', limit)
      urlObj.searchParams.set('offset', offset)
    }
    const response = await fetchJson(urlObj.toString())
    return {
      features: response.features || [],
      links: response.links || [],
      numberMatched: response.numberMatched,
      numberReturned: response.numberReturned,
      offset: offset,
      limit: limit,
      hasNext: response.numberMatched > offset + limit
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    throw error
  }
}

export const fetchRecord = async (recordId) => {
  try {
    const response = await fetchJson(`${BASE_URL}/collections/ec_catalog/items/${recordId}`)
    return response
  } catch (error) {
    console.error('Error fetching record:', error)
    throw error
  }
}

export const fetchFeatures = async (collectionId) => {
  try {
    const response = await fetchJson(`${BASE_URL}/collections/${collectionId}/items`)
    return response
  } catch (error) {
    console.error('Error fetching features:', error)
    throw error
  }
}

export const fetchTiles = async (collectionId) => {
  try {
    const response = await fetchJson(`${BASE_URL}/collections/${collectionId}/tiles`)
    return response
  } catch (error) {
    console.error('Error fetching tiles:', error)
    throw error
  }
}
