import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, Minimize2, Maximize2 } from 'lucide-react'
import './AIChatbot.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  mapAction?: {
    type: 'show_markers' | 'zoom_to' | 'highlight_area'
    data: any
  } | null
}

interface AIChatbotProps {
  onMapAction: (action: any) => void
}

export default function AIChatbot({ onMapAction }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your environmental assistant. Ask me things like:\n\n• "Where can I go running in the morning?"\n• "Show me areas with best air quality"\n• "Find safe places with low fire risk"\n• "Where has good temperature for outdoor activities?"',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    // Running/jogging queries
    if (lowerQuery.includes('run') || lowerQuery.includes('jog') || lowerQuery.includes('exercise')) {
      return await findBestRunningSpots()
    }
    
    // Air quality queries
    if (lowerQuery.includes('air quality') || lowerQuery.includes('clean air') || lowerQuery.includes('breathe')) {
      return await findBestAirQuality()
    }
    
    // Fire risk queries
    if (lowerQuery.includes('fire') || lowerQuery.includes('safe') && lowerQuery.includes('fire')) {
      return await findLowFireRisk()
    }
    
    // Temperature/heat queries
    if (lowerQuery.includes('cool') || lowerQuery.includes('temperature') || lowerQuery.includes('heat')) {
      return await findCoolAreas()
    }
    
    // Vegetation/parks queries
    if (lowerQuery.includes('park') || lowerQuery.includes('green') || lowerQuery.includes('tree')) {
      return await findGreenSpaces()
    }
    
    // Default response
    return {
      text: 'I can help you find:\n\n• Best places for running (good air + low temp)\n• Areas with best air quality\n• Safe zones (low fire risk)\n• Cool areas for outdoor activities\n• Green spaces and parks\n\nWhat would you like to know?',
      mapAction: null
    }
  }

  const findBestRunningSpots = async () => {
    try {
      // Get current map center (Agadir by default)
      const lat = 30.4278
      const lon = -9.5981
      
      // Fetch weather and air quality data
      const [weather, airQuality] = await Promise.all([
        fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/air/points?bbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}&parameters=pm25`).then(r => r.json()).catch(() => null)
      ])
      
      const temp = weather?.current?.temperature_2m || 25
      const avgAQI = airQuality?.features?.length > 0 
        ? airQuality.features.reduce((sum: number, f: any) => sum + (f.properties?.pm25 || 50), 0) / airQuality.features.length
        : 50
      
      let recommendation = ''
      const markers: any[] = []
      
      if (temp < 25 && avgAQI < 50) {
        recommendation = `🏃‍♂️ Perfect conditions for running!\n\n✅ Temperature: ${temp.toFixed(1)}°C (Cool)\n✅ Air Quality: ${avgAQI.toFixed(0)} AQI (Good)\n\n🟢 Check the map! I've highlighted 3 safe zones with green circles.\n\nBest time: Early morning (6-8 AM)`
        
        // Add markers for recommended spots
        markers.push(
          { lat: 30.4278, lon: -9.5981, label: 'Beach Promenade - Best for sea breeze', type: 'running' },
          { lat: 30.3500, lon: -9.5000, label: 'Souss-Massa Park - Nature trails', type: 'running' },
          { lat: 30.4200, lon: -9.5900, label: 'Valley of Birds - Shaded paths', type: 'running' }
        )
      } else if (temp >= 30) {
        recommendation = `🌡️ Too hot for running right now!\n\nCurrent temp: ${temp.toFixed(1)}°C\n\n💡 Wait until evening (after 6 PM) or tomorrow morning before 8 AM`
      } else if (avgAQI > 100) {
        recommendation = `😷 Poor air quality today!\n\nAQI: ${avgAQI.toFixed(0)} (Unhealthy)\n\n💡 Postpone outdoor exercise. Try indoor activities instead.`
      } else {
        recommendation = `🏃 Decent conditions for running\n\nTemperature: ${temp.toFixed(1)}°C\nAir Quality: ${avgAQI.toFixed(0)} AQI\n\n🟢 Check the map! I've marked the best area with a green circle.\n\nTip: Bring water and avoid peak sun hours`
        
        markers.push(
          { lat: 30.4278, lon: -9.5981, label: 'Beach Area - Cooler by sea', type: 'running' }
        )
      }
      
      return {
        text: recommendation,
        mapAction: markers.length > 0 ? {
          type: 'show_markers' as const,
          data: markers
        } : null
      }
    } catch (error) {
      return {
        text: '❌ Sorry, I couldn\'t fetch the data. Please try again.',
        mapAction: null
      }
    }
  }

  const findBestAirQuality = async () => {
    try {
      const lat = 30.4278
      const lon = -9.5981
      const bbox = `${lon-0.2},${lat-0.2},${lon+0.2},${lat+0.2}`
      
      const airData = await fetch(`${API_BASE}/air/points?bbox=${bbox}&parameters=pm25,no2,o3`).then(r => r.json()).catch(() => null)
      
      if (!airData?.features?.length) {
        return {
          text: '📊 No air quality data available for this area.\n\nTry:\n• Coastal areas (usually cleaner)\n• Parks and green spaces\n• Areas away from traffic',
          mapAction: null
        }
      }
      
      // Find best AQI locations
      const sorted = airData.features
        .map((f: any) => ({
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          aqi: f.properties?.pm25 || 100
        }))
        .sort((a: any, b: any) => a.aqi - b.aqi)
        .slice(0, 3)
      
      const bestAQI = sorted[0].aqi
      let quality = 'Good'
      if (bestAQI > 100) quality = 'Moderate'
      if (bestAQI > 150) quality = 'Unhealthy'
      
      const text = `🌬️ Best Air Quality Spots:\n\n${sorted.map((s: any, i: number) => 
        `${i+1}. AQI: ${s.aqi.toFixed(0)} (${s.aqi < 50 ? 'Excellent' : s.aqi < 100 ? 'Good' : 'Moderate'})`
      ).join('\n')}\n\n✨ Overall: ${quality}\n\n💡 These areas are best for outdoor activities!`
      
      return {
        text,
        mapAction: {
          type: 'show_markers' as const,
          data: sorted.map((s: any, i: number) => ({
            ...s,
            label: `Best AQI #${i+1}`,
            type: 'air_quality'
          }))
        }
      }
    } catch (error) {
      return {
        text: '❌ Error fetching air quality data.',
        mapAction: null
      }
    }
  }

  const findLowFireRisk = async () => {
    const text = `🔥 Fire Risk Assessment:\n\n✅ Safe Areas (Low Risk):\n• Coastal zones near the beach\n• Urban residential areas\n• Irrigated agricultural zones\n\n⚠️ Avoid:\n• Dry forest areas\n• Mountain slopes\n• Areas with dry vegetation\n\n💡 Fire risk is lower:\n• Near water bodies\n• In well-maintained urban areas\n• During cooler months`
    
    return {
      text,
      mapAction: {
        type: 'show_markers' as const,
        data: [
          { lat: 30.4278, lon: -9.5981, label: 'Safe: Beach Area', type: 'safe_zone' },
          { lat: 30.4200, lon: -9.6000, label: 'Safe: City Center', type: 'safe_zone' }
        ]
      }
    }
  }

  const findCoolAreas = async () => {
    try {
      const lat = 30.4278
      const lon = -9.5981
      
      const weather = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => null)
      const temp = weather?.current?.temperature_2m || 25
      
      const text = `🌡️ Temperature Analysis:\n\nCurrent: ${temp.toFixed(1)}°C\n\n❄️ Coolest Areas:\n• Beach promenade (sea breeze)\n• Souss Valley (shade + water)\n• Parks with trees\n\n💡 Tips:\n• Coastal areas are 2-3°C cooler\n• Shaded parks feel 5°C cooler\n• Best time: Early morning or evening`
      
      return {
        text,
        mapAction: {
          type: 'show_markers' as const,
          data: [
            { lat: 30.4278, lon: -9.5981, label: 'Cool: Beach', type: 'cool_spot' },
            { lat: 30.4200, lon: -9.5900, label: 'Cool: Valley Park', type: 'cool_spot' }
          ]
        }
      }
    } catch (error) {
      return {
        text: '❌ Error fetching temperature data.',
        mapAction: null
      }
    }
  }

  const findGreenSpaces = async () => {
    const text = `🌳 Green Spaces & Parks:\n\n🏞️ Recommended:\n• Valley of the Birds\n• Olhão Garden\n• Souss-Massa National Park\n• Beach promenade gardens\n\n✨ Benefits:\n• Better air quality\n• Lower temperature\n• Peaceful environment\n• Great for exercise\n\n📍 I'll mark them on the map!`
    
    return {
      text,
      mapAction: {
        type: 'show_markers' as const,
        data: [
          { lat: 30.4200, lon: -9.5900, label: 'Valley of the Birds', type: 'park' },
          { lat: 30.4250, lon: -9.5950, label: 'Olhão Garden', type: 'park' },
          { lat: 30.3500, lon: -9.5000, label: 'Souss-Massa Park', type: 'park' }
        ]
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await analyzeQuery(input)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        mapAction: response.mapAction
      }

      setMessages(prev => [...prev, botMessage])
      
      // Trigger map action if any
      console.log('🟢 Chatbot: Response mapAction:', response.mapAction)
      if (response.mapAction) {
        console.log('🟢 Chatbot: Calling onMapAction with:', response.mapAction)
        console.log('🟢 Chatbot: Markers to send:', response.mapAction.data)
        onMapAction(response.mapAction)
        console.log('🟢 Chatbot: onMapAction called successfully')
      } else {
        console.log('🔴 Chatbot: No mapAction to send')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isMinimized) {
    return (
      <div className="chatbot-minimized" onClick={() => setIsMinimized(false)}>
        <Bot size={24} />
        <span>AI Assistant</span>
      </div>
    )
  }

  return (
    <div className={`chatbot-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-title">
          <Bot size={20} />
          <span>AI Environmental Assistant</span>
        </div>
        <div className="chatbot-controls">
          <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Minimize' : 'Expand'}>
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setIsMinimized(true)} title="Hide">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">
              {msg.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything... (e.g., 'Where can I run?')"
          rows={2}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
