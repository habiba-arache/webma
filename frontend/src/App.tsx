import { useState, useCallback, lazy, Suspense } from 'react'
import TopNav from './components/TopNav'
import LayerToggle from './components/LayerToggle'
import AlertsBar from './components/AlertsBar'
import ForecastSlider from './components/ForecastSlider'
import AIChatbot from './components/AIChatbot'
import './App.css'

// Lazy load heavy map components
const MapContainer = lazy(() => import('./components/MapContainer'))
const MapboxMap = lazy(() => import('./components/MapboxMap'))
const InfoPanel = lazy(() => import('./components/InfoPanel'))

export interface LayerState {
  flood: boolean
  fire: boolean
  heat: boolean
  airQuality: boolean
  vegetation: boolean
}

export interface ChatbotMarker {
  lat: number
  lon: number
  label: string
  type: string
}

export interface AreaInfo {
  lat: number
  lon: number
  name: string
  floodRisk: string
  fireRisk: string
  heatRisk: string
  airQuality: string
  o2Estimate: string
  suggestions: string[]
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [layers, setLayers] = useState<LayerState>({
    flood: false,
    fire: false,
    heat: false,
    airQuality: false,
    vegetation: false,
  })
  const [selectedArea, setSelectedArea] = useState<AreaInfo | null>(null)
  const hasMapbox = Boolean((import.meta as any).env?.VITE_MAPBOX_TOKEN)
  const [forecastDays, setForecastDays] = useState<number>(0)
  const [chatbotMarkers, setChatbotMarkers] = useState<ChatbotMarker[]>([])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [theme])

  const toggleLayer = useCallback((layer: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const handleAreaClick = useCallback((area: AreaInfo) => {
    setSelectedArea(area)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedArea(null)
  }, [])

  const handleChatbotMapAction = useCallback((action: any) => {
    console.log('🔵 App: Map action received:', action)
    if (action && action.type === 'show_markers') {
      console.log('🔵 App: Setting markers:', action.data)
      console.log('🔵 App: Number of markers:', action.data.length)
      setChatbotMarkers(action.data)
      
      // Force a re-render by logging the state after setting
      setTimeout(() => {
        console.log('🔵 App: Markers state updated')
      }, 100)
    }
  }, [])

  return (
    <div className="app">
      <TopNav theme={theme} onToggleTheme={toggleTheme} />
      <AlertsBar />
      <div className="main-content" style={{ position: 'relative' }}>
        <LayerToggle layers={layers} onToggleLayer={toggleLayer} />
        <Suspense fallback={<div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>}>
          {hasMapbox ? (
            <MapboxMap layers={layers} onAreaClick={handleAreaClick} forecastDays={forecastDays} chatbotMarkers={chatbotMarkers} />
          ) : (
            <MapContainer layers={layers} onAreaClick={handleAreaClick} forecastDays={forecastDays} chatbotMarkers={chatbotMarkers} />
          )}
          {selectedArea && (
            <InfoPanel area={selectedArea} onClose={handleClosePanel} />
          )}
        </Suspense>
       </div>
      <AIChatbot onMapAction={handleChatbotMapAction} />
    </div>
  )
}

export default App
