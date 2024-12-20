/**
 * API Service for eMOTIONAL Cities Metadata Catalog
 * Handles all interactions with the OGC API Records endpoints
 */

import axios from 'axios'

const BASE_URL = 'https://emotional.byteroad.net'

/**
 * Ensures a URL returns JSON format by adding the 'f=json' parameter
 * @param {string} url - The URL to modify
 * @returns {string} URL with JSON format parameter
 */
export const ensureJsonFormat = (url) => {
  const urlObj = new URL(url)
  urlObj.searchParams.set('f', 'json')
  return urlObj.toString()
}

/**
 * Checks if a URL is from the eMOTIONAL Cities API
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL is from eMOTIONAL Cities
 */
export const isEmotionalUrl = (url) => {
  return url.startsWith(`${BASE_URL}/collections`)
}

/**
 * Generic JSON fetch with error handling
 * @param {string} url - The URL to fetch from
 * @returns {Promise<Object>} The JSON response
 */
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

/**
 * Fetches the catalog collection metadata
 * @returns {Promise<Object>} The catalog collection metadata
 */
export const fetchCollection = async () => {
  try {
    return await fetchJson(`${BASE_URL}/collections/ec_catalog`)
  } catch (error) {
    console.error('Error fetching collection:', error)
    throw error
  }
}

/**
 * Fetches items from the catalog with pagination
 * @param {string|null} url - Optional URL for pagination
 * @param {number} limit - Number of items per page
 * @param {number} offset - Starting offset for pagination
 * @returns {Promise<Object>} Paginated items and metadata
 */
export const fetchItems = async (url = null, limit = 12, offset = 0) => {
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
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    throw error
  }
}
