import fetch from 'node-fetch'
import { cache } from '../utils/cache.js'
import type { BBox } from '../utils/bbox.js'

interface FIRMSFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    brightness: number
    confidence: string
    acq_date: string
    acq_time: string
  }
}

export async function getFIRMSData(bbox: BBox): Promise<any> {
  const cacheKey = `firms:${JSON.stringify(bbox)}`
  const cached = cache.get(cacheKey, 3600000) // 1 hour cache

  if (cached) {
    return cached
  }

  try {
    // NASA FIRMS API (requires API key for production)
    // For MVP, we'll return mock data
    // In production: https://firms.modaps.eosdis.nasa.gov/api/area/csv/...
    
    const mockFeatures: FIRMSFeature[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-9.55, 30.45],
        },
        properties: {
          brightness: 325.5,
          confidence: 'high',
          acq_date: new Date().toISOString().split('T')[0],
          acq_time: '1430',
        },
      },
    ]

    const result = {
      type: 'FeatureCollection',
      features: mockFeatures.filter(
        (f) =>
          f.geometry.coordinates[1] >= bbox.minLat &&
          f.geometry.coordinates[1] <= bbox.maxLat &&
          f.geometry.coordinates[0] >= bbox.minLon &&
          f.geometry.coordinates[0] <= bbox.maxLon
      ),
    }

    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error('FIRMS API error:', error)
    return { type: 'FeatureCollection', features: [] }
  }
}

export function countFiresNearLocation(
  lat: number,
  lon: number,
  fires: any,
  radiusKm: number = 10
): number {
  if (!fires?.features) return 0

  return fires.features.filter((f: FIRMSFeature) => {
    const [fireLon, fireLat] = f.geometry.coordinates
    const distance = getDistanceKm(lat, lon, fireLat, fireLon)
    return distance <= radiusKm
  }).length
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
