import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import firesRouter from './routes/fires.js'
import airRouter from './routes/air.js'
import weatherRouter from './routes/weather.js'
import riskRouter from './routes/risk.js'
import alertsRouter from './routes/alerts.js'
import vegetationRouter from './routes/vegetation.js'
import floodRouter from './routes/flood.js'
import fireRiskRouter from './routes/fire-risk.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/fires', firesRouter)
app.use('/api/air', airRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/risk', riskRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/vegetation', vegetationRouter)
app.use('/api/flood', floodRouter)
app.use('/api/fire-risk', fireRiskRouter)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🌍 Webma EarthGuard API running on http://localhost:${PORT}`)
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`)
})
