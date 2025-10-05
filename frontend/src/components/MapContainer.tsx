import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { LayerState, AreaInfo, ChatbotMarker } from '../App'
import './MapContainer.css'

interface MapContainerProps {
  layers: LayerState
  onAreaClick: (area: AreaInfo) => void
  forecastDays: number
  chatbotMarkers: ChatbotMarker[]
}

/**
 * Crée une icône personnalisée pour Leaflet (pin) avec la couleur et la taille basées sur le risque.
 */
const createCustomRiskIcon = (riskLevel: 'High' | 'Medium' | 'Low', iconContent: string) => {
    let color: string
    let size: [number, number] // [width, height]
    
    switch (riskLevel) {
        case 'High':
            color = '#E74C3C' 
            size = [36, 40] 
            break
        case 'Medium':
            color = '#F39C12' 
            size = [30, 33] 
            break
        case 'Low':
            color = '#F1C40F' 
            size = [24, 27] 
            break
        default:
            color = '#7F8C8D'
            size = [30, 33]
    }
    
    const html = `<div style="
        background-color: ${color}; 
        width: ${size[0]}px; 
        height: ${size[0]}px; 
        border-radius: 50%;
        border: 2px solid white; 
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        display: flex; 
        align-items: center; 
        justify-content: center;
        position: relative;
    ">
        <span style="
            font-size: ${size[0] * 0.5}px; 
            color: black;
            font-weight: bold;
        ">${iconContent}</span>
        <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            width: 10px;
            height: 10px;
            background-color: ${color};
            border-bottom: 2px solid white;
            border-right: 2px solid white;
            transform: translate(-50%, 0) rotate(45deg);
        "></div>
    </div>`

    return L.divIcon({
        className: 'custom-risk-marker',
        html: html,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]],
        popupAnchor: [0, -(size[1] - size[0] / 4)],
    })
}

