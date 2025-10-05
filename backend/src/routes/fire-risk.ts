import express from 'express'
import { getFireRisk, calculateFireSpread } from '../services/fire-risk.js'
import { getWeatherData } from '../services/openmeteo.js'
import { getVegetationData } from '../services/vegetation.js'

const router = express.Router()

/**
 * GET /api/fire-risk?lat=30.4278&lon=-9.5981
 * Get comprehensive fire risk assessment
 */
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates', message: 'lat and lon must be valid numbers' })
    }

    // Get weather data
    const weather = await getWeatherData(lat, lon)
    const temperature = weather.current?.temperature_2m || 25
    const humidity = weather.current?.relative_humidity_2m || 50
    const windSpeed = weather.current?.wind_speed_10m || 0

    // Get vegetation data (for dryness indicator)
    const vegetation = await getVegetationData(lat, lon)

    // Calculate fire risk
    const fireRisk = await getFireRisk(lat, lon, temperature, humidity, windSpeed, vegetation.ndvi)

    // Calculate fire spread (assuming wind direction 0 for now)
    const spread = calculateFireSpread(windSpeed, 0)

    res.json({
      ...fireRisk,
      spread,
      location: { lat, lon },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch fire risk data', message: error.message })
  }
})

export default router
