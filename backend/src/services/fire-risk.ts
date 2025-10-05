import { cache } from '../utils/cache.js'

interface FireRiskData {
  riskLevel: string // Low, Medium, High, Extreme
  probability: number // 0-100%
  factors: {
    temperature: number // °C
    humidity: number // %
    windSpeed: number // km/h
    ndvi: number // Vegetation dryness indicator
  }
  prediction: {
    current: string
    next24h: string
    next48h: string
  }
  color: string
  recommendations: string[]
}

/**
 * Calculate fire risk for a location
 * Uses temperature, humidity, wind speed, and vegetation dryness (NDVI)
 */
export async function getFireRisk(
  lat: number,
  lon: number,
  temperature: number,
  humidity: number,
  windSpeed: number,
  ndvi: number
): Promise<FireRiskData> {
  const cacheKey = `fire-risk:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get<FireRiskData>(cacheKey, 600000) // 10 min cache

  if (cached) {
    return cached
  }

  // Calculate fire probability
  const probability = calculateFireProbability(temperature, humidity, windSpeed, ndvi)

  // Determine risk level
  const riskLevel = getFireRiskLevel(probability)

  // Generate predictions
  const prediction = generateFirePrediction(probability, windSpeed)

  // Generate recommendations
  const recommendations = generateFireRecommendations(riskLevel, windSpeed)

  const result: FireRiskData = {
    riskLevel,
    probability,
    factors: {
      temperature,
      humidity,
      windSpeed,
      ndvi,
    },
    prediction,
    color: getFireRiskColor(probability),
    recommendations,
  }

  cache.set(cacheKey, result)
  return result
}

/**
 * Calculate fire probability using Fire Weather Index (FWI) principles
 */
function calculateFireProbability(
  temperature: number,
  humidity: number,
  windSpeed: number,
  ndvi: number
): number {
  let probability = 0

  // Temperature factor (0-30 points)
  // Higher temperature = higher fire risk
  if (temperature > 40) probability += 30
  else if (temperature > 35) probability += 25
  else if (temperature > 30) probability += 15
  else if (temperature > 25) probability += 5
  else probability += temperature * 0.2

  // Humidity factor (0-30 points)
  // Lower humidity = higher fire risk
  if (humidity < 20) probability += 30
  else if (humidity < 30) probability += 25
  else if (humidity < 40) probability += 15
  else if (humidity < 50) probability += 10
  else probability += (100 - humidity) * 0.1

  // Wind speed factor (0-25 points)
  // Higher wind = faster fire spread
  if (windSpeed > 40) probability += 25
  else if (windSpeed > 30) probability += 20
  else if (windSpeed > 20) probability += 15
  else if (windSpeed > 10) probability += 10
  else probability += windSpeed * 0.5

  // Vegetation dryness factor (0-15 points)
  // Low NDVI in vegetated areas = dry vegetation = higher fire risk
  // Very low NDVI (barren) = no fuel = lower fire risk
  if (ndvi > 0.2 && ndvi < 0.4) {
    // Sparse dry vegetation - highest risk
    probability += 15
  } else if (ndvi >= 0.4 && ndvi < 0.6) {
    // Moderate vegetation - medium risk
    probability += 10
  } else if (ndvi >= 0.6) {
    // Dense vegetation - lower risk (usually greener/wetter)
    probability += 5
  } else {
    // Barren - very low risk (no fuel)
    probability += 2
  }

  return Math.min(100, Math.max(0, probability))
}

/**
 * Get fire risk level from probability
 */
function getFireRiskLevel(probability: number): string {
  if (probability < 25) return 'Low'
  if (probability < 50) return 'Medium'
  if (probability < 75) return 'High'
  return 'Extreme'
}

/**
 * Generate fire predictions
 */
function generateFirePrediction(
  probability: number,
  windSpeed: number
): { current: string; next24h: string; next48h: string } {
  const current = probability > 75 ? 'Extreme fire danger' :
                  probability > 50 ? 'High fire danger' :
                  probability > 25 ? 'Moderate fire danger' : 'Low fire danger'

  // Wind affects spread potential
  const spreadRisk = windSpeed > 30 ? 'rapid spread possible' :
                     windSpeed > 15 ? 'moderate spread' : 'slow spread'

  return {
    current: `${current} - ${spreadRisk}`,
    next24h: probability > 60 ? 'Elevated risk continues' : 'Risk may decrease',
    next48h: probability > 60 ? 'Monitor conditions closely' : 'Conditions improving',
  }
}

/**
 * Generate fire recommendations
 */
function generateFireRecommendations(riskLevel: string, windSpeed: number): string[] {
  const recommendations: string[] = []

  if (riskLevel === 'Extreme') {
    recommendations.push('🚨 EXTREME FIRE DANGER - No outdoor burning')
    recommendations.push('🚒 Firefighting resources on standby')
    recommendations.push('🏃 Prepare evacuation plans for high-risk areas')
    recommendations.push('📱 Monitor emergency alerts continuously')
    recommendations.push('💨 Strong winds increase spread risk')
  } else if (riskLevel === 'High') {
    recommendations.push('⚠️ HIGH FIRE DANGER - Avoid all open flames')
    recommendations.push('🔥 No campfires or outdoor burning')
    recommendations.push('🚗 Avoid parking on dry grass')
    recommendations.push('📞 Report any smoke or fires immediately')
  } else if (riskLevel === 'Medium') {
    recommendations.push('⚡ MODERATE FIRE DANGER - Use caution')
    recommendations.push('🔥 Limit outdoor burning to designated areas')
    recommendations.push('💧 Keep water/extinguisher nearby if burning')
    recommendations.push('🌬️ Monitor wind conditions')
  } else {
    recommendations.push('✅ LOW FIRE DANGER - Normal precautions')
    recommendations.push('🔍 Still avoid unattended fires')
    recommendations.push('🌧️ Conditions favorable')
  }

  if (windSpeed > 25) {
    recommendations.push(`💨 High winds (${windSpeed.toFixed(0)} km/h) - Extra caution needed`)
  }

  return recommendations
}

/**
 * Get color for fire risk visualization
 */
function getFireRiskColor(probability: number): string {
  if (probability < 25) return '#22c55e' // Green (low)
  if (probability < 50) return '#eab308' // Yellow (medium)
  if (probability < 75) return '#f97316' // Orange (high)
  return '#dc2626' // Red (extreme)
}

/**
 * Calculate fire spread direction and speed
 */
export function calculateFireSpread(
  windSpeed: number,
  windDirection: number, // degrees
  slope: number = 0 // degrees
): { speed: number; direction: number; description: string } {
  // Base spread rate (km/h) increases with wind
  let spreadSpeed = windSpeed * 0.3

  // Upslope increases spread rate
  if (slope > 0) {
    spreadSpeed *= (1 + slope * 0.02)
  }

  // Wind direction affects spread direction
  const spreadDirection = windDirection

  let description = 'Slow spread expected'
  if (spreadSpeed > 5) description = 'Rapid spread possible'
  else if (spreadSpeed > 2) description = 'Moderate spread rate'

  return {
    speed: spreadSpeed,
    direction: spreadDirection,
    description,
  }
}

/**
 * Get fire danger index (FDI) - Australian McArthur Forest Fire Danger Index
 */
export function calculateFireDangerIndex(
  temperature: number,
  humidity: number,
  windSpeed: number,
  droughtFactor: number = 10 // 0-10, higher = drier
): number {
  // Simplified McArthur FDI formula
  const fdi = droughtFactor * Math.exp(
    (temperature - humidity / 10) * 0.05 + windSpeed * 0.01
  )

  return Math.min(100, fdi)
}
