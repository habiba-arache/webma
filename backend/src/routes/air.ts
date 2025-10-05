import express from 'express'
import { getAirQualityData } from '../services/openaq.js'
import { parseBBox } from '../utils/bbox.js'

const router = express.Router()

// GET /api/air/points?bbox=minLon,minLat,maxLon,maxLat&parameters=pm25,no2,o3
router.get('/points', async (req, res) => {
  try {
    const bboxStr = req.query.bbox as string
    if (!bboxStr) {
      return res.status(400).json({ error: 'bbox parameter required' })
    }

    const bbox = parseBBox(bboxStr)
    const parametersStr = (req.query.parameters as string) || 'pm25'
    const parameters = parametersStr.split(',')

    const data = await getAirQualityData(bbox, parameters)

    res.json({
      type: 'FeatureCollection',
      features: data.map((point) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lon, point.lat],
        },
        properties: {
          location: point.location,
          pm25: point.pm25,
          no2: point.no2,
          o3: point.o3,
          timestamp: point.timestamp,
        },
      })),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
