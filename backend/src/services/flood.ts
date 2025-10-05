import { cache } from '../utils/cache.js'

interface FloodRiskData {
  riskLevel: string // Low, Medium, High
  probability: number // 0-100%
  factors: {
    rainfall: number // mm
    elevation: number // meters
    slope: number // degrees
    soilSaturation: number // 0-100%
  }
  prediction: {
    next24h: string
    next48h: string
    next72h: string
  }
  color: string
  recommendations: string[]
}

/**
 * Calculate flood risk for a location
 * Uses rainfall forecast, elevation (DEM), and soil moisture
 */
export async function getFloodRisk(
  lat: number,
  lon: number,
  rainfallForecast: number[], // Next 3 days in mm
  currentRainfall: number = 0
): Promise<FloodRiskData> {
  const cacheKey = `flood:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get<FloodRiskData>(cacheKey, 600000) // 10 min cache

  if (cached) {
    return cached
  }

  // Get elevation and slope (mock for MVP, replace with actual DEM data)
  const elevation = getMockElevation(lat, lon)
  const slope = getMockSlope(lat, lon)

  // Calculate soil saturation based on recent rainfall
  const soilSaturation = calculateSoilSaturation(currentRainfall, rainfallForecast)

  // Calculate flood probability
  const probability = calculateFloodProbability(
    rainfallForecast,
    elevation,
    slope,
    soilSaturation
  )

  // Determine risk level
  const riskLevel = getRiskLevel(probability)

  // Generate predictions
  const prediction = generateFloodPrediction(rainfallForecast, probability)

  // Generate recommendations
  const recommendations = generateFloodRecommendations(riskLevel, rainfallForecast)

  const result: FloodRiskData = {
    riskLevel,
    probability,
    factors: {
      rainfall: rainfallForecast[0] || 0,
      elevation,
      slope,
      soilSaturation,
    },
    prediction,
    color: getFloodColor(probability),
    recommendations,
  }

  cache.set(cacheKey, result)
  return result
}

/**
 * Get mock elevation data
 * TODO: Replace with actual Copernicus DEM data
 */
function getMockElevation(lat: number, lon: number): number {
  // Agadir center: ~10m elevation
  // Mountains to the east: up to 500m
  const agadirLat = 30.4278
  const agadirLon = -9.5981

  const distanceEast = (lon - agadirLon) * 111 * Math.cos(lat * Math.PI / 180)
  
  if (distanceEast < 0) {
    // West (ocean side): 0-20m
    return Math.max(0, 10 + distanceEast * 2)
  } else {
    // East (mountains): 10-500m
    return 10 + distanceEast * 30
  }
}

/**
 * Get mock slope data
 * TODO: Calculate from DEM
 */
function getMockSlope(lat: number, lon: number): number {
  const elevation = getMockElevation(lat, lon)
  
  // Higher elevation generally means steeper slopes
  if (elevation < 20) return 0.5 + Math.random() * 2 // Flat coastal
  if (elevation < 100) return 2 + Math.random() * 5 // Gentle hills
  return 5 + Math.random() * 15 // Mountains
}

/**
 * Calculate soil saturation from rainfall
 */
function calculateSoilSaturation(currentRainfall: number, forecast: number[]): number {
  const totalRainfall = currentRainfall + (forecast[0] || 0) + (forecast[1] || 0) * 0.5
  
  // Saturation increases with rainfall
  // 0mm = 20% (base), 100mm = 100% (saturated)
  const saturation = 20 + (totalRainfall / 100) * 80
  
  return Math.min(100, saturation)
}

/**
 * Calculate flood probability
 */
function calculateFloodProbability(
  rainfallForecast: number[],
  elevation: number,
  slope: number,
  soilSaturation: number
): number {
  let probability = 0

  // Rainfall factor (0-40 points)
  const totalRainfall = rainfallForecast.slice(0, 3).reduce((a, b) => a + b, 0)
  if (totalRainfall > 100) probability += 40
  else if (totalRainfall > 50) probability += 30
  else if (totalRainfall > 20) probability += 15
  else probability += totalRainfall * 0.3

  // Elevation factor (0-30 points)
  // Lower elevation = higher flood risk
  if (elevation < 10) probability += 30
  else if (elevation < 30) probability += 20
  else if (elevation < 100) probability += 10
  else probability += 5

  // Slope factor (0-15 points)
  // Flatter areas = higher flood risk
  if (slope < 2) probability += 15
  else if (slope < 5) probability += 10
  else if (slope < 10) probability += 5

  // Soil saturation factor (0-15 points)
  probability += soilSaturation * 0.15

  return Math.min(100, Math.max(0, probability))
}

/**
 * Get risk level from probability
 */
function getRiskLevel(probability: number): string {
  if (probability < 30) return 'Low'
  if (probability < 60) return 'Medium'
  return 'High'
}

/**
 * Generate flood predictions
 */
function generateFloodPrediction(
  rainfallForecast: number[],
  baseProbability: number
): { next24h: string; next48h: string; next72h: string } {
  const day1 = rainfallForecast[0] || 0
  const day2 = rainfallForecast[1] || 0
  const day3 = rainfallForecast[2] || 0

  return {
    next24h: day1 > 50 ? 'High risk' : day1 > 20 ? 'Moderate risk' : 'Low risk',
    next48h: day2 > 50 ? 'High risk' : day2 > 20 ? 'Moderate risk' : 'Low risk',
    next72h: day3 > 50 ? 'High risk' : day3 > 20 ? 'Moderate risk' : 'Low risk',
  }
}

/**
 * Generate flood recommendations
 */
function generateFloodRecommendations(riskLevel: string, rainfallForecast: number[]): string[] {
  const recommendations: string[] = []

  if (riskLevel === 'High') {
    recommendations.push('🚨 Evacuate low-lying areas if possible')
    recommendations.push('📦 Prepare emergency supplies and sandbags')
    recommendations.push('🚗 Move vehicles to higher ground')
    recommendations.push('📱 Monitor weather alerts closely')
  } else if (riskLevel === 'Medium') {
    recommendations.push('⚠️ Prepare sandbags for low-lying areas')
    recommendations.push('🔍 Monitor drainage systems and clear blockages')
    recommendations.push('📋 Review evacuation routes')
    recommendations.push('🌧️ Avoid unnecessary travel during heavy rainfall')
  } else {
    recommendations.push('✅ No immediate flood risk')
    recommendations.push('🔧 Maintain drainage systems')
    recommendations.push('📊 Continue monitoring weather forecasts')
  }

  const totalRainfall = rainfallForecast.slice(0, 3).reduce((a, b) => a + b, 0)
  if (totalRainfall > 30) {
    recommendations.push(`💧 Expected rainfall: ${totalRainfall.toFixed(0)}mm over next 3 days`)
  }

  return recommendations
}

/**
 * Get color for flood risk visualization
 */
function getFloodColor(probability: number): string {
  if (probability < 30) return '#4ade80' // Green (low risk)
  if (probability < 60) return '#fbbf24' // Yellow (medium risk)
  return '#ef4444' // Red (high risk)
}

/**
 * Get flood tile URL for visualization
 * Uses NASA GPM IMERG precipitation data
 */
export function getFloodTileURL(z: number, x: number, y: number, date?: string): string {
  const dateStr = date || new Date().toISOString().split('T')[0]
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/${dateStr}T00:00:00Z/GoogleMapsCompatible_Level6/${z}/${y}/${x}.png`
}
