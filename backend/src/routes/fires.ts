import express from 'express'
import { getFIRMSData } from '../services/firms.js'
import { parseBBox } from '../utils/bbox.js'

const router = express.Router()

// GET /api/fires?bbox=minLon,minLat,maxLon,maxLat
router.get('/', async (req, res) => {
  try {
    const bboxStr = req.query.bbox as string
    if (!bboxStr) {
      return res.status(400).json({ error: 'bbox parameter required' })
    }

    const bbox = parseBBox(bboxStr)
    const data = await getFIRMSData(bbox)

    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