export default function MapContainer({ layers, onAreaClick, forecastDays, chatbotMarkers }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<{ [key: string]: L.TileLayer | L.LayerGroup }>({})
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api'
  const ndviRef = useRef<L.TileLayer | null>(null)
  const gpmRef = useRef<L.TileLayer | null>(null)
  const aqiMarkersRef = useRef<L.LayerGroup | null>(null)
  
  // ✅ CORRECTION 1 : Référence pour stocker les groupes de marqueurs pour chaque risque (permet la superposition)
  const criticalAreasRefs = useRef<{ [key in keyof Omit<LayerState, 'airQuality'>]?: L.LayerGroup }>({})
  
  // ✅ CORRECTION 2 : Référence pour le marqueur de clic de localisation temporaire (permet un marqueur unique)
  const locationMarkerRef = useRef<L.Marker | null>(null)
  
  // Chatbot markers layer
  const chatbotMarkersLayerRef = useRef<L.LayerGroup | null>(null)
  
  // Removed circle drawing functionality

  function dateStr(daysOffset: number, withTime = false) {
    const d = new Date()
    d.setDate(d.getDate() + daysOffset)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    if (withTime) return `${yyyy}-${mm}-${dd}T00:00:00Z`
    return `${yyyy}-${mm}-${dd}`
  }

  // Fonction pour simuler et charger les zones critiques avec niveaux de risque
  // ✅ MODIFIÉ : Prend un LayerGroup cible pour ajouter les marqueurs
  function loadCriticalAreas(layerKey: keyof LayerState, targetLayerGroup: L.LayerGroup) {
    if (!mapRef.current) return

    // Vider UNIQUEMENT le groupe de calques actuel pour cette clé
    targetLayerGroup.clearLayers()
    
    // Coordonnées de base pour Agadir
    const baseLat = 30.4278
    const baseLon = -9.5981
    
    let criticalData: { lat: number, lon: number, riskLevel: 'High' | 'Medium' | 'Low' }[] = []

    // --- LOGIQUE DE SIMULATION AVEC NIVEAUX DE RISQUE --- 
    if (layerKey === 'flood') {
      criticalData = [
        { lat: baseLat + 0.02, lon: baseLon - 0.01, riskLevel: 'High' }, 
        { lat: baseLat - 0.03, lon: baseLon + 0.02, riskLevel: 'Medium' },
        { lat: baseLat + 0.005, lon: baseLon - 0.005, riskLevel: 'Low' }, 
        { lat: baseLat - 0.01, lon: baseLon + 0.01, riskLevel: 'Low' },
      ]
    } else if (layerKey === 'fire') {
      // Only place fire markers on land (east of Agadir, away from coast)
      criticalData = [
        { lat: baseLat - 0.015, lon: baseLon + 0.03, riskLevel: 'High' },  // East - inland
        { lat: baseLat + 0.02, lon: baseLon + 0.02, riskLevel: 'Medium' }, // Northeast - inland
        { lat: baseLat - 0.02, lon: baseLon + 0.04, riskLevel: 'Low' },    // Southeast - inland
        { lat: baseLat + 0.01, lon: baseLon + 0.05, riskLevel: 'Medium' }, // East - inland
      ]
    } else if (layerKey === 'vegetation') {
      // Only place vegetation markers on land (avoid sea/coast)
      criticalData = [
        { lat: baseLat, lon: baseLon + 0.01, riskLevel: 'High' },        // City center - inland
        { lat: baseLat + 0.01, lon: baseLon + 0.02, riskLevel: 'High' }, // Northeast - inland
        { lat: baseLat - 0.01, lon: baseLon + 0.03, riskLevel: 'Medium' }, // East - inland
        { lat: baseLat + 0.02, lon: baseLon + 0.01, riskLevel: 'Medium' }, // North - inland
        { lat: baseLat - 0.02, lon: baseLon + 0.02, riskLevel: 'Low' },  // Southeast - inland
      ]
    } else if (layerKey === 'heat') {
      // Only place heat markers on land (avoid sea)
      criticalData = [
        { lat: baseLat + 0.005, lon: baseLon + 0.01, riskLevel: 'High' },   // City - inland
        { lat: baseLat - 0.01, lon: baseLon + 0.02, riskLevel: 'Medium' },  // East - inland
        { lat: baseLat - 0.005, lon: baseLon + 0.015, riskLevel: 'Low' },   // East - inland
        { lat: baseLat + 0.015, lon: baseLon + 0.01, riskLevel: 'High' },   // North - inland
      ]
    }

    // --- AJOUTER LES MARQUEURS DE TYPE LOCALISATION (PIN) ET LE HALO ---
    if (criticalData.length > 0) {
      let iconContent = ''
      if (layerKey === 'flood') iconContent = '💧' 
      else if (layerKey === 'fire') iconContent = '🔥'
      else if (layerKey === 'vegetation') iconContent = '⬇️🌳'
      else if (layerKey === 'heat') iconContent = '☀️'
        
      criticalData.forEach(({ lat, lon, riskLevel }) => {
        let color: string
        let shadowRadius: number 

        switch (riskLevel) {
            case 'High':
                color = '#E74C3C' 
                shadowRadius = 250 
                break
            case 'Medium':
                color = '#F39C12' 
                shadowRadius = 150 
                break
            case 'Low':
                color = '#F1C40F' 
                shadowRadius = 75 
                break
            default:
                color = '#7F8C8D'
                shadowRadius = 100
        }
        
        // 1. Création de l'ombre circulaire (L.circle)
        const shadowCircle = L.circle([lat, lon], {
            radius: shadowRadius,
            color: color, 
            fillColor: color, 
            fillOpacity: 0.15, 
            weight: 1, 
        })
        shadowCircle.addTo(targetLayerGroup) // Ajouté au groupe CIBLE

        // 2. Création de l'icône personnalisée
        const customIcon = createCustomRiskIcon(riskLevel, iconContent)
        
        // 3. Création du marqueur (L.marker)
        const marker = L.marker([lat, lon], {
          icon: customIcon
        })
        
        // Configuration de la popup
        const riskTypeLabel = layerKey === 'vegetation' ? 'Green Space Deficit' : `${layerKey.toUpperCase()} Risk`
        marker.bindPopup(`<b>${riskTypeLabel}:</b><br/>Level: ${riskLevel}<br/>Influence Radius: ${shadowRadius}m`)

        // GESTIONNAIRE DE CLIC (Reste le même)
        marker.on('click', async (e) => {
            // Empêche le gestionnaire de clic générique de la carte de se déclencher
            L.DomEvent.stopPropagation(e)
            
            const { lat, lng } = e.latlng
            const qs = `lat=${lat}&lon=${lng}`
            const [weather, vegetation, flood, fireRisk] = await Promise.all([
                fetch(`${API_BASE}/weather?${qs}`).then((r) => r.json()).catch(() => null),
                fetch(`${API_BASE}/vegetation?${qs}`).then((r) => r.json()).catch(() => null),
                fetch(`${API_BASE}/flood?${qs}`).then((r) => r.json()).catch(() => null),
                fetch(`${API_BASE}/fire-risk?${qs}`).then((r) => r.json()).catch(() => null),
            ])

            // --- Construction de AreaInfo COHÉRENTE ---
            const name = `${riskLevel} Risk Zone: ${layerKey.toUpperCase()}`
            
            let finalFloodRiskText = flood
                ? `${flood.riskLevel} (${Math.round(flood.probability)}% probability)`
                : 'N/A'
            let finalFireRiskText = fireRisk ? `${fireRisk.riskLevel}` : 'N/A'
            let finalHeatText = weather?.current?.temperature_2m != null
                ? `${Math.round(weather.current.temperature_2m)}°C`
                : 'N/A'
            let finalO2Text = vegetation?.o2Estimate != null
                ? `${Math.round(vegetation.o2Estimate)}% of reference`
                : 'N/A'
            const airText = weather?.current?.relative_humidity_2m != null
                ? `Humidity ${Math.round(weather.current.relative_humidity_2m)}%`
                : 'N/A'

            // SURCHARGE STICTE pour garantir la cohérence
            if (layerKey === 'flood') {
                finalFloodRiskText = `${riskLevel} Risk (Forcé)`
            } else if (layerKey === 'fire') {
                finalFireRiskText = `${riskLevel} Risk (Forcé)`
            } else if (layerKey === 'vegetation') {
                const forcedO2Percent = riskLevel === 'High' ? 40 : (riskLevel === 'Medium' ? 65 : 85);
                finalO2Text = `Deficit: ${riskLevel} (${forcedO2Percent}% of ref.) (Forcé)`
            } else if (layerKey === 'heat') {
                const forcedTemp = riskLevel === 'High' ? 38 : (riskLevel === 'Medium' ? 32 : 25);
                finalHeatText = `${forcedTemp}°C (Forcé: ${riskLevel})`
            }
            
            // Suggestions (ajustées pour la cohérence)
            const suggestions: string[] = []
            const currentNDVI = vegetation?.ndvi ?? 0.5 
            const fireRiskLevel = layerKey === 'fire' ? riskLevel : fireRisk?.riskLevel
            const floodRiskLevel = layerKey === 'flood' ? riskLevel : flood?.riskLevel
            const heatRiskLevel = layerKey === 'heat' ? riskLevel : (weather?.current?.temperature_2m >= 32 ? 'High' : 'Low')
            const vegetationRiskLevel = layerKey === 'vegetation' ? riskLevel : (currentNDVI < 0.3 ? 'High' : 'Low')

            if (vegetationRiskLevel === 'High' || vegetationRiskLevel === 'Medium') {
                suggestions.push('Increase tree cover to improve NDVI and local cooling.')
            }
            if (fireRiskLevel === 'High' || fireRiskLevel === 'Extreme') {
                suggestions.push('Avoid outdoor burning; prepare mitigation in high-risk zones.')
            }
            if (floodRiskLevel && (floodRiskLevel === 'High' || floodRiskLevel === 'Medium')) {
                suggestions.push('Inspect drainage and prepare sandbags in low-lying areas.')
            }
            if (heatRiskLevel === 'High') {
                suggestions.push('Consider reflective roofs and shaded public spaces to reduce heat.')
            }

            const area: AreaInfo = {
                lat,
                lon: lng,
                name,
                floodRisk: finalFloodRiskText,
                fireRisk: finalFireRiskText,
                heatRisk: finalHeatText,
                airQuality: airText,
                o2Estimate: finalO2Text,
                suggestions,
            }

            onAreaClick(area)
            marker.openPopup()
        })
        
        marker.addTo(targetLayerGroup) // Ajouté au groupe CIBLE
      })
    }
  }

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered on Agadir, Morocco
      const map = L.map('map', {
        center: [30.4278, -9.5981],
        zoom: 12,
        zoomControl: true,
      })

      // Base layer - OpenStreetMap (le seul calque visible par défaut)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Initialisation des calques WMTS (Rasters NASA)
      const today = new Date().toISOString().split('T')[0]
      const firmsLayer = L.tileLayer(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_Day/default/${today}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
        {
          attribution: 'NASA EOSDIS GIBS',
          opacity: 0.7,
          maxZoom: 9,
        }
      )

      const heatLayer = L.tileLayer(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/${today}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
        {
          attribution: 'NASA EOSDIS GIBS',
          opacity: 0.6,
          maxZoom: 7,
        }
      )

      const ndviLayer = L.tileLayer(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${dateStr(forecastDays)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        {
          attribution: 'NASA EOSDIS GIBS',
          opacity: 0.6,
          maxZoom: 6,
        }
      )
      ndviRef.current = ndviLayer

      // Air quality layer (markers)
      const airQualityLayer = L.layerGroup()
      aqiMarkersRef.current = airQualityLayer
      
      // ✅ Initialisation des groupes de calques de marqueurs pour chaque risque
      const fireRiskLayerGroup = L.layerGroup()
      const heatRiskLayerGroup = L.layerGroup()
      const vegetationRiskLayerGroup = L.layerGroup()
      const floodRiskLayerGroup = L.layerGroup()
      
      criticalAreasRefs.current = {
        fire: fireRiskLayerGroup,
        heat: heatRiskLayerGroup,
        vegetation: vegetationRiskLayerGroup,
        flood: floodRiskLayerGroup,
      }

      // Flood precipitation (GPM IMERG) raster inside a layer group
      const floodLayer = L.layerGroup()
      const gpmLayer = L.tileLayer(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/${dateStr(forecastDays, true)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
        {
          attribution: 'NASA EOSDIS GIBS',
          opacity: 0.5,
          maxZoom: 6,
        }
      )
      gpmLayer.addTo(floodLayer) 
      gpmRef.current = gpmLayer

      // Stockage de TOUS les calques pour une gestion centralisée par le 2e useEffect
      layersRef.current = {
        fire: firmsLayer, 
        heat: heatLayer,
        vegetation: ndviLayer,
        airQuality: airQualityLayer, 
        flood: floodLayer, 
      }

      // Click handler -> fetch real backend data and compose AreaInfo
      const normalClickHandler = async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        
        // ✅ CORRECTION 2 : Supprimer l'ancien marqueur s'il existe
        if (locationMarkerRef.current) {
          map.removeLayer(locationMarkerRef.current)
          locationMarkerRef.current = null
        }

        try {
          const qs = `lat=${lat}&lon=${lng}`
          const [vegetation, flood, fireRisk, weather] = await Promise.all([
            fetch(`${API_BASE}/vegetation?${qs}`).then((r) => r.json()).catch(() => null),
            fetch(`${API_BASE}/flood?${qs}`).then((r) => r.json()).catch(() => null),
            fetch(`${API_BASE}/fire-risk?${qs}`).then((r) => r.json()).catch(() => null),
            fetch(`${API_BASE}/weather?${qs}`).then((r) => r.json()).catch(() => null),
          ])

          const name = 'Selected Location'
          const floodRiskText = flood
            ? `${flood.riskLevel} (${Math.round(flood.probability)}% probability)`
            : 'N/A'
          const fireRiskText = fireRisk ? `${fireRisk.riskLevel}` : 'N/A'
          const heatText = weather?.current?.temperature_2m != null
            ? `${Math.round(weather.current.temperature_2m)}°C`
            : 'N/A'
          const airText = weather?.current?.relative_humidity_2m != null
            ? `Humidity ${Math.round(weather.current.relative_humidity_2m)}%`
            : 'N/A'
          const o2Text = vegetation?.o2Estimate != null
            ? `${Math.round(vegetation.o2Estimate)}% of reference`
            : 'N/A'

          const suggestions: string[] = []
          if (vegetation && vegetation.ndvi < 0.3) {
            suggestions.push('Increase tree cover to improve NDVI and local cooling.')
          }
          if (fireRisk && (fireRisk.riskLevel === 'High' || fireRisk.riskLevel === 'Extreme')) {
            suggestions.push('Avoid outdoor burning; prepare mitigation in high-risk zones.')
          }
          if (flood && flood.riskLevel !== 'Low') {
            suggestions.push('Inspect drainage and prepare sandbags in low-lying areas.')
          }
          if (weather?.current?.temperature_2m >= 32) {
            suggestions.push('Consider reflective roofs and shaded public spaces to reduce heat.')
          }

          const area: AreaInfo = {
            lat,
            lon: lng,
            name,
            floodRisk: floodRiskText,
            fireRisk: fireRiskText,
            heatRisk: heatText,
            airQuality: airText,
            o2Estimate: o2Text,
            suggestions,
          }

          onAreaClick(area)

          // Add marker
          const newMarker = L.marker([lat, lng]) 
            .addTo(map)
            .bindPopup(`<b>${name}</b><br/>Lat: ${lat.toFixed(4)}<br/>Lon: ${lng.toFixed(4)}`)
            .openPopup()

          // Stocke le nouveau marqueur pour le prochain clic
          locationMarkerRef.current = newMarker
        } catch (err) {
          console.error('Error fetching environmental data:', err)
        }
      }
      
      // Register the normal click handler
      map.on('click', normalClickHandler)

      // Fetch Air Quality points for current viewport (inchangé)
      async function loadAQI() {
        if (!aqiMarkersRef.current) return
        const bounds = map.getBounds()
        const west = bounds.getWest()
        const south = bounds.getSouth()
        const east = bounds.getEast()
        const north = bounds.getNorth()
        const bbox = `${west.toFixed(4)},${south.toFixed(4)},${east.toFixed(4)},${north.toFixed(4)}`
        try {
          const url = `${API_BASE}/air/points?bbox=${bbox}&parameters=pm25,no2,o3`
          const geo = await fetch(url).then((r) => r.json())
          // clear previous
          aqiMarkersRef.current.clearLayers()
          // add markers
          if (geo?.features?.length) {
            geo.features.forEach((f: any) => {
              const [lon, lat] = f.geometry.coordinates
              const p = f.properties || {}
              const aqi = p.aqi ?? p.pm25 ?? 0
              // Sky-blue style for visibility (bigger and blue)
              const fill = '#87CEEB' // SkyBlue
              const stroke = '#1E90FF' // DodgerBlue
              const marker = L.circleMarker([lat, lon], {
                radius: 10,
                color: stroke,
                fillColor: fill,
                fillOpacity: 0.9,
                weight: 3,
              })
              marker.bindPopup(`AQI: ${aqi}<br/>PM2.5: ${p.pm25 ?? 'n/a'}<br/>NO₂: ${p.no2 ?? 'n/a'}<br/>O₃: ${p.o3 ?? 'n/a'}`)
              marker.addTo(aqiMarkersRef.current!)
            })
          }
        } catch (err) {
          console.error('Failed to load AQI layer', err)
        }
      }

      // Load AQI on move end when layer is enabled
      map.on('moveend', () => {
        if (layers.airQuality) loadAQI()
      })
      
      // Initial AQI load if enabled
      if (layers.airQuality) {
        loadAQI()
      }

      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onAreaClick])

  // Toggle layers based on state, and manage critical area markers
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    Object.entries(layers).forEach(([key, enabled]) => {
      const layer = layersRef.current[key]
      if (!layer) return

      // Identifie la clé du risque et le LayerGroup de marqueurs correspondant
      const riskKey = key as keyof Omit<LayerState, 'airQuality'>
      const riskLayerGroup = criticalAreasRefs.current[riskKey]
      
      // --- Logique d'activation ---
      if (enabled) {
        // 1. Ajoute le calque Raster (WMTS)
        if (!map.hasLayer(layer)) {
            layer.addTo(map)
        }
        
        // 2. Si c'est un calque de risque (pas AQI), ajoute son groupe de marqueurs
        if (key !== 'airQuality' && riskLayerGroup) {
          // Charge/Met à jour les marqueurs pour ce risque spécifique
          loadCriticalAreas(riskKey, riskLayerGroup) 
          
          // Ajoute le groupe de marqueurs à la carte (permet la superposition)
          if (!map.hasLayer(riskLayerGroup)) {
              riskLayerGroup.addTo(map)
          }
        }
        
        // 3. Si c'est le calque AQI, charge les données
        if (key === 'airQuality' && aqiMarkersRef.current) {
          const loadAQI = async () => {
            if (!aqiMarkersRef.current || !mapRef.current) return
            const bounds = mapRef.current.getBounds()
            const west = bounds.getWest()
            const south = bounds.getSouth()
            const east = bounds.getEast()
            const north = bounds.getNorth()
            const bbox = `${west.toFixed(4)},${south.toFixed(4)},${east.toFixed(4)},${north.toFixed(4)}`
            try {
              const url = `${API_BASE}/air/points?bbox=${bbox}&parameters=pm25,no2,o3`
              const geo = await fetch(url).then((r) => r.json())
              aqiMarkersRef.current.clearLayers()
              if (geo?.features?.length) {
                geo.features.forEach((f: any) => {
                  const [lon, lat] = f.geometry.coordinates
                  const p = f.properties || {}
                  const aqi = p.aqi ?? p.pm25 ?? 0
                  // Sky-blue style for visibility (bigger and blue)
                  const fill = '#87CEEB' // SkyBlue
                  const stroke = '#1E90FF' // DodgerBlue
                  const marker = L.circleMarker([lat, lon], {
                    radius: 10,
                    color: stroke,
                    fillColor: fill,
                    fillOpacity: 0.9,
                    weight: 3,
                  })
                  marker.bindPopup(`AQI: ${aqi}<br/>PM2.5: ${p.pm25 ?? 'n/a'}<br/>NO₂: ${p.no2 ?? 'n/a'}<br/>O₃: ${p.o3 ?? 'n/a'}`)
                  marker.addTo(aqiMarkersRef.current!)
                })
              }
            } catch (err) {
              console.error('Failed to load AQI layer', err)
            }
          }
          loadAQI()
        }
        
      // --- Logique de désactivation ---
      } else { // if (!enabled)
        
        // 1. Retire le calque Raster (WMTS)
        if (map.hasLayer(layer)) {
            map.removeLayer(layer)
        }

        // 2. Si c'est un calque de risque, retire son groupe de marqueurs
        if (key !== 'airQuality' && riskLayerGroup) {
          // Retire le groupe de marqueurs de la carte
          if (map.hasLayer(riskLayerGroup)) {
            map.removeLayer(riskLayerGroup)
          }
          // Nettoie les marqueurs (bonne pratique)
          riskLayerGroup.clearLayers()
        }
      }
    })
  }, [layers]) // <- Dépend de l'état des couches

  // Update dated raster layers when forecastDays changes (inchangé)
  useEffect(() => {
    if (!mapRef.current) return
    // Update NDVI
    if (ndviRef.current) {
      ndviRef.current.setUrl(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${dateStr(forecastDays)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`
      )
    }
    // Update GPM
    if (gpmRef.current) {
      gpmRef.current.setUrl(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/${dateStr(forecastDays, true)}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`
      )
    }
  }, [forecastDays])

  // Display chatbot markers on map
  useEffect(() => {
    console.log('🟡 MapContainer: useEffect triggered')
    console.log('🟡 MapContainer: chatbotMarkers:', chatbotMarkers)
    
    const map = mapRef.current
    if (!map) {
      console.log('🔴 MapContainer: Map not ready yet')
      return
    }

    console.log('🟡 MapContainer: Map is ready!')
    console.log('🟡 MapContainer: Number of markers:', chatbotMarkers.length)

    // Initialize chatbot markers layer if needed
    if (!chatbotMarkersLayerRef.current) {
      chatbotMarkersLayerRef.current = L.layerGroup().addTo(map)
      console.log('Created chatbot markers layer')
    }

    // Clear existing markers
    chatbotMarkersLayerRef.current.clearLayers()
    
    // If no markers, return early
    if (chatbotMarkers.length === 0) {
      console.log('🔴 MapContainer: No markers to display')
      return
    }

    console.log('🟢 MapContainer: Starting to add markers...')

    // Add new markers from chatbot with colored areas
    chatbotMarkers.forEach((marker: ChatbotMarker, index: number) => {
      console.log('🟢 MapContainer: Adding marker #' + (index + 1) + ':', marker)
      
      // Add ONE large colored circle to show the area
      console.log('🟢 Creating circle at:', marker.lat, marker.lon)
      const areaCircle = L.circle([marker.lat, marker.lon], {
        radius: 600, // 600 meters radius
        color: '#00ff00', // BRIGHT GREEN border
        fillColor: '#00ff00', // BRIGHT GREEN fill
        fillOpacity: 0.3,
        weight: 6, // THICK solid border
      }).addTo(chatbotMarkersLayerRef.current!)
      console.log('🟢 Circle added successfully')
      
      // Add marker icon in the center (NO LABEL)
      const icon = L.divIcon({
        className: 'chatbot-marker',
        html: `<div style="background: #00ff00; width: 50px; height: 50px; border-radius: 50%; border: 4px solid white; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 6px 12px rgba(0, 255, 0, 0.6); animation: pulse 2s infinite;">🏃</div>`,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      })

      const leafletMarker = L.marker([marker.lat, marker.lon], { icon })
        .bindPopup(`<b>✅ ${marker.label}</b><br/><i>Recommended by AI Assistant</i><br/><br/>📍 Safe zone: 600m radius`)
        .addTo(chatbotMarkersLayerRef.current!)

      // Auto-open first marker popup and zoom
      if (index === 0) {
        leafletMarker.openPopup()
        // Zoom to show the area
        map.setView([marker.lat, marker.lon], 14)
      }
      
      // Add popup to circle
      areaCircle.bindPopup(`<b>${marker.label}</b><br/>Recommended area`)
    })
    
    console.log('🟢 MapContainer: All markers added successfully!')
    console.log('🟢 MapContainer: Total circles created:', chatbotMarkers.length)
    console.log('🟢 MapContainer: Total markers created:', chatbotMarkers.length)
    
    // FORCE zoom to show markers with larger padding
    if (chatbotMarkers.length > 1) {
      const bounds = L.latLngBounds(chatbotMarkers.map(m => [m.lat, m.lon]))
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 }) // Zoom out more
      console.log('🟢 MapContainer: Map bounds fitted to show all markers')
    } else if (chatbotMarkers.length === 1) {
      map.setView([chatbotMarkers[0].lat, chatbotMarkers[0].lon], 12) // Zoom out more
      console.log('🟢 MapContainer: Map centered on single marker')
    }
    
    // Force the layer to the top by re-adding to map
    if (chatbotMarkersLayerRef.current) {
      chatbotMarkersLayerRef.current.addTo(map)
      console.log('🟢 MapContainer: Ensured markers layer is on top')
    }
  }, [chatbotMarkers])

  return <div id="map" className="map-container" />
}