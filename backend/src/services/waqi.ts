import fetch from 'node-fetch'
import { cache } from '../utils/cache.js'

interface WAQIData {
  aqi: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  co: number
  so2: number
  location: string
  timestamp: string
}

export async function getWAQIData(lat: number, lon: number): Promise<WAQIData | null> {
  const cacheKey = `waqi:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get<WAQIData>(cacheKey, 600000) // 10 min cache

  if (cached) {
    return cached
  }

  const token = process.env.WAQI_TOKEN

  if (!token) {
    console.warn('WAQI_TOKEN not configured, skipping WAQI API')
    return null
  }

  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`
    
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`WAQI API error: ${response.statusText}`)
    }

    const data: any = await response.json()

    if (data.status !== 'ok' || !data.data) {
      throw new Error('WAQI API returned invalid data')
    }

    const result: WAQIData = {
      aqi: data.data.aqi || 0,
      pm25: data.data.iaqi?.pm25?.v || 0,
      pm10: data.data.iaqi?.pm10?.v || 0,
      no2: data.data.iaqi?.no2?.v || 0,
      o3: data.data.iaqi?.o3?.v || 0,
      co: data.data.iaqi?.co?.v || 0,
      so2: data.data.iaqi?.so2?.v || 0,
      location: data.data.city?.name || 'Unknown',
      timestamp: data.data.time?.iso || new Date().toISOString(),
    }

    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error('WAQI API error:', error)
    return null
  }
}

export function getAQILevel(aqi: number): { level: string; color: string; description: string } {
  if (aqi <= 50) {
    return { level: 'Good', color: '#00e400', description: 'Air quality is satisfactory' }
  } else if (aqi <= 100) {
    return { level: 'Moderate', color: '#ffff00', description: 'Acceptable for most people' }
  } else if (aqi <= 150) {
    return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Sensitive groups may experience health effects' }
  } else if (aqi <= 200) {
    return { level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects' }
  } else if (aqi <= 300) {
    return { level: 'Very Unhealthy', color: '#8f3f97', description: 'Health alert: everyone may experience serious effects' }
  } else {
    return { level: 'Hazardous', color: '#7e0023', description: 'Health warnings of emergency conditions' }
  }
}
