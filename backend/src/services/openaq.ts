import fetch from 'node-fetch'
import { cache } from '../utils/cache.js'
import type { BBox } from '../utils/bbox.js'

interface AirQualityPoint {
  lat: number
  lon: number
  pm25: number
  no2: number
  o3: number
  location: string
  timestamp: string
}

export async function getAirQualityData(bbox: BBox, parameters: string[] = ['pm25']): Promise<AirQualityPoint[]> {
  const cacheKey = `openaq:${JSON.stringify(bbox)}:${parameters.join(',')}`
  const cached = cache.get<AirQualityPoint[]>(cacheKey, 600000) // 10 min cache

  if (cached) {
    return cached
  }

  try {
    // OpenAQ API v2
    // https://docs.openaq.org/docs
    const url = `https://api.openaq.org/v2/latest?limit=100&bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WebmaEarthGuard/0.1',
      },
    })

    if (!response.ok) {
      throw new Error(`OpenAQ API error: ${response.statusText}`)
    }

    const data: any = await response.json()
    
    const points: AirQualityPoint[] = []
    
    if (data.results) {
      for (const result of data.results) {
        const point: any = {
          lat: result.coordinates?.latitude || 0,
          lon: result.coordinates?.longitude || 0,
          location: result.location || 'Unknown',
          timestamp: result.measurements?.[0]?.lastUpdated || new Date().toISOString(),
          pm25: 0,
          no2: 0,
          o3: 0,
        }

        if (result.measurements) {
          for (const measurement of result.measurements) {
            if (measurement.parameter === 'pm25') point.pm25 = measurement.value
            if (measurement.parameter === 'no2') point.no2 = measurement.value
            if (measurement.parameter === 'o3') point.o3 = measurement.value
          }
        }

        points.push(point)
      }
    }

    cache.set(cacheKey, points)
    return points
  } catch (error) {
    console.error('OpenAQ API error:', error)
    
    // Return mock data for MVP
    const mockPoints: AirQualityPoint[] = [
      {
        lat: 30.4278,
        lon: -9.5981,
        pm25: 43,
        no2: 28,
        o3: 65,
        location: 'Agadir Center',
        timestamp: new Date().toISOString(),
      },
    ]
    
    return mockPoints
  }
}

export function getAirQualityAtLocation(lat: number, lon: number, points: AirQualityPoint[]): any {
  if (points.length === 0) {
    return { pm25: 0, no2: 0, o3: 0 }
  }

  // Find nearest point
  let nearest = points[0]
  let minDist = getDistance(lat, lon, nearest.lat, nearest.lon)

  for (const point of points) {
    const dist = getDistance(lat, lon, point.lat, point.lon)
    if (dist < minDist) {
      minDist = dist
      nearest = point
    }
  }

  return {
    pm25: nearest.pm25,
    no2: nearest.no2,
    o3: nearest.o3,
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
}
