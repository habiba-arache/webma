import express from 'express'
import { getVegetationData, calculateTreePlantingPriority } from '../services/vegetation.js'

const router = express.Router()

/**
 * GET /api/vegetation?lat=30.4278&lon=-9.5981
 * Get vegetation data (NDVI, O2 estimate, tree recommendations)
 */
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates', message: 'lat and lon must be valid numbers' })
    }

    const data = await getVegetationData(lat, lon)
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch vegetation data', message: error.message })
  }
})

/**
 * GET /api/vegetation/planting-priority?lat=30.4278&lon=-9.5981&temp=35&pm25=45
 * Calculate tree planting priority
 */
router.get('/planting-priority', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lon = parseFloat(req.query.lon as string)
    const temp = parseFloat(req.query.temp as string) || 25
    const pm25 = parseFloat(req.query.pm25 as string) || 0

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const vegData = await getVegetationData(lat, lon)
    const priority = calculateTreePlantingPriority(vegData.ndvi, temp, pm25)

    res.json({
      ...priority,
      location: { lat, lon },
      ndvi: vegData.ndvi,
      vegetationLevel: vegData.vegetationLevel,
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate planting priority', message: error.message })
  }
})

export default router
