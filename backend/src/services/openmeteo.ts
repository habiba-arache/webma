import fetch from 'node-fetch'
import { cache } from '../utils/cache.js'

export async function getWeatherData(lat: number, lon: number): Promise<any> {
  const cacheKey = `weather:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get(cacheKey, 600000) // 10 min cache

  if (cached) {
    return cached
  }

  try {
    // Open-Meteo API (free, no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7`
    
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`)
    }

    const data = await response.json()
    cache.set(cacheKey, data)
    return data
  } catch (error) {
    console.error('Open-Meteo API error:', error)
    
    // Return mock data
    return {
      current: {
        temperature_2m: 28,
        relative_humidity_2m: 65,
        precipitation: 0,
        wind_speed_10m: 12,
      },
      daily: {
        time: Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() + i)
          return d.toISOString().split('T')[0]
        }),
        temperature_2m_max: [32, 33, 34, 35, 34, 33, 32],
        temperature_2m_min: [22, 23, 24, 25, 24, 23, 22],
        precipitation_sum: [0, 5, 10, 20, 15, 5, 0],
        precipitation_probability_max: [10, 20, 30, 50, 40, 20, 10],
      },
    }
  }
}
