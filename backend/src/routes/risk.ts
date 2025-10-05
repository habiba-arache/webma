import express from 'express'
import { getWeatherData } from '../services/openmeteo.js'
import { getAirQualityData } from '../services/openaq.js'
import { getFIRMSData } from '../services/firms.js'
import { getAirQualityAtLocation } from '../services/openaq.js'
import { countFiresNearLocation } from '../services/firms.js'
import { calculateRiskScore, generateSuggestions } from '../utils/risk.js'

const router = express.Router()

// GET /api/risk?lat=30.4278&lon=-9.5981
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'lat and lon parameters required' })
    }

    // Fetch all required data
    const [weatherData, airPoints, firesData] = await Promise.all([
      getWeatherData(lat, lon),
      getAirQualityData({
        minLat: lat - 0.5,
        maxLat: lat + 0.5,
        minLon: lon - 0.5,
        maxLon: lon + 0.5,
      }),
      getFIRMSData({
        minLat: lat - 0.5,
        maxLat: lat + 0.5,
        minLon: lon - 0.5,
        maxLon: lon + 0.5,
      }),
    ])

    const airData = getAirQualityAtLocation(lat, lon, airPoints)
    const firesNearby = countFiresNearLocation(lat, lon, firesData, 10)

    const riskScore = calculateRiskScore(lat, lon, weatherData, airData, firesNearby)
    const suggestions = generateSuggestions(riskScore)

    res.json({
      ...riskScore,
      suggestions,
      metadata: {
        lat,
        lon,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
