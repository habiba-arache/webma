import express from 'express'
import { getWeatherData } from '../services/openmeteo.js'
import { getFIRMSData } from '../services/firms.js'
import { getAirQualityData } from '../services/openaq.js'
import { parseBBox } from '../utils/bbox.js'

const router = express.Router()

interface Alert {
  id: string
  type: 'flood' | 'fire' | 'heat' | 'air'
  severity: 'low' | 'medium' | 'high'
  message: string
  location: string
  timestamp: string
}

// GET /api/alerts?bbox=minLon,minLat,maxLon,maxLat
router.get('/', async (req, res) => {
  try {
    const bboxStr = req.query.bbox as string
    if (!bboxStr) {
      return res.status(400).json({ error: 'bbox parameter required' })
    }

    const bbox = parseBBox(bboxStr)
    const centerLat = (bbox.minLat + bbox.maxLat) / 2
    const centerLon = (bbox.minLon + bbox.maxLon) / 2

    const [weatherData, firesData, airData] = await Promise.all([
      getWeatherData(centerLat, centerLon),
      getFIRMSData(bbox),
      getAirQualityData(bbox),
    ])

    const alerts: Alert[] = []

    // Flood alerts
    const precip = weatherData?.daily?.precipitation_probability_max?.[0] || 0
    if (precip > 70) {
      alerts.push({
        id: `flood-${Date.now()}`,
        type: 'flood',
        severity: 'high',
        message: `Flood Watch — ${precip}% rainfall probability next 48h`,
        location: 'Region',
        timestamp: new Date().toISOString(),
      })
    }

    // Fire alerts
    if (firesData?.features?.length > 0) {
      alerts.push({
        id: `fire-${Date.now()}`,
        type: 'fire',
        severity: firesData.features.length > 3 ? 'high' : 'medium',
        message: `${firesData.features.length} active fire(s) detected in region`,
        location: 'Region',
        timestamp: new Date().toISOString(),
      })
    }

    // Heat alerts
    const maxTemp = weatherData?.daily?.temperature_2m_max?.[0] || 0
    if (maxTemp > 38) {
      alerts.push({
        id: `heat-${Date.now()}`,
        type: 'heat',
        severity: 'high',
        message: `Extreme heat warning — ${maxTemp}°C expected`,
        location: 'Region',
        timestamp: new Date().toISOString(),
      })
    }

    // Air quality alerts
    const avgPM25 = airData.reduce((sum, p) => sum + p.pm25, 0) / (airData.length || 1)
    if (avgPM25 > 55) {
      alerts.push({
        id: `air-${Date.now()}`,
        type: 'air',
        severity: 'medium',
        message: `Unhealthy air quality — PM2.5 levels elevated (${avgPM25.toFixed(0)} µg/m³)`,
        location: 'Region',
        timestamp: new Date().toISOString(),
      })
    }

    res.json({ alerts })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
