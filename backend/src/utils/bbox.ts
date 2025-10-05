export interface BBox {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
}

export function parseBBox(bboxStr: string): BBox {
  const parts = bboxStr.split(',').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error('Invalid bbox format. Expected: minLon,minLat,maxLon,maxLat')
  }
  return {
    minLon: parts[0],
    minLat: parts[1],
    maxLon: parts[2],
    maxLat: parts[3],
  }
}

export function isInBBox(lat: number, lon: number, bbox: BBox): boolean {
  return (
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lon >= bbox.minLon &&
    lon <= bbox.maxLon
  )
}
