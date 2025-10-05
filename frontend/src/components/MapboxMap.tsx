import { useEffect, useRef } from 'react'
import mapboxgl, { Map, Marker, MapMouseEvent } from 'mapbox-gl'
import type { LayerState, AreaInfo, ChatbotMarker } from '../App'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapContainer.css'

interface MapboxMapProps {
  layers: LayerState
  onAreaClick: (area: AreaInfo) => void
  forecastDays: number
  chatbotMarkers: ChatbotMarker[]
}

export default function MapboxMap({ layers, onAreaClick, forecastDays, chatbotMarkers }: MapboxMapProps) {
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)

  const TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api'

  useEffect(() => {
    if (!TOKEN) return
    if (mapRef.current) return

    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      // --- MODIFICATIONS ICI ---
      center: [-9.5981, 30.4278], // Agadir, Maroc [lon, lat]
      zoom: 11.5, // Zoom de ville
      // -------------------------
      pitch: 60,
      bearing: -10,
      antialias: true,
    })

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left')

    map.on('load', () => {
      const dateStr = (daysOffset: number, withTime = false) => {
        const d = new Date()
        d.setDate(d.getDate() + daysOffset)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return withTime ? `${yyyy}-${mm}-${dd}T00:00:00Z` : `${yyyy}-${mm}-${dd}`
      }
      // 3D terrain (global DEM)
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      })
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.6 })

      // Sky layer
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun-intensity': 15,
        },
      })

      // NDVI (NASA GIBS) as raster layer when vegetation toggle is on
      map.addSource('ndvi-gibs', {
        type: 'raster',
        tiles: [
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${dateStr(forecastDays)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        ],
        tileSize: 256,
        attribution: 'NASA EOSDIS GIBS',
      })
      map.addLayer(
        {
          id: 'ndvi-layer',
          type: 'raster',
          source: 'ndvi-gibs',
          paint: { 'raster-opacity': 0.6 },
          layout: { visibility: layers.vegetation ? 'visible' : 'none' },
        },
        'waterway-label' // place under labels
      )

      // GPM Precipitation raster
      map.addSource('gpm-gibs', {
        type: 'raster',
        tiles: [
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/${dateStr(forecastDays, true)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        ],
        tileSize: 256,
        attribution: 'NASA EOSDIS GIBS',
      })
      map.addLayer(
        {
          id: 'gpm-layer',
          type: 'raster',
          source: 'gpm-gibs',
          paint: { 'raster-opacity': 0.5 },
          layout: { visibility: layers.flood ? 'visible' : 'none' },
        },
        'waterway-label'
      )

      // Initialize empty AQI and Fires sources
      map.addSource('aqi-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'aqi-layer',
        type: 'circle',
        source: 'aqi-points',
        paint: {
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000',
          'circle-color': [
            'case',
            ['<=', ['get', 'aqi'], 50], '#00e400',
            ['<=', ['get', 'aqi'], 100], '#ffff00',
            ['<=', ['get', 'aqi'], 150], '#ff7e00',
            ['<=', ['get', 'aqi'], 200], '#ff0000',
            ['<=', ['get', 'aqi'], 300], '#8f3f97',
            '#7e0023'
          ],
        },
        layout: { visibility: layers.airQuality ? 'visible' : 'none' },
      })

      map.addSource('fires-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'fires-layer',
        type: 'circle',
        source: 'fires-points',
        paint: {
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#400',
          'circle-color': [
            'case',
            ['<=', ['get', 'confidence'], 30], '#fbbf24',
            ['<=', ['get', 'confidence'], 60], '#f97316',
            '#dc2626'
          ],
        },
        layout: { visibility: layers.fire ? 'visible' : 'none' },
      })
    })

    // Click handler -> fetch real backend data
    map.on('click', async (e: MapMouseEvent) => {
      const lng = e.lngLat.lng
      const lat = e.lngLat.lat

      try {
        const qs = `lat=${lat}&lon=${lng}`
        
        // Appel à l'endpoint /api/risk unique
        const riskData = await fetch(`${API_BASE}/risk?${qs}`).then((r) => r.json()).catch(() => null)
        
        if (!riskData || riskData.error) {
            console.error('Failed to fetch combined risk data:', riskData?.error || 'Unknown error')
            return
        }

        // Utiliser les données structurées renvoyées par l'API
        const name = riskData.name || 'Selected Location'
        const floodRiskText = riskData.floodRisk || 'N/A'
        const fireRiskText = riskData.fireRisk || 'N/A'
        const heatText = riskData.heatRisk || 'N/A'
        const airText = riskData.airQuality || 'N/A'
        const o2Text = riskData.o2Estimate || 'N/A'
        const suggestions: string[] = riskData.suggestions || []

        const area: AreaInfo = { lat, lon: lng, name, floodRisk: floodRiskText, fireRisk: fireRiskText, heatRisk: heatText, airQuality: airText, o2Estimate: o2Text, suggestions }
        onAreaClick(area)

        // Drop/update marker
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).setPopup(new mapboxgl.Popup().setHTML(`<b>${name}</b><br/>Lat: ${lat.toFixed(4)}<br/>Lon: ${lng.toFixed(4)}`)).addTo(map)
        markerRef.current.togglePopup()
      } catch (err) {
        console.error('Error fetching environmental data:', err)
      }
    })

    mapRef.current = map

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [])

  // React to layer toggles (NDVI and GPM)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const ndviId = 'ndvi-layer'
    const gpmId = 'gpm-layer'
    const aqiId = 'aqi-layer'
    if (map.getLayer(ndviId)) {
      map.setLayoutProperty(ndviId, 'visibility', layers.vegetation ? 'visible' : 'none')
    }
    if (map.getLayer(gpmId)) {
      map.setLayoutProperty(gpmId, 'visibility', layers.flood ? 'visible' : 'none')
    }
    if (map.getLayer(aqiId)) {
      map.setLayoutProperty(aqiId, 'visibility', layers.airQuality ? 'visible' : 'none')
    }

    // Update NDVI
    if (map.getLayer('ndvi-layer')) map.removeLayer('ndvi-layer')
    if (map.getSource('ndvi-gibs')) map.removeSource('ndvi-gibs')
    map.addSource('ndvi-gibs', {
      type: 'raster',
      tiles: [
        // Recreate source in forecastDays effect; here keep existing visibility update only.
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/1970-01-01/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
      ],
      tileSize: 256,
      attribution: 'NASA EOSDIS GIBS',
    })
    map.addLayer(
      {
        id: 'ndvi-layer',
        type: 'raster',
        source: 'ndvi-gibs',
        paint: { 'raster-opacity': 0.6 },
        layout: { visibility: layers.vegetation ? 'visible' : 'none' },
      },
      'waterway-label'
    )

    // Update GPM
    if (map.getLayer('gpm-layer')) map.removeLayer('gpm-layer')
    if (map.getSource('gpm-gibs')) map.removeSource('gpm-gibs')
    map.addSource('gpm-gibs', {
      type: 'raster',
      tiles: [
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/1970-01-01T00:00:00Z/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
      ],
      tileSize: 256,
      attribution: 'NASA EOSDIS GIBS',
    })
    map.addLayer(
      {
        id: 'gpm-layer',
        type: 'raster',
        source: 'gpm-gibs',
        paint: { 'raster-opacity': 0.5 },
        layout: { visibility: layers.flood ? 'visible' : 'none' },
      },
      'waterway-label'
    )
  }, [forecastDays])

  // Helpers to compute bbox string
  function getBboxString(map: Map) {
    const b = map.getBounds() as mapboxgl.LngLatBounds
    const west = b.getWest().toFixed(4)
    const south = b.getSouth().toFixed(4)
    const east = b.getEast().toFixed(4)
    const north = b.getNorth().toFixed(4)
    return `${west},${south},${east},${north}`
  }

  // Load AQI and Fires for current viewport
  async function loadViewportData() {
    const map = mapRef.current
    if (!map) return
    const bbox = getBboxString(map)
    try {
      if (layers.airQuality) {
        const aqiUrl = `${API_BASE}/air/points?bbox=${bbox}&parameters=pm25,no2,o3`
        const aqiData = await fetch(aqiUrl).then((r) => r.json()).catch(() => null)
        if (aqiData && map.getSource('aqi-points')) {
          ;(map.getSource('aqi-points') as any).setData(aqiData)
        }
      }
      if (layers.fire) {
        const firesUrl = `${API_BASE}/fires?bbox=${bbox}`
        const firesData = await fetch(firesUrl).then((r) => r.json()).catch(() => null)
        if (firesData && map.getSource('fires-points')) {
          ;(map.getSource('fires-points') as any).setData(firesData)
        }
      }
    } catch (err) {
      console.error('Viewport data load failed', err)
    }
  }

  // Load on moveend when relevant layers are enabled
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = () => {
      if (layers.airQuality || layers.fire) loadViewportData()
    }
    map.on('moveend', handler)
    // Initial load if toggled on
    if (layers.airQuality || layers.fire) loadViewportData()
    return () => {
      map.off('moveend', handler)
    }
  }, [layers.airQuality, layers.fire])

  return <div id="map" className="map-container" />
}