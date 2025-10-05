import { cache } from '../utils/cache.js'

interface VegetationData {
  ndvi: number
  vegetationLevel: string
  o2Estimate: number // Percentage of normal O2 levels
  treeRecommendation: boolean
  color: string
}

/**
 * Get vegetation data for a location
 * In production, this would fetch from Sentinel-2 or MODIS NDVI
 * For MVP, we use a simplified model based on location
 */
export async function getVegetationData(lat: number, lon: number): Promise<VegetationData> {
  const cacheKey = `vegetation:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get<VegetationData>(cacheKey, 3600000) // 1 hour cache

  if (cached) {
    return cached
  }

  // TODO: Replace with actual NDVI data from Sentinel-2 or MODIS
  // For now, use a mock calculation based on distance from city center
  const ndvi = calculateMockNDVI(lat, lon)
  
  const result: VegetationData = {
    ndvi,
    vegetationLevel: getVegetationLevel(ndvi),
    o2Estimate: estimateO2FromNDVI(ndvi),
    treeRecommendation: ndvi < 0.3, // Recommend trees in low vegetation areas
    color: getNDVIColor(ndvi),
  }

  cache.set(cacheKey, result)
  return result
}

/**
 * Calculate mock NDVI based on location
 * In production, fetch from NASA GIBS or Sentinel Hub
 */
function calculateMockNDVI(lat: number, lon: number): number {
  // Agadir center: 30.4278, -9.5981
  const agadirLat = 30.4278
  const agadirLon = -9.5981

  // Calculate distance from city center
  const distance = Math.sqrt(
    Math.pow((lat - agadirLat) * 111, 2) + 
    Math.pow((lon - agadirLon) * 111 * Math.cos(lat * Math.PI / 180), 2)
  )

  // Urban areas (close to center) have lower NDVI
  // Rural/mountain areas have higher NDVI
  if (distance < 5) {
    // Urban core: low vegetation
    return 0.1 + Math.random() * 0.15 // 0.1 - 0.25
  } else if (distance < 15) {
    // Suburban: moderate vegetation
    return 0.25 + Math.random() * 0.25 // 0.25 - 0.5
  } else {
    // Rural/mountains: high vegetation
    return 0.5 + Math.random() * 0.3 // 0.5 - 0.8
  }
}

/**
 * Get vegetation level description from NDVI
 */
function getVegetationLevel(ndvi: number): string {
  if (ndvi < 0.2) return 'Barren/Urban'
  if (ndvi < 0.3) return 'Sparse Vegetation'
  if (ndvi < 0.5) return 'Moderate Vegetation'
  if (ndvi < 0.7) return 'Dense Vegetation'
  return 'Very Dense Vegetation'
}

/**
 * Estimate O2 levels from NDVI and air quality
 * Higher vegetation = more O2 production
 */
function estimateO2FromNDVI(ndvi: number): number {
  // Base O2 level from vegetation
  const baseO2 = 70 + (ndvi * 30) // 70-100% range
  
  // Add some variation
  const variation = (Math.random() - 0.5) * 10
  
  return Math.max(60, Math.min(100, baseO2 + variation))
}

/**
 * Get color for NDVI visualization
 */
function getNDVIColor(ndvi: number): string {
  if (ndvi < 0.2) return '#d7191c' // Red (barren)
  if (ndvi < 0.3) return '#fdae61' // Orange (sparse)
  if (ndvi < 0.5) return '#ffffbf' // Yellow (moderate)
  if (ndvi < 0.7) return '#a6d96a' // Light green (dense)
  return '#1a9641' // Dark green (very dense)
}

/**
 * Get NDVI tile URL for visualization
 * Uses NASA GIBS MODIS NDVI layer
 */
export function getNDVITileURL(z: number, x: number, y: number, date?: string): string {
  const dateStr = date || new Date().toISOString().split('T')[0]
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${dateStr}/GoogleMapsCompatible_Level6/${z}/${y}/${x}.png`
}

/**
 * Calculate tree planting priority zones
 * Based on low NDVI + high temperature + poor air quality
 */
export function calculateTreePlantingPriority(
  ndvi: number,
  temperature: number,
  pm25: number
): { priority: string; score: number; reason: string } {
  let score = 0
  const reasons: string[] = []

  // Low vegetation increases priority
  if (ndvi < 0.3) {
    score += 40
    reasons.push('low vegetation cover')
  } else if (ndvi < 0.5) {
    score += 20
    reasons.push('moderate vegetation cover')
  }

  // High temperature increases priority
  if (temperature > 35) {
    score += 30
    reasons.push('high temperature')
  } else if (temperature > 30) {
    score += 15
    reasons.push('elevated temperature')
  }

  // Poor air quality increases priority
  if (pm25 > 50) {
    score += 30
    reasons.push('poor air quality')
  } else if (pm25 > 35) {
    score += 15
    reasons.push('moderate air quality')
  }

  let priority = 'Low'
  if (score >= 70) priority = 'High'
  else if (score >= 40) priority = 'Medium'

  return {
    priority,
    score,
    reason: reasons.length > 0 ? reasons.join(', ') : 'good environmental conditions',
  }
}
