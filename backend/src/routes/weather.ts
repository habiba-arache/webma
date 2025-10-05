import express from 'express'
import { getWeatherData } from '../services/openmeteo.js'

const router = express.Router()

// GET /api/weather?lat=30.4278&lon=-9.5981
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'lat and lon parameters required' })
    }

    const data = await getWeatherData(lat, lon)
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
