import express from 'express'
import { getFloodRisk } from '../services/flood.js'
import { getWeatherData } from '../services/openmeteo.js'

const router = express.Router()

/**
 * GET /api/flood?lat=30.4278&lon=-9.5981
 * Get flood risk assessment
 */
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates', message: 'lat and lon must be valid numbers' })
    }

    // Get weather data for rainfall forecast
    const weather = await getWeatherData(lat, lon)
    
    const rainfallForecast = weather.daily?.precipitation_sum?.slice(0, 3) || [0, 0, 0]
    const currentRainfall = weather.current?.precipitation || 0

    const floodData = await getFloodRisk(lat, lon, rainfallForecast, currentRainfall)

    res.json({
      ...floodData,
      location: { lat, lon },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch flood risk data', message: error.message })
  }
})

export default router
